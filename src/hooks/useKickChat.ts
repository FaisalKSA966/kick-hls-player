import { useCallback, useEffect, useRef, useState } from "react";
import { fetchChannel, type KickChannel } from "../lib/kickApi";
import {
  appendMessages,
  createSession,
  endSession,
  listSessionsForStream,
  readMessagesUpTo,
  type ChatSession,
  type StoredChatMessage,
} from "../lib/chatStore";
import { connectKickChat, type PusherChatHandle } from "../lib/pusherChat";

export interface DisplayChatMessage {
  id: string;
  username: string;
  color?: string;
  content: string;
  badges?: { type: string; text?: string }[];
  receivedAt: number;
  offsetSec?: number;
}

export type ChatMode = "off" | "live" | "record" | "replay";

export interface UseKickChatArgs {
  streamId: string;
  channel?: string;
  isLive: boolean;
  currentTime: number;
  active: boolean;
}

export interface UseKickChatState {
  mode: ChatMode;
  status: "idle" | "loading" | "connected" | "error" | "no_recording";
  error: string | null;
  channelInfo: KickChannel | null;
  messages: DisplayChatMessage[];
  recording: boolean;
  recordedCount: number;
  sessions: ChatSession[];
  selectedSession: ChatSession | null;
  setSelectedSession: (s: ChatSession | null) => void;
  setMode: (m: ChatMode) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

const MAX_LIVE_MESSAGES = 200;

export function useKickChat(args: UseKickChatArgs): UseKickChatState {
  const { streamId, channel, isLive, currentTime, active } = args;
  const [mode, setMode] = useState<ChatMode>("off");
  const [status, setStatus] = useState<UseKickChatState["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [channelInfo, setChannelInfo] = useState<KickChannel | null>(null);
  const [messages, setMessages] = useState<DisplayChatMessage[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordedCount, setRecordedCount] = useState(0);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  const wsRef = useRef<PusherChatHandle | null>(null);
  const recordingRef = useRef(false);
  const sessionRef = useRef<ChatSession | null>(null);
  const recordedRef = useRef(0);
  const recordBufferRef = useRef<Omit<StoredChatMessage, "key" | "sessionId">[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastReplayUpToRef = useRef(-1);

  // Auto-pick mode based on live/VOD when activated.
  useEffect(() => {
    if (!active) {
      setMode("off");
      return;
    }
    if (mode === "off") {
      setMode(isLive ? "live" : "replay");
    }
  }, [active, isLive, mode]);

  // Load channel info + recorded sessions.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    if (channel) {
      setStatus("loading");
      fetchChannel(channel)
        .then((c) => {
          if (cancelled) return;
          setChannelInfo(c);
          setError(null);
        })
        .catch((e: Error) => {
          if (cancelled) return;
          setError(`ما قدرنا نجيب بيانات قناة "${channel}" — ${e.message}`);
          setChannelInfo(null);
          setStatus("error");
        });
    } else {
      setChannelInfo(null);
    }
    listSessionsForStream(streamId)
      .then((s) => {
        if (cancelled) return;
        setSessions(s);
        if (s.length > 0) setSelectedSession((cur) => cur ?? s[0]);
        else setSelectedSession(null);
      })
      .catch(() => {
        if (cancelled) return;
        setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [streamId, channel, active]);

  // Live / record connection.
  useEffect(() => {
    if (!active) return;
    if ((mode !== "live" && mode !== "record") || !channelInfo?.chatroom?.id) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    setStatus("loading");
    const handle = connectKickChat(channelInfo.chatroom.id, (e) => {
      if (e.kind === "open") {
        setStatus("connected");
        setError(null);
      } else if (e.kind === "error") {
        setStatus("error");
        setError("WebSocket error — جاري إعادة المحاولة");
      } else if (e.kind === "close") {
        setStatus("loading");
      } else if (e.kind === "message") {
        const m = e.message;
        const display: DisplayChatMessage = {
          id: m.id,
          username: m.sender.username,
          color: m.sender.color,
          content: m.content,
          badges: m.sender.badges,
          receivedAt: Date.now(),
        };
        setMessages((prev) => {
          const next = [...prev, display];
          return next.length > MAX_LIVE_MESSAGES
            ? next.slice(-MAX_LIVE_MESSAGES)
            : next;
        });
        if (recordingRef.current && sessionRef.current) {
          const offsetSec =
            (Date.now() - sessionRef.current.startedAt) / 1000;
          recordBufferRef.current.push({
            offsetSec,
            username: display.username,
            color: display.color,
            content: display.content,
            badges: display.badges,
            receivedAt: display.receivedAt,
          });
          recordedRef.current += 1;
          setRecordedCount(recordedRef.current);
        }
      }
    });
    wsRef.current = handle;

    return () => {
      handle.close();
      wsRef.current = null;
    };
  }, [active, mode, channelInfo?.chatroom?.id]);

  // Periodically flush recorded buffer to IndexedDB.
  useEffect(() => {
    if (!recording) return;
    flushTimerRef.current = setInterval(() => {
      const session = sessionRef.current;
      if (!session || recordBufferRef.current.length === 0) return;
      const batch = recordBufferRef.current;
      recordBufferRef.current = [];
      void appendMessages(session.id, batch);
    }, 4000);
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    };
  }, [recording]);

  // Replay: load messages up to currentTime.
  useEffect(() => {
    if (!active || mode !== "replay") return;
    const sess = selectedSession;
    if (!sess) {
      setStatus("no_recording");
      setMessages([]);
      return;
    }
    setStatus("connected");
    const upTo = Math.floor(currentTime);
    if (upTo === lastReplayUpToRef.current) return;
    const wasSeekBack = upTo < lastReplayUpToRef.current;
    lastReplayUpToRef.current = upTo;
    if (wasSeekBack) {
      void readMessagesUpTo(sess.id, upTo).then((rows) =>
        setMessages(rows.slice(-MAX_LIVE_MESSAGES).map(toDisplay)),
      );
      return;
    }
    void readMessagesUpTo(sess.id, upTo, Math.max(0, upTo - 30)).then((rows) => {
      if (rows.length === 0) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const incoming = rows.filter((r) => !seen.has(r.key)).map(toDisplay);
        const next = [...prev, ...incoming];
        return next.length > MAX_LIVE_MESSAGES
          ? next.slice(-MAX_LIVE_MESSAGES)
          : next;
      });
    });
  }, [active, mode, selectedSession, currentTime]);

  // Reset on stream change.
  useEffect(() => {
    setMessages([]);
    setRecordedCount(0);
    recordedRef.current = 0;
    recordBufferRef.current = [];
    lastReplayUpToRef.current = -1;
  }, [streamId]);

  const startRecording = useCallback(async () => {
    if (!channelInfo?.chatroom?.id || !channel) {
      setError("ما فيه قناة لتسجيل شاتها — ضيف اسم القناة في تفاصيل البث");
      return;
    }
    const session = await createSession(streamId, channel, channelInfo.chatroom.id);
    sessionRef.current = session;
    recordedRef.current = 0;
    setRecordedCount(0);
    setRecording(true);
    recordingRef.current = true;
    setMode("record");
    setSessions((prev) => [session, ...prev]);
    setSelectedSession(session);
  }, [channel, channelInfo?.chatroom?.id, streamId]);

  const stopRecording = useCallback(async () => {
    recordingRef.current = false;
    setRecording(false);
    const sess = sessionRef.current;
    if (sess) {
      if (recordBufferRef.current.length > 0) {
        await appendMessages(sess.id, recordBufferRef.current);
        recordBufferRef.current = [];
      }
      await endSession(sess.id, recordedRef.current);
      sessionRef.current = null;
      const refreshed = await listSessionsForStream(streamId);
      setSessions(refreshed);
    }
  }, [streamId]);

  return {
    mode,
    status,
    error,
    channelInfo,
    messages,
    recording,
    recordedCount,
    sessions,
    selectedSession,
    setSelectedSession,
    setMode,
    startRecording,
    stopRecording,
  };
}

function toDisplay(m: StoredChatMessage): DisplayChatMessage {
  return {
    id: m.key,
    username: m.username,
    color: m.color,
    content: m.content,
    badges: m.badges,
    receivedAt: m.receivedAt,
    offsetSec: m.offsetSec,
  };
}

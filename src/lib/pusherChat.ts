// Minimal Pusher-protocol WebSocket client tailored to Kick's public chat
// channel. Subscribes to `chatrooms.{id}.v2` and emits chat events. No
// authentication needed — these are public channels.

const PUSHER_KEY = "32cbd69e4b950bf97679";
const PUSHER_CLUSTER = "us2";
const PROTOCOL = 7;
const CLIENT = "kick-hls-player";
const VERSION = "1.0.0";

export interface PusherChatBadge {
  type: string;
  text?: string;
  count?: number;
}

export interface PusherChatMessage {
  id: string;
  chatroomId: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    color?: string;
    badges?: PusherChatBadge[];
  };
}

type Listener =
  | { kind: "open" }
  | { kind: "close" }
  | { kind: "error"; error: unknown }
  | { kind: "message"; message: PusherChatMessage };

export interface PusherChatHandle {
  close: () => void;
  isOpen: () => boolean;
}

interface PusherEnvelope {
  event: string;
  channel?: string;
  data?: string;
}

interface KickChatEventData {
  id: string;
  chatroom_id: number;
  content: string;
  type?: string;
  created_at: string;
  sender: {
    id: number;
    username: string;
    slug?: string;
    identity?: {
      color?: string | null;
      badges?: PusherChatBadge[];
    };
  };
}

export function connectKickChat(
  chatroomId: number,
  onEvent: (e: Listener) => void,
): PusherChatHandle {
  const url = `wss://ws-${PUSHER_CLUSTER}.pusher.com/app/${PUSHER_KEY}?protocol=${PROTOCOL}&client=${CLIENT}&version=${VERSION}&flash=false`;

  let socket: WebSocket | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;

  const open = () => {
    socket = new WebSocket(url);

    socket.onopen = () => {
      reconnectAttempts = 0;
      onEvent({ kind: "open" });
    };

    socket.onerror = (e) => {
      onEvent({ kind: "error", error: e });
    };

    socket.onclose = () => {
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      onEvent({ kind: "close" });
      if (!closed) {
        const delay = Math.min(15000, 1000 * 2 ** reconnectAttempts);
        reconnectAttempts += 1;
        reconnectTimer = setTimeout(open, delay);
      }
    };

    socket.onmessage = (ev) => {
      let env: PusherEnvelope;
      try {
        env = JSON.parse(ev.data) as PusherEnvelope;
      } catch {
        return;
      }
      if (env.event === "pusher:connection_established") {
        socket?.send(
          JSON.stringify({
            event: "pusher:subscribe",
            data: { auth: "", channel: `chatrooms.${chatroomId}.v2` },
          }),
        );
        pingTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ event: "pusher:ping", data: {} }));
          }
        }, 30000);
        return;
      }
      if (env.event === "pusher:ping") {
        socket?.send(JSON.stringify({ event: "pusher:pong", data: {} }));
        return;
      }
      if (
        env.event === "App\\Events\\ChatMessageEvent" ||
        env.event === "App\\Events\\ChatMessageSentEvent"
      ) {
        if (typeof env.data !== "string") return;
        try {
          const data = JSON.parse(env.data) as KickChatEventData;
          if (!data?.id || !data?.content) return;
          onEvent({
            kind: "message",
            message: {
              id: data.id,
              chatroomId: data.chatroom_id,
              content: data.content,
              createdAt: data.created_at,
              sender: {
                id: data.sender.id,
                username: data.sender.username,
                color: data.sender.identity?.color ?? undefined,
                badges: data.sender.identity?.badges,
              },
            },
          });
        } catch {
          // ignore malformed message
        }
      }
    };
  };

  open();

  return {
    close: () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingTimer) clearInterval(pingTimer);
      try {
        socket?.close();
      } catch {
        // ignore
      }
    },
    isOpen: () => socket?.readyState === WebSocket.OPEN,
  };
}

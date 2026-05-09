import type { PlayerSettings, SavedStream } from "./types";

const STREAMS_KEY = "kick-player.streams.v1";
const SETTINGS_KEY = "kick-player.settings.v1";
const ACTIVE_KEY = "kick-player.active.v1";

export function loadStreams(): SavedStream[] {
  try {
    const raw = localStorage.getItem(STREAMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedStream[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveStreams(streams: SavedStream[]): void {
  localStorage.setItem(STREAMS_KEY, JSON.stringify(streams));
}

export function upsertStream(stream: SavedStream): SavedStream[] {
  const streams = loadStreams();
  const idx = streams.findIndex((s) => s.id === stream.id);
  if (idx >= 0) streams[idx] = stream;
  else streams.unshift(stream);
  saveStreams(streams);
  return streams;
}

export function removeStream(id: string): SavedStream[] {
  const streams = loadStreams().filter((s) => s.id !== id);
  saveStreams(streams);
  return streams;
}

export function updateStreamProgress(
  id: string,
  lastPosition: number,
  duration: number,
): SavedStream[] {
  const streams = loadStreams();
  const idx = streams.findIndex((s) => s.id === id);
  if (idx >= 0) {
    streams[idx] = {
      ...streams[idx],
      lastPosition,
      duration: duration || streams[idx].duration,
      lastPlayedAt: Date.now(),
    };
    saveStreams(streams);
  }
  return streams;
}

const DEFAULT_SETTINGS: PlayerSettings = {
  volume: 1,
  muted: false,
  speed: 1,
  preferredQuality: -1,
};

export function loadSettings(): PlayerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<PlayerSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: PlayerSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function generateId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const KICK_DOMAINS = ["stream.kick.com", "cloudfront.net", "d26yk4zpyhjeeq.cloudfront.net"];

export function detectStreamMeta(url: string): { name: string; isLive: boolean } {
  let host = "";
  try {
    host = new URL(url).host;
  } catch {
    host = "";
  }

  const isLive = host.includes("stream.kick.com");
  const isVod = host.includes("cloudfront.net");

  let name = "بث جديد";
  if (isLive) {
    const match = url.match(/\/v1\/(\d+)\//) || url.match(/\/ivs\/v1\/(\d+)/);
    name = match ? `بث Kick مباشر • ${match[1].slice(-6)}` : "بث Kick مباشر";
  } else if (isVod) {
    const match = url.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
    name = match ? `Kick VOD • ${match[1].slice(0, 8)}` : "Kick VOD";
  } else if (host) {
    name = `بث • ${host}`;
  }

  return { name, isLive };
}

export function isLikelyKickUrl(url: string): boolean {
  try {
    const host = new URL(url).host;
    return KICK_DOMAINS.some((d) => host.includes(d)) || url.endsWith(".m3u8");
  } catch {
    return false;
  }
}

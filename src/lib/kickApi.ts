// Thin wrapper around Kick's internal v2 API. Routed through the Vite dev
// proxy at /kick-api/* so the browser can hit it without CORS issues.
// Note: in production builds the proxy doesn't exist, so these calls run
// best-effort against kick.com directly and may fail behind Cloudflare.

const PROXY_PREFIX = import.meta.env.DEV ? "/kick-api" : "https://kick.com/api";

export interface KickChannel {
  id: number;
  user_id: number;
  slug: string;
  is_banned: boolean;
  playback_url?: string;
  user?: {
    username: string;
    profile_pic?: string | null;
  };
  chatroom?: {
    id: number;
    chatable_id: number;
    chatable_type: string;
    slow_mode?: boolean;
  };
  livestream?: {
    id: number;
    is_live: boolean;
    session_title?: string;
    start_time?: string;
  } | null;
}

export interface KickIdentityBadge {
  type: string;
  text?: string;
  count?: number;
  active?: boolean;
}

export interface KickChatMessage {
  id: string;
  chatroom_id: number;
  content: string;
  type: string;
  created_at: string;
  sender: {
    id: number;
    slug?: string;
    username: string;
    identity?: {
      color?: string | null;
      badges?: KickIdentityBadge[];
    };
  };
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${PROXY_PREFIX}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Kick API ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

export function fetchChannel(slug: string): Promise<KickChannel> {
  return getJson<KickChannel>(`/v2/channels/${encodeURIComponent(slug)}`);
}

export interface KickMessagesResponse {
  status: { error: boolean; code: number; message: string };
  data: {
    messages: KickChatMessage[];
    cursor?: string;
  };
}

// Cursor is the ISO timestamp of the oldest message in the previous page.
export function fetchMessagesBefore(
  chatroomId: number,
  cursorIso?: string,
): Promise<KickMessagesResponse> {
  const q = cursorIso ? `?cursor=${encodeURIComponent(cursorIso)}` : "";
  return getJson<KickMessagesResponse>(
    `/v2/channels/${chatroomId}/messages${q}`,
  );
}

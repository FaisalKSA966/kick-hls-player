// IndexedDB-backed store for recorded VOD chat messages.
// Each "session" is one stream URL we recorded chat for. Messages are stored
// with `offsetSec` (seconds since the broadcast started) so they can be
// replayed in sync with the VOD timeline.

const DB_NAME = "kick-player.chat";
const DB_VERSION = 1;
const STORE_SESSIONS = "sessions";
const STORE_MESSAGES = "messages";

export interface ChatSession {
  id: string;
  streamId: string;
  channel: string;
  chatroomId: number;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
}

export interface StoredChatMessage {
  key: string;
  sessionId: string;
  offsetSec: number;
  username: string;
  color?: string;
  content: string;
  badges?: { type: string; text?: string }[];
  receivedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const s = db.createObjectStore(STORE_SESSIONS, { keyPath: "id" });
        s.createIndex("streamId", "streamId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        const m = db.createObjectStore(STORE_MESSAGES, { keyPath: "key" });
        m.createIndex("sessionId", "sessionId", { unique: false });
        m.createIndex("offsetSec", "offsetSec", { unique: false });
        m.createIndex("session_offset", ["sessionId", "offsetSec"], {
          unique: false,
        });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(
  db: IDBDatabase,
  stores: string[],
  mode: IDBTransactionMode = "readonly",
) {
  return db.transaction(stores, mode);
}

export async function createSession(
  streamId: string,
  channel: string,
  chatroomId: number,
): Promise<ChatSession> {
  const db = await openDb();
  const session: ChatSession = {
    id: `${streamId}__${Date.now()}`,
    streamId,
    channel,
    chatroomId,
    startedAt: Date.now(),
    messageCount: 0,
  };
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_SESSIONS], "readwrite");
    t.objectStore(STORE_SESSIONS).put(session);
    t.oncomplete = () => resolve(session);
    t.onerror = () => reject(t.error);
  });
}

export async function endSession(sessionId: string, count: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_SESSIONS], "readwrite");
    const store = t.objectStore(STORE_SESSIONS);
    const getReq = store.get(sessionId);
    getReq.onsuccess = () => {
      const s = getReq.result as ChatSession | undefined;
      if (s) {
        s.endedAt = Date.now();
        s.messageCount = count;
        store.put(s);
      }
    };
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

export async function listSessionsForStream(streamId: string): Promise<ChatSession[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_SESSIONS]);
    const idx = t.objectStore(STORE_SESSIONS).index("streamId");
    const out: ChatSession[] = [];
    const req = idx.openCursor(IDBKeyRange.only(streamId));
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        out.push(cur.value as ChatSession);
        cur.continue();
      } else {
        resolve(out.sort((a, b) => b.startedAt - a.startedAt));
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function appendMessages(
  sessionId: string,
  rows: Omit<StoredChatMessage, "key" | "sessionId">[],
): Promise<void> {
  if (rows.length === 0) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_MESSAGES], "readwrite");
    const store = t.objectStore(STORE_MESSAGES);
    let i = 0;
    for (const r of rows) {
      const key = `${sessionId}__${r.receivedAt}__${i++}`;
      store.put({ ...r, sessionId, key });
    }
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

export async function readMessagesUpTo(
  sessionId: string,
  upToSec: number,
  fromSec = 0,
): Promise<StoredChatMessage[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_MESSAGES]);
    const idx = t.objectStore(STORE_MESSAGES).index("session_offset");
    const range = IDBKeyRange.bound([sessionId, fromSec], [sessionId, upToSec]);
    const out: StoredChatMessage[] = [];
    const req = idx.openCursor(range);
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        out.push(cur.value as StoredChatMessage);
        cur.continue();
      } else {
        resolve(out);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_SESSIONS, STORE_MESSAGES], "readwrite");
    t.objectStore(STORE_SESSIONS).delete(sessionId);
    const idx = t.objectStore(STORE_MESSAGES).index("sessionId");
    const req = idx.openCursor(IDBKeyRange.only(sessionId));
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        cur.delete();
        cur.continue();
      }
    };
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

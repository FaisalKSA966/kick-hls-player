export interface SavedStream {
  id: string;
  name: string;
  url: string;
  addedAt: number;
  lastPlayedAt: number;
  lastPosition: number;
  duration: number;
  isLive: boolean;
}

export interface PlayerSettings {
  volume: number;
  muted: boolean;
  speed: number;
  preferredQuality: number;
}

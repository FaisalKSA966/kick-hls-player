export interface SavedStream {
  id: string;
  name: string;
  url: string;
  addedAt: number;
  lastPlayedAt: number;
  lastPosition: number;
  duration: number;
  isLive: boolean;
  isFavorite?: boolean;
  notes?: string;
  channel?: string;
  videoId?: string;
}

export interface PlayerSettings {
  volume: number;
  muted: boolean;
  speed: number;
  preferredQuality: number;
  theatre?: boolean;
  ambient?: boolean;
  autoResume?: boolean;
}

export interface ReelAudioBeat {
  start: number;
  duration: number;
}

export interface ReelAudioAsset {
  file: string;
  duration: number;
  contentHash: string;
  voice: string;
  beats: ReelAudioBeat[];
}

export interface ReelAudioManifest {
  version: number;
  generatedAt: string;
  codec: string;
  sampleRate: number;
  reels: Record<string, ReelAudioAsset>;
}

let manifest: Promise<ReelAudioManifest | null> | null = null;

export function loadReelAudio(): Promise<ReelAudioManifest | null> {
  manifest ??= fetch("/reels/audio/manifest.json?v=1", { cache: "reload" })
    .then((response) => response.ok ? response.json() as Promise<ReelAudioManifest> : null)
    .catch(() => null);
  return manifest;
}

export function reelAudioUrl(asset: ReelAudioAsset): string {
  const version = encodeURIComponent(asset.contentHash.slice(0, 24));
  return `/reels/audio/${asset.file}?v=${version}`;
}

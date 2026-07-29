interface Cue {
  lecture: string;
  start: number;
  duration: number;
}

interface LectureAsset {
  file: string;
  duration: number;
  contentHash: string;
}

interface VoicePackManifest {
  version: number;
  voice: string;
  codec: string;
  sampleRate: number;
  lectures: Record<string, LectureAsset>;
  entries: Record<string, Cue>;
}

const PACK_VOICES = new Set(["af_heart"]);
const manifests = new Map<string, Promise<VoicePackManifest | null>>();
const lectures = new Map<string, Promise<AudioBuffer>>();
const packedBuffers = new WeakSet<AudioBuffer>();
const MAX_DECODED_LECTURES = 3;

export const isPackedVoice = (voice: string): boolean => PACK_VOICES.has(voice);
export const isPackedBuffer = (buffer: AudioBuffer): boolean => packedBuffers.has(buffer);

async function manifestFor(voice: string): Promise<VoicePackManifest | null> {
  if (!isPackedVoice(voice)) return null;
  let pending = manifests.get(voice);
  if (!pending) {
    pending = fetch(`/voice-packs/${voice}/manifest.json`, { cache: "no-cache" })
      .then((response) => response.ok ? response.json() as Promise<VoicePackManifest> : null)
      .catch(() => null);
    manifests.set(voice, pending);
  }
  return pending;
}

async function lectureAudio(
  voice: string,
  lecture: string,
  file: string,
  context: AudioContext,
): Promise<AudioBuffer> {
  const key = `${voice}|${lecture}`;
  let pending = lectures.get(key);
  if (!pending) {
    pending = fetch(`/voice-packs/${voice}/${file}`, { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Voice pack lecture unavailable (${response.status})`);
        return context.decodeAudioData(await response.arrayBuffer());
      });
    lectures.set(key, pending);
    void pending.catch(() => lectures.delete(key));
    while (lectures.size > MAX_DECODED_LECTURES) {
      const oldest = lectures.keys().next().value as string;
      if (oldest === key) break;
      lectures.delete(oldest);
    }
  }
  return pending;
}

export async function packedAudioFor(
  text: string,
  voice: string,
  context: AudioContext,
): Promise<AudioBuffer | null> {
  const manifest = await manifestFor(voice);
  const cue = manifest?.entries[text];
  if (!manifest || !cue) return null;
  const lecture = manifest.lectures[cue.lecture];
  if (!lecture) return null;

  const source = await lectureAudio(voice, cue.lecture, lecture.file, context);
  const first = Math.max(0, Math.round(cue.start * source.sampleRate));
  const frames = Math.min(
    source.length - first,
    Math.max(1, Math.round(cue.duration * source.sampleRate)),
  );
  if (frames <= 0) return null;

  const clip = context.createBuffer(source.numberOfChannels, frames, source.sampleRate);
  for (let channel = 0; channel < source.numberOfChannels; channel += 1) {
    clip.copyToChannel(source.getChannelData(channel).subarray(first, first + frames), channel);
  }
  packedBuffers.add(clip);
  return clip;
}

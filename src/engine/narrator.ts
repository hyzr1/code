/**
 * Speech, using the browser's built-in synthesiser.
 *
 * No API key, no network, works offline, nothing to download. The trade is
 * voice quality — it's clear rather than pleasant. Swapping in a hosted
 * neural voice later means replacing `speak` and nothing else, which is why
 * the surface here is four functions.
 *
 * That swap has now happened — see `./neural` — and the four functions held.
 * Importing it here is cheap: the model and the ONNX runtime sit behind a
 * dynamic import inside that module, so nothing heavy loads until someone
 * actually turns the natural voice on.
 */
import * as neural from "./neural";

/**
 * Abbreviations run first, because every one of them ends in a full stop and
 * the sentence splitter downstream would otherwise cut "e.g." in half and
 * leave a one-word utterance behind.
 */
const ABBREVIATIONS: [RegExp, string][] = [
  [/\be\.g\.\s*/gi, "for example, "],
  [/\bi\.e\.\s*/gi, "that is, "],
  [/\betc\.(?=\s|$)/gi, "and so on"],
  [/\bvs\.?(?=\s)/gi, "versus"],
  [/\bapprox\.\s*/gi, "roughly "],
];

const SPOKEN: [RegExp, string][] = [
  // Multi-character operators first — a bare `=` rule would wreck them.
  [/===/g, " triple equals "],
  [/!==/g, " not equals "],
  [/==/g, " double equals "],
  [/=>/g, " arrow "],
  // Compound assignment. Unmapped, `+= 1` is read as a pause and a one.
  [/\+=/g, " plus equals "],
  [/-=/g, " minus equals "],
  [/\*=/g, " times equals "],
  [/&&/g, " and and "],
  [/\|\|/g, " or or "],
  [/\?\?/g, " double question mark "],
  [/\?\./g, " question dot "],
  // `...` is two different things. After a bracket or comma it's spread or
  // rest, and "spread" is the word a person says. Anywhere else it's an
  // ellipsis, where the only correct reading is a pause.
  [/([[({,]\s*)\.\.\.(?=[\w"'[{])/g, "$1spread "],
  [/\.\.\./g, ", "],
  [/\+\+/g, " plus plus "],
  // A private field. Unmapped, this is read as "number sign".
  [/#(?=\w)/g, "hash "],

  // A template literal, read the way a person reads one: the hole becomes the
  // thing inside it, and the backticks are silent. Unmapped, `${name}` comes
  // out as "dollar" and the rest is swallowed as punctuation.
  [/\$\{\s*\}/g, " dollar brace "],
  [/\$\{([^}]+)\}/g, "$1"],
  [/\$\{/g, " dollar brace "],
  [/`/g, ""],

  // Maths. Left unmapped, a synthesiser either skips these or spells them out
  // as punctuation — "ten star five" is not a sentence anyone says.
  // `\S` rather than `\w` on the left: `(2 + 3) * 4` has a bracket there.
  [/(\S)\s*\*\s*(?=[\w(])/g, "$1 times "],
  [/(\d)\s*\/\s*(\d)/g, "$1 divided by $2"],
  // `try/catch`, `keys/values/entries` — a slash between words is a breath,
  // not the word "slash".
  [/([a-z])\/([a-z])/gi, "$1 $2"],
  [/(\w)\s*\+\s*(\w)/g, "$1 plus $2"],
  [/(\d)\s*-\s*(\d)/g, "$1 minus $2"],
  [/(\w)\s+-\s+(\d)/g, "$1 minus $2"],
  [/(\w)\s*=\s*(\w)/g, "$1 equals $2"],
  // Comparison is named as often as it is used — `` `<` and `>` on strings ``
  // has no operands at all. So map the symbol itself rather than the pair,
  // which read one of them aloud and left the other silent.
  [/>=/g, " greater than or equal to "],
  [/<=/g, " less than or equal to "],
  [/</g, " less than "],
  [/>/g, " greater than "],

  // `scores[0]` reads as "scores zero" otherwise, which loses the whole point.
  [/(\w)\[(\d+)\]/g, "$1 index $2"],
  // A negative index or literal — `.at(-1)` is meaningless read as "at one".
  [/(^|[\s(,[])-(?=\d)/g, "$1minus "],
  // Arithmetic minus the digit-pair rule misses, as in `charCodeAt(0) - 97`.
  [/(\S)\s+-\s+(?=[\w(])/g, "$1 minus "],
  // The empty string is a value with a name. Read as punctuation it is silent,
  // so `join("")` comes out as `join` and the whole point disappears.
  [/""/g, " empty string "],

  // Only negation, never punctuation — a blanket rule turns "Wow!" into
  // "Wow not", and the content is full of emphatic sentences.
  [/!(?=[\w(])/g, "not "],
  // Likewise: spaced `%` is the operator, attached `%` is a percentage.
  [/(\w)\s+%\s+(\w)/g, "$1 mod $2"],
  [/(\d)\s*%(?!\w)/g, "$1 percent"],

  [/\bNaN\b/g, "nan"],
  [/\bJS\b/g, "JavaScript"],
  [/\bO\(n²\)/g, "O of n squared"],
  [/\bO\(n\)/g, "O of n"],
  [/\bO\(1\)/g, "O of one"],
  [/\bO\(log n\)/g, "O of log n"],
  [/\bO\(n \+ m\)/g, "O of n plus m"],
  [/²/g, " squared"],
  // A spaced slash in prose is the word "or" — "negative / zero / positive".
  [/(\w)\s+\/\s+(?=\w)/g, "$1 or "],
  [/→/g, " means "],
  // A leftward arrow points back at the line it explains, so the pause the
  // comma already implies is the whole of its meaning.
  [/←/g, ", "],
  [/—/g, ", "],
  [/–/g, ", "],
];

/**
 * Identifiers, which is where these voices sound most like a machine.
 *
 * `charCodeAt` unsplit comes out as one mashed syllable; split, it is three
 * ordinary words. This pass is the single biggest intelligibility win in
 * technical narration, and it costs nothing.
 */
const IDENTIFIERS: [RegExp, string][] = [
  // Empty call parens make no sound. "toUpperCase()" should read as a verb.
  [/\(\)/g, " "],
  // A dot between two names is spoken, not swallowed. Requires a letter after,
  // so decimals — `0.30000000000000004` — are left alone.
  [/([A-Za-z0-9])\.([A-Za-z])/g, "$1 dot $2"],
  // `toISOString` → `to ISO String`: break a run of capitals before the word
  // it is glued to, then break every lower-to-upper seam.
  [/([A-Z]+)([A-Z][a-z])/g, "$1 $2"],
  [/([a-z0-9])([A-Z])/g, "$1 $2"],
  [/_/g, " "],
  // ...but these are names, not two words each.
  [/\bJava Script\b/g, "JavaScript"],
  [/\bType Script\b/g, "TypeScript"],
];

/** Symbols and identifiers read aloud badly by default, so they get rewritten. */
export function forSpeech(text: string): string {
  let out = text;
  for (const table of [ABBREVIATIONS, SPOKEN, IDENTIFIERS]) {
    for (const [pattern, replacement] of table) out = out.replace(pattern, replacement);
  }
  return out
    // A space before punctuation makes the synthesiser drop the pause entirely.
    .replace(/\s+([,.;:!?])/g, "$1")
    // Several rules can each contribute a comma to the same seam. Doubled up,
    // the voice pauses twice and it sounds like a stumble.
    .replace(/,[\s,]*,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let voices: SpeechSynthesisVoice[] = [];

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSupported()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) {
    voices = existing;
    return Promise.resolve(existing);
  }
  // Chrome populates the list asynchronously and fires this once.
  return new Promise((resolve) => {
    const done = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1000);
  });
}

/** Neural synthesis, as opposed to the old formant voices. A different era. */
const NEURAL = /natural|\bonline\b|^google\s|siri/i;

const VOICE_RANK: RegExp[] = [
  NEURAL,
  // macOS enhanced voices — still formant, but far better than the Windows set.
  /ava|allison|samantha|serena|karen|moira|daniel/i,
  // Windows named neural voices that don't carry the "Natural" label.
  /aria|jenny|guy|libby|sonia|ryan/i,
  // Legacy SAPI, best first. Zira is the clearest of the three for prose;
  // David is the flattest, and it was what the old ordering picked.
  /zira/i,
  /mark/i,
  /david/i,
];

/** Prefer a natural-sounding English voice when the platform has one. */
export function pickVoice(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = all.filter((v) => v.lang.startsWith("en"));
  if (!english.length) return null;
  for (const pattern of VOICE_RANK) {
    const found = english.find((v) => pattern.test(v.name));
    if (found) return found;
  }
  return english[0];
}

/**
 * True when the machine has nothing but the old formant voices.
 *
 * Worth surfacing rather than hiding: no amount of tuning on this side makes
 * Microsoft David sound pleasant, and installing a natural voice is a
 * two-minute fix the listener can actually make.
 */
export function onlyLegacyVoices(all: SpeechSynthesisVoice[]): boolean {
  const english = all.filter((v) => v.lang.startsWith("en"));
  return english.length > 0 && !english.some((v) => NEURAL.test(v.name));
}

let token = 0;
let keepAlive: ReturnType<typeof setInterval> | undefined;

/**
 * Deliberately NOT nudging `resume()` on a timer while speech is running.
 *
 * In Chrome, resuming a paused utterance restarts it **from the beginning** —
 * so a keep-alive tick landing mid-sentence makes the voice jump back and
 * repeat itself. Stalls are handled by the watchdog in `speak` instead, and a
 * stall is a far better failure than a stutter.
 *
 * `resume()` is only called at safe points: before starting new speech, and
 * inside `cancel()`, where nothing we care about is mid-flight.
 */
function stopKeepAlive(): void {
  if (keepAlive) clearInterval(keepAlive);
  keepAlive = undefined;
}

/**
 * Which synthesiser to use. `system` is the browser's built-in voices —
 * instant and free, and on most machines a formant synthesiser from the 2000s.
 * `natural` is Kokoro, running locally, at the cost of a one-time download and
 * a couple of seconds per passage.
 */
export type Engine = "system" | "natural";

export interface SpeakOptions {
  rate?: number;
  voice?: SpeechSynthesisVoice | null;
  engine?: Engine;
  /** Kokoro voice id, when `engine` is "natural". */
  neuralVoice?: string;
  onEnd?: () => void;
  /**
   * Fired when sound actually starts. The neural path has to synthesise
   * first, so "we asked it to speak" and "it is speaking" are seconds apart —
   * and the scene's hold timing has to be measured from the second one.
   */
  onStart?: () => void;
  /** Normalized progress through audible speech, from 0 to 1. */
  onProgress?: (progress: number) => void;
}

/**
 * Roughly the most a voice will read before Chrome cuts it off (~15s), with
 * room to spare. Not a style choice — past this, utterances die mid-word.
 */
const MAX_UTTERANCE = 200;

/** Break at the strongest punctuation available, then fall back to spaces. */
function splitLong(text: string): string[] {
  if (text.length <= MAX_UTTERANCE) return [text];

  const pieces: string[] = [];
  let rest = text;

  while (rest.length > MAX_UTTERANCE) {
    const window = rest.slice(0, MAX_UTTERANCE);
    // Prefer a clause boundary; the trailing comma keeps the pause audible.
    const at = Math.max(
      window.lastIndexOf(", "),
      window.lastIndexOf("; "),
      window.lastIndexOf(": "),
    );
    const cut = at > 40 ? at + 1 : window.lastIndexOf(" ");
    if (cut <= 0) break;
    pieces.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) pieces.push(rest);
  return pieces;
}

/**
 * Groups a passage into utterances.
 *
 * One utterance per sentence — what this used to do — puts a hard gap after
 * every full stop, and a run of short sentences comes out as a stutter. So
 * merge neighbours up to the cutoff limit and let the voice carry the rhythm,
 * which is what the punctuation is there for.
 */
export function toChunks(text: string): string[] {
  const pieces = text
    .split(/(?<=[.!?:])\s+/)
    .filter((s) => s.trim().length)
    .flatMap(splitLong);

  const chunks: string[] = [];
  for (const piece of pieces) {
    const last = chunks[chunks.length - 1];
    if (last && last.length + piece.length + 1 <= MAX_UTTERANCE) {
      chunks[chunks.length - 1] = `${last} ${piece}`;
    } else {
      chunks.push(piece);
    }
  }
  return chunks;
}

/**
 * Speaks text, split into sentences.
 *
 * The splitting is not cosmetic — Chrome silently stops long utterances after
 * roughly fifteen seconds, and a paragraph read as one utterance just dies
 * halfway through.
 */
export function speak(text: string, options: SpeakOptions = {}): void {
  if (options.engine === "natural") {
    speakNeural(text, options);
    return;
  }

  if (!isSupported()) {
    options.onEnd?.();
    return;
  }

  cancel();
  const mine = ++token;
  options.onStart?.();
  options.onProgress?.(0);

  // Any stray pause left behind by a previous session would silently swallow
  // everything queued next.
  window.speechSynthesis.resume();

  const sentences = toChunks(forSpeech(text));

  if (!sentences.length) {
    options.onEnd?.();
    return;
  }

  let index = 0;
  let completedCharacters = 0;
  const totalCharacters = Math.max(
    1,
    sentences.reduce((total, sentence) => total + sentence.length, 0),
  );

  const next = () => {
    if (mine !== token) return;

    if (index >= sentences.length) {
      stopKeepAlive();
      options.onProgress?.(1);
      options.onEnd?.();
      return;
    }

    const sentence = sentences[index++];
    const sentenceOffset = completedCharacters;
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = options.rate ?? 1;
    utterance.pitch = 1;
    if (options.voice) utterance.voice = options.voice;

    let done = false;
    const advance = () => {
      if (done || mine !== token) return;
      done = true;
      clearInterval(watchdog);
      completedCharacters += sentence.length;
      options.onProgress?.(Math.min(1, completedCharacters / totalCharacters));
      next();
    };

    utterance.onend = advance;
    utterance.onerror = advance;
    // Chrome and Edge expose word boundaries for system voices. Character
    // offsets are more dependable than estimating time from the voice's rate,
    // especially around code identifiers and punctuation.
    utterance.onboundary = (event) => {
      if (mine !== token) return;
      options.onProgress?.(
        Math.min(0.999, (sentenceOffset + event.charIndex) / totalCharacters),
      );
    };

    /**
     * Chrome drops `onend` sometimes — the utterance finishes, the callback
     * never fires, and playback hangs forever with the Pause button still
     * showing. Nothing recovers from that on its own.
     *
     * So don't trust the event. Poll: if the synth reports nothing speaking
     * and nothing queued for several ticks in a row, the utterance is over
     * whatever the browser did or didn't tell us.
     */
    let idleTicks = 0;
    const watchdog = setInterval(() => {
      if (done || mine !== token) {
        clearInterval(watchdog);
        return;
      }
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        idleTicks = 0;
        return;
      }
      // Five ticks of grace so a slow start is never mistaken for a finish —
      // advancing early would talk over the sentence still playing.
      if (++idleTicks >= 5) advance();
    }, 400);

    window.speechSynthesis.speak(utterance);
  };

  // Chrome also loses an utterance queued in the same tick as a cancel().
  setTimeout(() => {
    if (mine === token) next();
  }, 120);
}

// ------------------------------------------------------- the neural backend

let source: AudioBufferSourceNode | null = null;
let neuralProgressTimer: ReturnType<typeof setInterval> | undefined;

function stopNeural(): void {
  if (neuralProgressTimer) clearInterval(neuralProgressTimer);
  neuralProgressTimer = undefined;
  if (!source) return;
  source.onended = null;
  try {
    source.stop();
  } catch {
    // Already finished. Stopping a stopped node throws, and it doesn't matter.
  }
  source.disconnect();
  source = null;
}

/**
 * Synthesise the passage, then play it as ordinary audio.
 *
 * Once the WAV exists this is an `<audio>` element, which means none of the
 * `speechSynthesis` failure modes apply — no fifteen-second cutoff, no dropped
 * `onend`, no watchdog. The cost is moved to the front: a couple of seconds of
 * generation, which the caller hides by prefetching the next passage while
 * this one plays.
 */
function speakNeural(text: string, options: SpeakOptions): void {
  cancel();
  const mine = ++token;

  /**
   * Audio playback has to be unlocked while the browser still considers this
   * call part of the user's click. Kokoro generation is asynchronous; creating
   * or resuming the context after it finishes is too late in Chrome, which
   * leaves a perfectly good buffer attached to a suspended context and makes
   * the Play sample button appear to do nothing.
   *
   * Turn rejection into a value immediately so a quick browser rejection
   * cannot become an unhandled promise while the model is still generating.
   */
  const context = neural.audioContext();
  const playbackReady: Promise<boolean> =
    context.state === "running"
      ? Promise.resolve(true)
      : context.resume().then(
          () => context.state === "running",
          () => false,
        );

  const spoken = forSpeech(text);
  if (!spoken) {
    options.onEnd?.();
    return;
  }

  void (async () => {
    try {
      const buffer = await neural.generate(
        spoken,
        options.neuralVoice,
        options.rate ?? 1,
      );
      if (mine !== token) return;

      // A programmatic autoplay may have no user gesture at all. Do not wait
      // forever for Chrome to unlock it: fail into the existing system-voice
      // fallback, then let a later explicit Play click try again.
      const unlocked = await Promise.race([
        playbackReady,
        new Promise<boolean>((resolve) =>
          setTimeout(() => resolve(false), 1500),
        ),
      ]);
      if (!unlocked) {
        throw new Error("Audio playback was blocked by the browser");
      }
      if (mine !== token) return;

      const node = context.createBufferSource();
      node.buffer = buffer;
      if (neural.isPackedBuffer(buffer)) node.playbackRate.value = options.rate ?? 1;
      node.connect(context.destination);
      node.onended = () => {
        if (mine !== token) return;
        options.onProgress?.(1);
        stopNeural();
        options.onEnd?.();
      };
      source = node;
      node.start();
      options.onStart?.();
      options.onProgress?.(0);
      const startedAt = context.currentTime;
      const audibleSeconds = buffer.duration / Math.max(0.01, node.playbackRate.value);
      neuralProgressTimer = setInterval(() => {
        if (mine !== token) return;
        const elapsed = context.currentTime - startedAt;
        options.onProgress?.(Math.min(0.999, elapsed / Math.max(0.01, audibleSeconds)));
      }, 60);
    } catch (err) {
      // Download failed, WebGPU died, autoplay blocked — whatever it was, a
      // silent lecture is the worst outcome, so drop to the system voice.
      // But say why: a silent fallback is indistinguishable from the natural
      // voice simply sounding bad, and that is a miserable thing to debug.
      console.warn("[narrator] natural voice failed, using the system voice:", err);
      if (mine === token) speak(text, { ...options, engine: "system" });
    }
  })();
}

export function cancel(): void {
  stopNeural();
  if (!isSupported()) {
    token++;
    return;
  }
  token++;
  stopKeepAlive();
  // A paused queue ignores cancel() in Chrome, so it has to be woken first —
  // otherwise pausing, then leaving the lesson, leaves speech stuck in limbo
  // and it resumes the moment anything else calls resume().
  window.speechSynthesis.resume();
  window.speechSynthesis.cancel();
}

/**
 * Prime the speech engine inside a user gesture.
 *
 * iOS Safari only lets `speechSynthesis.speak()` produce sound if the *first*
 * call happens during a real tap. The tutor's answer is spoken seconds later,
 * after the model responds — outside any gesture — so iOS silently drops it
 * (you'd have to press play manually). Speaking a zero-width, muted utterance on
 * the tap unlocks speech for the rest of the session, so answers autoplay.
 */
export function unlockSpeech(): void {
  if (!isSupported()) return;
  try {
    window.speechSynthesis.resume();
    const primer = new SpeechSynthesisUtterance("​");
    primer.volume = 0;
    window.speechSynthesis.speak(primer);
  } catch {
    // Best-effort; nothing to recover if the browser refuses.
  }
}

export function pause(): void {
  // Suspending the whole context is safe here — narration is the only thing
  // this app ever puts through it.
  if (source) {
    void neural.audioContext().suspend();
    return;
  }
  if (isSupported()) window.speechSynthesis.pause();
}

export function resume(): void {
  if (source) {
    void neural.audioContext().resume();
    return;
  }
  if (isSupported()) window.speechSynthesis.resume();
}

/**
 * `speechSynthesis` is a single global that outlives React, so audio has to be
 * stopped when the page goes — nothing in the component tree can do it.
 *
 * Deliberately NOT pausing on `visibilitychange`: an embedded or backgrounded
 * pane flips that flag on its own, and the result is narration stopping
 * mid-sentence for no reason the listener can see.
 */
if (isSupported()) {
  window.addEventListener("pagehide", () => cancel());
  window.addEventListener("beforeunload", () => cancel());
}

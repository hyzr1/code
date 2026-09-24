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
  // Python representations and operators must be handled before the single
  // character rules below. Otherwise `<class 'str'>` becomes "less than
  // class str greater than", `->` becomes "minus greater than", and `**`
  // becomes the especially confusing "star times".
  [/<class\s+['"]([^'"]+)['"]>/g, "class $1"],
  // Complexity names must be recognized before the generic arithmetic rules
  // turn the plus sign inside their parentheses into prose.
  [/\bO\(n²\)/g, "O of n squared"],
  [/\bO\(n\^2\)/g, "O of n squared"],
  [/\bO\(n\)/g, "O of n"],
  [/\bO\(1\)/g, "O of one"],
  [/\bO\(log n\)/g, "O of log n"],
  [/\bO\(n\s*\+\s*m\)/g, "O of n plus m"],
  [/\bO\(V\s*\+\s*E\)/g, "O of V plus E"],
  [/->/g, " arrow "],
  // Multi-character operators first — a bare `=` rule would wreck them.
  [/===/g, " triple equals "],
  [/!==/g, " not equals "],
  [/==/g, " double equals "],
  [/!=/g, " not equal to "],
  [/=>/g, " arrow "],
  // Compound assignment. Unmapped, `+= 1` is read as a pause and a one.
  [/\*\*=/g, " power equals "],
  [/\/\/=/g, " floor divide equals "],
  [/\+=/g, " plus equals "],
  [/-=/g, " minus equals "],
  [/\*=/g, " times equals "],
  [/&&/g, " and and "],
  [/\|\|/g, " or or "],
  [/\?\?/g, " double question mark "],
  [/\?\./g, " question dot "],
  // Placeholder arguments inside explanatory code are semantic, not a pause.
  [/([A-Za-z_]\w*)\(\.\.\.\)/g, "$1 call "],
  [/=\s*\.\.\./g, " equals a function "],
  [/,\s*\.\.\./g, ", additional arguments "],
  // `...` is two different things. After a bracket or comma it's spread or
  // rest, and "spread" is the word a person says. Anywhere else it's an
  // ellipsis, where the only correct reading is a pause.
  [/([[({,]\s*)\.\.\.(?=[\w"'[{])/g, "$1spread "],
  [/\.\.\./g, ", "],
  [/\+\+/g, " plus plus "],
  // Python arithmetic. Binary forms run before the unary `*args` forms.
  [/(\S)\s*\*\*\s*(?=[\w(])/g, "$1 to the power of "],
  [/(\w|\))\s*\/\/\s*(?=[\w(])/g, "$1 floor divided by "],
  [/([A-Za-z0-9_)\]])\s*\*\s*(?=[\w(])/g, "$1 times "],
  [/(^|[\s(,[])\*\*(?=[A-Za-z_])/g, "$1double star "],
  [/(^|[\s(,[])\*(?=[A-Za-z_])/g, "$1star "],
  // A code comment marker (`# ...` or `// ...`). Read the annotation as plain
  // words, never "number sign" / "slash slash". Must run before the private-
  // field rule below, which only maps `#name` with no following space.
  [/^\s*#+\s+/g, ""],
  [/\s+#+\s+/g, ", "],
  [/^\s*\/\/+\s+/g, ""],
  // Any remaining double slash is the Python operator being named in prose
  // (binary uses were handled above). JS comments are removed at line start
  // or extracted by `describeCode` before reaching this function.
  [/\/\//g, " floor division "],
  // A private field. Unmapped, this is read as "number sign".
  [/#(?=\w)/g, "hash "],
  [/@(?=\w)/g, "at "],

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
  [/(\d)\s*\/\s*(\d)/g, "$1 divided by $2"],
  // `try/catch`, `keys/values/entries` — a slash between words is a breath,
  // not the word "slash".
  [/([a-z])\/([a-z])/gi, "$1 or $2"],
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
  [/\[\s*\]/g, " empty list "],
  [/f(["'])\{\s*([A-Za-z_]\w*):\.(\d+)f\s*\}\1/g,
    "an f-string formatting $2 to $3 decimal places"],
  // A bare format placeholder is common in the narration around an f-string.
  // Name its meaning before the generic brace rule starts reciting syntax.
  [/\{\s*([A-Za-z_]\w*):\.(\d+)f\s*\}/g,
    "$1 formatted to $2 decimal places"],
  [/\$(\d+)\.(\d{2})/g, "$1 dollars and $2 cents"],
  // F-string placeholders and empty mappings should be described without
  // asking the voice to improvise names for brace punctuation.
  [/\{\s*\}/g, " braces "],
  [/\{\s*([^{}]+?)\s*\}/g, " open brace $1 close brace "],
  [/\|/g, " pipe "],
  [/&/g, " and "],

  // Only negation, never punctuation — a blanket rule turns "Wow!" into
  // "Wow not", and the content is full of emphatic sentences.
  [/!(?=[\w(])/g, "not "],
  // Likewise: spaced `%` is the operator, attached `%` is a percentage.
  [/(\w)\s+%\s+(\w)/g, "$1 mod $2"],
  [/(\d)\s*%(?!\w)/g, "$1 percent"],
  [/%/g, " modulo "],

  // A spaced slash joins prose alternatives (`try / except`, `low / high`).
  // It must run before the standalone slash rule below.
  [/(\w|\))\s+\/\s+(?=\w)/g, "$1 or "],

  // Standalone operators occur in vocabulary explanations ("`+` adds").
  // Naming them here prevents a neural voice from skipping the symbol and
  // turning the sentence into "adds, subtracts" with no subject.
  [/(^|\s)\+(?=\s|$)/g, "$1plus"],
  [/(^|\s)-(?=\s|$)/g, "$1minus"],
  [/(^|\s)\*(?=\s|$)/g, "$1times"],
  [/(^|\s)\/(?=\s|$)/g, "$1divided by"],
  [/(^|\s)\^(?=\s|$)/g, "$1caret"],
  [/\^(\d+)/g, "caret $1"],
  [/=/g, " equals "],

  [/\bNaN\b/g, "nan"],
  [/\bJS\b/g, "JavaScript"],
  [/\bFIFO\b/g, "first in, first out"],
  [/\bLRU\b/g, "L R U"],
  [/\bAPI\b/g, "A P I"],
  [/\bDP\b/g, "dynamic programming"],
  [/\bO\(n²\)/g, "O of n squared"],
  [/\bO\(n\^2\)/g, "O of n squared"],
  [/\bO\(n\)/g, "O of n"],
  [/\bO\(1\)/g, "O of one"],
  [/\bO\(log n\)/g, "O of log n"],
  [/\bO\(n \+ m\)/g, "O of n plus m"],
  [/\bO\(V \+ E\)/g, "O of V plus E"],
  [/²/g, " squared"],
  [/log₂\(n\)/gi, "log base 2 of n"],
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
  // Numeric separators are for human readability, not separate spoken words.
  [/(\d)_(?=\d)/g, "$1"],
  // Protect this acronym before the camel-case splitter turns it into "I Ds".
  [/\bIDs\b/g, "I D's"],
  // By this pass braces have already been named. Turn common f-string shapes
  // into the explanation an instructor would actually say rather than making
  // the voice recite every quote and brace.
  [/f(["'])\s*open brace\s+([A-Za-z_]\w*):\.(\d+)f\s+close brace\s*\1/g,
    "an f-string formatting $2 to $3 decimal places"],
  [/f(["'])\s*open brace\s+([A-Za-z_]\w*)\s+close brace\s*\1/g,
    "an f-string containing $2"],
  // Preserve the distinction between a function value and calling it. This
  // makes `key=rule` versus `key=rule()` audible instead of reading both as
  // "key equals rule".
  [/([A-Za-z_]\w*)\(\.\.\.\)/g, "$1 call "],
  [/([A-Za-z_]\w*)\(\)/g, "$1 call "],
  [/__([A-Za-z][A-Za-z0-9_]*)__/g, "dunder $1"],
  // A method named at the start of a phrase: `.copy()` / `.most_common()`.
  [/(^|[\s:;,(])\.(?=[A-Za-z])/g, "$1 dot "],
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
  [/\bstar\s*\(\s*star\s*\)/gi, "starred-value"],
  [/\binteger division\s+floor division\b/gi, "floor division"],
  [/\bgreater than\s+right,\s+less than\s+left,\s+caret\s+center\b/gi,
    "greater-than means right aligned, less-than means left aligned, and caret means centered"],
  [/\bthe next next call\b/gi, "the next call"],
  [/\buse it with with\b/gi, "use it with a with statement"],
  [/\bat ([A-Za-z_]\w*) written on ([A-Za-z_]\w*)\b/gi,
    "the $1 decorator on $2"],
  [/\bmodulo for percentages\b/gi, "percent format for percentages"],
  [/\bPrecision equals of\b/g, "Precision asks: of"],
  [/\bRecall equals of\b/g, "Recall asks: of"],
];

/** Symbols and identifiers read aloud badly by default, so they get rewritten. */
export function forSpeech(text: string): string {
  let out = text;
  for (const table of [ABBREVIATIONS, SPOKEN, IDENTIFIERS]) {
    for (const [pattern, replacement] of table) out = out.replace(pattern, replacement);
  }
  return out
    // A space before punctuation makes the synthesiser drop the pause entirely.
    .replace(/\s+([,;:!?])/g, "$1")
    // A period is punctuation only when it ends a phrase. In `.2f` it is
    // syntax, and deleting the space before it turns "does .2f" into the
    // visibly and audibly broken "does.2f".
    .replace(/\s+\.(?=\s|$)/g, ".")
    // A code token ending in `:` followed by prose punctuation should create
    // one pause, not make the voice pronounce a stutter like "colon period".
    .replace(/([:;,])\./g, "$1")
    // Several rules can each contribute a comma to the same seam. Doubled up,
    // the voice pauses twice and it sounds like a stumble.
    // Collapse only commas separated by whitespace. Literal `,,` inside a
    // CSV example represents an empty field and must remain audible/visible.
    .replace(/,\s+,/g, ",")
    .replace(/\.{2,}/g, ".")
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
      // A real pause can make some browsers report neither `speaking` nor
      // `pending`. It is not an ended utterance and must never advance chunks
      // or the slide while the learner has playback paused.
      if (window.speechSynthesis.paused) {
        idleTicks = 0;
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

interface NeuralSession {
  token: number;
  context: AudioContext;
  options: SpeakOptions;
  rate: number;
  buffer: AudioBuffer | null;
  node: AudioBufferSourceNode | null;
  /** Current position in source-buffer seconds, not wall-clock seconds. */
  offset: number;
  startedAt: number;
  paused: boolean;
  ended: boolean;
  started: boolean;
  lastContextTime: number;
  stalledTicks: number;
}

let neuralSession: NeuralSession | null = null;
let neuralProgressTimer: ReturnType<typeof setInterval> | undefined;

function clearNeuralProgress(): void {
  if (neuralProgressTimer) clearInterval(neuralProgressTimer);
  neuralProgressTimer = undefined;
}

function neuralPosition(session: NeuralSession): number {
  if (!session.buffer) return session.offset;
  const played = session.node
    ? Math.max(0, session.context.currentTime - session.startedAt) * session.rate
    : 0;
  return Math.min(session.buffer.duration, session.offset + played);
}

function detachNeuralNode(session: NeuralSession, keepPosition: boolean): void {
  const node = session.node;
  if (!node) return;
  if (keepPosition) session.offset = neuralPosition(session);
  node.onended = null;
  session.node = null;
  try {
    node.stop();
  } catch {
    // Already finished. Stopping a stopped node throws, and it doesn't matter.
  }
  node.disconnect();
}

function finishNeural(session: NeuralSession): void {
  if (session.ended || session.token !== token || neuralSession !== session) return;
  session.ended = true;
  if (session.buffer) session.offset = session.buffer.duration;
  detachNeuralNode(session, false);
  clearNeuralProgress();
  neuralSession = null;
  session.options.onProgress?.(1);
  session.options.onEnd?.();
}

/**
 * Start (or restart) one neural clip at its saved source-buffer offset.
 *
 * AudioBufferSourceNode cannot be paused. Suspending the shared AudioContext
 * looked equivalent, but mobile browsers can leave that context interrupted
 * forever. Recreating only the source node is reliable: pause records the
 * exact offset and resume starts there without replaying a word.
 */
function startNeuralNode(session: NeuralSession): void {
  if (
    session.ended || session.paused || !session.buffer || session.node ||
    session.token !== token || neuralSession !== session
  ) return;

  if (session.offset >= session.buffer.duration - 0.005) {
    finishNeural(session);
    return;
  }

  const start = () => {
    if (
      session.ended || session.paused || !session.buffer || session.node ||
      session.token !== token || neuralSession !== session ||
      session.context.state !== "running"
    ) return;

    const node = session.context.createBufferSource();
    node.buffer = session.buffer;
    node.playbackRate.value = session.rate;
    node.connect(session.context.destination);
    node.onended = () => {
      if (session.node !== node) return;
      session.offset = session.buffer?.duration ?? session.offset;
      session.node = null;
      node.disconnect();
      finishNeural(session);
    };
    session.node = node;
    session.startedAt = session.context.currentTime;
    session.lastContextTime = session.context.currentTime;
    session.stalledTicks = 0;
    node.start(0, session.offset);

    if (!session.started) {
      session.started = true;
      session.options.onStart?.();
      session.options.onProgress?.(0);
    }

    clearNeuralProgress();
    neuralProgressTimer = setInterval(() => {
      if (
        session.ended || session.token !== token ||
        neuralSession !== session || !session.buffer
      ) {
        clearNeuralProgress();
        return;
      }
      const position = neuralPosition(session);
      if (position >= session.buffer.duration - 0.005) {
        finishNeural(session);
        return;
      }

      // Browsers occasionally interrupt an AudioContext without rejecting or
      // ending its source. Detect a frozen audio clock and rebuild this one
      // source at its saved offset. An explicit Play gesture uses the same path
      // and can recover even when an automatic resume was denied.
      const contextTime = session.context.currentTime;
      if (session.node && contextTime <= session.lastContextTime + 0.0001) {
        session.stalledTicks += 1;
      } else {
        session.stalledTicks = 0;
      }
      session.lastContextTime = contextTime;
      if (session.stalledTicks >= 10) {
        detachNeuralNode(session, true);
        clearNeuralProgress();
        startNeuralNode(session);
        return;
      }

      session.options.onProgress?.(
        Math.min(0.999, position / Math.max(0.01, session.buffer.duration)),
      );
    }, 60);
  };

  if (session.context.state === "running") start();
  else void session.context.resume().then(start, () => undefined);
}

function stopNeural(): void {
  const session = neuralSession;
  clearNeuralProgress();
  if (!session) return;
  session.ended = true;
  detachNeuralNode(session, false);
  neuralSession = null;
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
  const session: NeuralSession = {
    token: mine,
    context,
    options,
    rate: options.rate ?? 1,
    buffer: null,
    node: null,
    offset: 0,
    startedAt: 0,
    paused: false,
    ended: false,
    started: false,
    lastContextTime: 0,
    stalledTicks: 0,
  };
  neuralSession = session;
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
      if (mine !== token || neuralSession !== session || session.ended) return;
      session.buffer = buffer;
      // Packed clips were rendered at 1x and use playbackRate. Live Kokoro
      // already applied the requested speed while generating its samples.
      session.rate = neural.isPackedBuffer(buffer) ? (options.rate ?? 1) : 1;

      // A programmatic autoplay may have no user gesture at all. Do not wait
      // forever for Chrome to unlock it: fail into the existing system-voice
      // fallback, then let a later explicit Play click try again.
      const unlocked = await Promise.race([
        playbackReady,
        new Promise<boolean>((resolve) =>
          setTimeout(() => resolve(false), 1500),
        ),
      ]);
      // A pause while the asset was loading is deliberate, not an autoplay
      // failure. Keep the decoded clip ready for the next Play gesture.
      if (!unlocked && !session.paused) {
        throw new Error("Audio playback was blocked by the browser");
      }
      if (mine !== token || neuralSession !== session || session.ended) return;
      startNeuralNode(session);
    } catch (err) {
      // Download failed, WebGPU died, autoplay blocked — whatever it was, a
      // silent lecture is the worst outcome, so drop to the system voice.
      // But say why: a silent fallback is indistinguishable from the natural
      // voice simply sounding bad, and that is a miserable thing to debug.
      console.warn("[narrator] natural voice failed, using the system voice:", err);
      if (mine === token && neuralSession === session && !session.ended) {
        stopNeural();
        speak(text, { ...options, engine: "system" });
      }
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
  const session = neuralSession;
  if (session && !session.ended) {
    session.paused = true;
    detachNeuralNode(session, true);
    clearNeuralProgress();
    return;
  }
  if (isSupported()) window.speechSynthesis.pause();
}

export function resume(): void {
  const session = neuralSession;
  if (session && !session.ended) {
    session.paused = false;
    startNeuralNode(session);
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

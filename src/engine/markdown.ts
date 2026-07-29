export type Block =
  | { kind: "p"; text: string }
  | { kind: "code"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] };

const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+\.\s+(.*)$/;
const ROW = /^\s*\|(.+)\|\s*$/;
/** The `| --- | --- |` line that makes the row above a header. */
const DIVIDER = /^\s*\|[\s|:-]+\|\s*$/;

const cells = (line: string): string[] =>
  (ROW.exec(line)?.[1] ?? "").split("|").map((c) => c.trim());

/**
 * Shared block parser. The reader and the player both need to understand the
 * same source, and having two parsers would guarantee they drift apart.
 */
export function parseBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (!paragraph.length) return;
    blocks.push({ kind: "p", text: paragraph.join(" ") });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flush();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      blocks.push({ kind: "code", text: body.join("\n") });
      continue;
    }

    if (line.startsWith("## ")) {
      flush();
      blocks.push({ kind: "h2", text: line.slice(3) });
      continue;
    }

    // A table is a header row, a divider, then body rows. Without this the
    // pipes survive into the reader as literal text and into the narrator as
    // "bar Need bar Use bar", which is unlistenable.
    if (ROW.test(line) && DIVIDER.test(lines[i + 1] ?? "")) {
      flush();
      const headers = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && ROW.test(lines[i]) && !DIVIDER.test(lines[i])) {
        rows.push(cells(lines[i]));
        i++;
      }
      i--;
      blocks.push({ kind: "table", headers, rows });
      continue;
    }

    // Consecutive bullets or numbers become one list block. Without this they
    // are plain paragraphs, which reads the dashes aloud and lets a single
    // item get split across two scenes mid-sentence.
    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);
    if (bullet || numbered) {
      flush();
      const ordered = Boolean(numbered);
      const items: string[] = [];
      while (i < lines.length) {
        const next = ordered ? NUMBERED.exec(lines[i]) : BULLET.exec(lines[i]);
        if (!next) break;
        items.push(next[1]);
        i++;
      }
      i--;
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    if (!line.trim()) {
      flush();
      continue;
    }

    paragraph.push(line);
  }

  flush();
  return blocks;
}

/**
 * A one-character code span is a character being *named*, not used.
 *
 * "A path starting with `.` or `/`" loses its whole meaning once the backticks
 * are stripped: the dot becomes a full stop and the slash is silent. The
 * backticks are the only signal that these are subjects, so the substitution
 * has to happen here, while they still exist.
 */
const NAMED: Record<string, string> = {
  ".": "dot",
  "/": "slash",
  "\\": "backslash",
  "-": "dash",
  _: "underscore",
  "#": "hash",
  "*": "star",
  "|": "pipe",
  ",": "comma",
  ";": "semicolon",
  ":": "colon",
  "?": "question mark",
  "!": "exclamation mark",
  $: "dollar",
  "{": "open brace",
  "}": "close brace",
  "[": "open bracket",
  "]": "close bracket",
};

/** Strip markup so the result can be spoken or measured. */
export function plainText(text: string): string {
  return text
    .replace(/`(.)`/g, (whole, char: string) =>
      NAMED[char] ? ` ${NAMED[char]} ` : whole,
    )
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

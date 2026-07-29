import { Fragment, type ReactNode } from "react";
import type { CourseLanguage } from "../types";

/**
 * A small JavaScript tokeniser for *display* only.
 *
 * Shared by the lecture player and the reader so a snippet looks identical
 * whichever way you take the lesson — they had drifted apart, and prose code
 * rendering as flat grey text was the tell.
 *
 * Not a parser: order matters, first match wins, and it only needs to be right
 * about the code this course actually contains.
 */
const TOKENS: [RegExp, string][] = [
  [/^\/\/.*/, "c-comment"],
  [/^\/\*[\s\S]*?\*\//, "c-comment"],
  [/^`(?:[^`\\]|\\.)*`/, "c-string"],
  [/^"(?:[^"\\]|\\.)*"/, "c-string"],
  [/^'(?:[^'\\]|\\.)*'/, "c-string"],
  [
    /^\b(const|let|var|function|return|if|else|for|of|in|while|do|break|continue|new|class|extends|typeof|instanceof|delete|async|await|this|try|catch|finally|throw|switch|case|default|yield|import|export|from)\b/,
    "c-keyword",
  ],
  [/^\b(true|false|null|undefined|NaN|Infinity)\b/, "c-atom"],
  [/^\b\d+(\.\d+)?n?\b/, "c-number"],
  [/^\b[A-Z]\w*/, "c-class"],
  [/^\b\w+(?=\s*\()/, "c-fn"],
  [/^[{}()[\];,.]/, "c-punct"],
  [/^[+\-*/%=<>!&|?:~^]+/, "c-op"],
  [/^\s+/, ""],
  [/^\w+/, ""],
  [/^./, ""],
];

const PYTHON_TOKENS: [RegExp, string][] = [
  [/^#.*/, "c-comment"],
  [/^\"\"\"[\s\S]*?\"\"\"/, "c-string"],
  [/^'''[\s\S]*?'''/, "c-string"],
  [/^(?:[rubfRUBF]{0,2})\"(?:[^\"\\]|\\.)*\"/, "c-string"],
  [/^(?:[rubfRUBF]{0,2})'(?:[^'\\]|\\.)*'/, "c-string"],
  [/^\b(and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/, "c-keyword"],
  [/^\b(True|False|None|NotImplemented|Ellipsis)\b/, "c-atom"],
  [/^\b(?:0[xob][\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?)\b/, "c-number"],
  [/^\b[A-Z]\w*/, "c-class"],
  [/^\b\w+(?=\s*\()/, "c-fn"],
  [/^[{}()[\]:;,.]/, "c-punct"],
  [/^[+\-*/%@=<>!&|~^]+/, "c-op"],
  [/^\s+/, ""],
  [/^\w+/, ""],
  [/^./, ""],
];

export function highlightLine(
  line: string,
  key: string,
  language: CourseLanguage = "javascript",
): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = line;
  let i = 0;

  while (rest.length) {
    let matched = false;
    for (const [pattern, cls] of language === "python" ? PYTHON_TOKENS : TOKENS) {
      const found = pattern.exec(rest);
      if (!found) continue;
      const text = found[0];
      out.push(
        cls ? (
          <span key={`${key}-${i++}`} className={cls}>
            {text}
          </span>
        ) : (
          <Fragment key={`${key}-${i++}`}>{text}</Fragment>
        ),
      );
      rest = rest.slice(text.length);
      matched = true;
      break;
    }
    // No rule matched — emit the remainder rather than looping forever.
    if (!matched) {
      out.push(<Fragment key={`${key}-${i++}`}>{rest}</Fragment>);
      break;
    }
  }

  return out;
}

/** Whole block, newlines preserved. */
export function highlightBlock(code: string, language: CourseLanguage = "javascript"): ReactNode[] {
  return code.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? "\n" : null}
      {line ? highlightLine(line, `l${i}`, language) : null}
    </Fragment>
  ));
}

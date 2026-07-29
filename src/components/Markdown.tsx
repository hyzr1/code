import { Fragment, type ReactNode } from "react";
import { parseBlocks } from "../engine/markdown";
import { highlightBlock } from "./highlight";
import type { CourseLanguage } from "../types";

/**
 * Just enough markdown for lecture atoms and problem prompts.
 *
 * A real parser is a dependency and a bundle, and the content is authored in
 * this repo — so the supported syntax is exactly what the style guide allows:
 * `## headings`, fenced code, `inline code`, **bold**, *italic*.
 */

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${keyBase}-${i++}`;

    if (token.startsWith("`")) {
      out.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      // Recurse — bold routinely wraps inline code, and not recursing leaves
      // literal backticks on screen.
      out.push(<strong key={key}>{inline(token.slice(2, -2), key)}</strong>);
    } else {
      out.push(<em key={key}>{inline(token.slice(1, -1), key)}</em>);
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export default function Markdown({ source, language = "javascript" }: { source: string; language?: CourseLanguage }) {
  const blocks = parseBlocks(source);

  return (
    <Fragment>
      {blocks.map((block, i) => {
        if (block.kind === "code") {
          return (
            <pre key={i}>
              <code>{highlightBlock(block.text, language)}</code>
            </pre>
          );
        }
        if (block.kind === "h2") {
          return <h2 key={i}>{inline(block.text, `h${i}`)}</h2>;
        }
        if (block.kind === "list") {
          const items = block.items.map((item, j) => (
            <li key={j}>{inline(item, `l${i}-${j}`)}</li>
          ));
          return block.ordered ? (
            <ol key={i}>{items}</ol>
          ) : (
            <ul key={i}>{items}</ul>
          );
        }
        if (block.kind === "table") {
          return (
            <div className="table-scroll" key={i}>
              <table>
                <thead>
                  <tr>
                    {block.headers.map((h, j) => (
                      <th key={j}>{inline(h, `th${i}-${j}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={k}>{inline(cell, `td${i}-${j}-${k}`)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={i}>{inline(block.text, `p${i}`)}</p>;
      })}
    </Fragment>
  );
}

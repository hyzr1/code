import type { ReactNode } from 'react';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { highlightTree } from '@lezer/highlight';
import { codeHighlight, pythonSyntax } from '../engine/syntax';
import type { CourseLanguage } from '../types';

export function highlightBlock(code: string, language: CourseLanguage = 'python'): ReactNode[] {
  const tree = (language === 'python' ? pythonSyntax : javascriptLanguage).parser.parse(code);
  const out: ReactNode[] = [];
  let cursor = 0;
  highlightTree(tree, codeHighlight, (from, to, classes) => {
    if (from > cursor) out.push(code.slice(cursor, from));
    const token = code.slice(from, to);
    // Python's return annotation node can include the arrow in the same
    // highlight range as its type. Keep the operator neutral like the editor
    // does, instead of making `->` look like another type name.
    const arrow = token.indexOf("->");
    if (arrow >= 0 && classes.includes("syntax-type")) {
      if (arrow) out.push(<span key={`${from}-type`} className={classes}>{token.slice(0, arrow)}</span>);
      out.push(<span key={`${from}-arrow`} className="syntax-punctuation">-&gt;</span>);
      if (arrow + 2 < token.length) out.push(<span key={`${from}-tail`} className={classes}>{token.slice(arrow + 2)}</span>);
    } else {
      out.push(<span key={from} className={classes}>{token}</span>);
    }
    cursor = to;
  });
  if (cursor < code.length) out.push(code.slice(cursor));
  return out;
}

export function highlightLine(line: string, _key: string, language: CourseLanguage = 'python'): ReactNode[] {
  return highlightBlock(line, language);
}

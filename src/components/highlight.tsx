import type { ReactNode } from 'react';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { highlightTree } from '@lezer/highlight';
import { codeHighlight, pythonSyntax } from '../engine/syntax';
import type { CourseLanguage } from '../types';

export function highlightBlock(code: string, language: CourseLanguage = 'javascript'): ReactNode[] {
  const tree = (language === 'python' ? pythonSyntax : javascriptLanguage).parser.parse(code);
  const out: ReactNode[] = [];
  let cursor = 0;
  highlightTree(tree, codeHighlight, (from, to, classes) => {
    if (from > cursor) out.push(code.slice(cursor, from));
    out.push(<span key={from} className={classes}>{code.slice(from, to)}</span>);
    cursor = to;
  });
  if (cursor < code.length) out.push(code.slice(cursor));
  return out;
}

export function highlightLine(line: string, _key: string, language: CourseLanguage = 'javascript'): ReactNode[] {
  return highlightBlock(line, language);
}

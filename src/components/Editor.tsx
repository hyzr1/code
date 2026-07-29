import { useEffect, useRef } from "react";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightSpecialChars,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  toggleComment,
} from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import {
  HighlightStyle,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, search, searchKeymap } from "@codemirror/search";
import { tags } from "@lezer/highlight";
import { useSettings } from "../settings";
import type { CourseLanguage } from "../types";

/** VS Code Dark+, so the colours match the editor you actually use. The code
 *  surface stays dark in both themes — every editor people know is dark, and a
 *  light code pane reads as a document rather than somewhere to type. */
const theme = EditorView.theme(
  {
    "&": { backgroundColor: "#1e1e1e", color: "#d4d4d4" },
    ".cm-content": { caretColor: "#aeafad", padding: "10px 0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#aeafad", borderLeftWidth: "2px" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "#264f78" },
    ".cm-selectionMatch": { backgroundColor: "#3a3d41" },
    ".cm-gutters": {
      backgroundColor: "#1e1e1e",
      color: "#858585",
      border: "none",
      paddingRight: "6px",
    },
    ".cm-activeLine": { backgroundColor: "#282828" },
    ".cm-activeLineGutter": { backgroundColor: "#282828", color: "#c6c6c6" },
    ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
      backgroundColor: "transparent",
      outline: "1px solid #888",
      color: "inherit",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "#3a3d41",
      border: "none",
      color: "#d4d4d4",
    },
    ".cm-tooltip": {
      backgroundColor: "#252526",
      border: "1px solid #454545",
      borderRadius: "3px",
    },
    ".cm-tooltip-autocomplete > ul > li": {
      padding: "3px 8px",
      fontFamily: "var(--mono)",
      fontSize: "13px",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "#04395e",
      color: "#ffffff",
    },
    ".cm-completionIcon": { paddingRight: "14px", opacity: 0.7 },
    ".cm-completionDetail": { color: "#9cdcfe", fontStyle: "normal", marginLeft: "8px" },
    ".cm-panels": { backgroundColor: "#252526", color: "#d4d4d4" },
    ".cm-searchMatch": { backgroundColor: "#623315" },
    ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#9e6a03" },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier, tags.self], color: "#569cd6" },
  { tag: [tags.controlKeyword, tags.moduleKeyword], color: "#c586c0" },
  { tag: [tags.definitionKeyword, tags.operatorKeyword], color: "#569cd6" },
  { tag: tags.string, color: "#ce9178" },
  { tag: tags.special(tags.string), color: "#ce9178" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#b5cea8" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#6a9955", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#dcdcaa" },
  { tag: tags.definition(tags.function(tags.variableName)), color: "#dcdcaa" },
  { tag: [tags.variableName, tags.propertyName], color: "#9cdcfe" },
  { tag: tags.definition(tags.variableName), color: "#9cdcfe" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#4ec9b0" },
  { tag: [tags.operator, tags.punctuation, tags.separator, tags.bracket], color: "#d4d4d4" },
  { tag: tags.regexp, color: "#d16969" },
  { tag: tags.escape, color: "#d7ba7d" },
  { tag: tags.invalid, color: "#f44747" },
]);

// --------------------------------------------------------------- completions

const KEYWORDS = [
  "const", "let", "var", "function", "return", "if", "else", "for", "of", "in",
  "while", "do", "break", "continue", "switch", "case", "default", "try",
  "catch", "finally", "throw", "new", "class", "extends", "typeof", "instanceof",
  "delete", "void", "async", "await", "yield", "this", "true", "false", "null",
  "undefined",
];

const GLOBALS: [string, string][] = [
  ["console", "object"], ["Math", "object"], ["JSON", "object"],
  ["Object", "object"], ["Array", "object"], ["String", "object"],
  ["Number", "object"], ["Boolean", "object"], ["Map", "class"],
  ["Set", "class"], ["WeakMap", "class"], ["Promise", "class"],
  ["Date", "class"], ["RegExp", "class"], ["Error", "class"],
  ["Symbol", "object"], ["BigInt", "object"], ["structuredClone", "function"],
  ["parseInt", "function"], ["parseFloat", "function"], ["isNaN", "function"],
  ["setTimeout", "function"], ["clearTimeout", "function"],
  ["setInterval", "function"], ["clearInterval", "function"],
];

/** Curated method list with signatures. We can't infer the receiver's type, so
 *  everything common is offered — which for a learner is the useful behaviour:
 *  the list itself teaches what exists. */
const MEMBERS: [string, string][] = [
  // array
  ["length", "number"], ["push", "(...items) → number"], ["pop", "() → item"],
  ["shift", "() → item"], ["unshift", "(...items) → number"],
  ["slice", "(start?, end?) → array"], ["splice", "(start, count?) → removed"],
  ["concat", "(...arrays) → array"], ["join", "(sep?) → string"],
  ["indexOf", "(value) → number"], ["lastIndexOf", "(value) → number"],
  ["includes", "(value) → boolean"], ["find", "(fn) → item"],
  ["findIndex", "(fn) → number"], ["findLast", "(fn) → item"],
  ["filter", "(fn) → array"], ["map", "(fn) → array"],
  ["reduce", "(fn, seed) → any"], ["reduceRight", "(fn, seed) → any"],
  ["forEach", "(fn) → undefined"], ["some", "(fn) → boolean"],
  ["every", "(fn) → boolean"], ["sort", "(compare?) → same array"],
  ["reverse", "() → same array"], ["flat", "(depth?) → array"],
  ["flatMap", "(fn) → array"], ["fill", "(value) → same array"],
  ["at", "(index) → item"], ["keys", "() → iterator"],
  ["values", "() → iterator"], ["entries", "() → iterator"],
  ["toSorted", "(compare?) → new array"], ["toReversed", "() → new array"],
  // string
  ["charAt", "(i) → string"], ["charCodeAt", "(i) → number"],
  ["toUpperCase", "() → string"], ["toLowerCase", "() → string"],
  ["trim", "() → string"], ["trimStart", "() → string"], ["trimEnd", "() → string"],
  ["split", "(sep) → array"], ["replace", "(find, to) → string"],
  ["replaceAll", "(find, to) → string"], ["startsWith", "(s) → boolean"],
  ["endsWith", "(s) → boolean"], ["padStart", "(len, pad?) → string"],
  ["padEnd", "(len, pad?) → string"], ["repeat", "(n) → string"],
  ["substring", "(start, end?) → string"], ["match", "(re) → array"],
  ["localeCompare", "(s) → number"],
  // map / set
  ["get", "(key) → value"], ["set", "(key, value) → this"],
  ["has", "(key) → boolean"], ["delete", "(key) → boolean"],
  ["add", "(value) → this"], ["clear", "() → undefined"], ["size", "number"],
  // promise
  ["then", "(fn) → promise"], ["catch", "(fn) → promise"],
  ["finally", "(fn) → promise"],
];

const STATIC_MEMBERS: Record<string, [string, string][]> = {
  console: [["log", "(...args)"], ["error", "(...args)"], ["warn", "(...args)"], ["table", "(data)"]],
  Math: [["max", "(...n) → number"], ["min", "(...n) → number"], ["floor", "(n)"], ["ceil", "(n)"], ["round", "(n)"], ["abs", "(n)"], ["pow", "(a, b)"], ["sqrt", "(n)"], ["random", "() → 0-1"], ["trunc", "(n)"], ["sign", "(n)"]],
  Object: [["keys", "(obj) → array"], ["values", "(obj) → array"], ["entries", "(obj) → pairs"], ["assign", "(target, ...src)"], ["fromEntries", "(pairs) → object"], ["freeze", "(obj)"], ["create", "(proto)"], ["is", "(a, b) → boolean"]],
  Array: [["isArray", "(v) → boolean"], ["from", "(iterable, fn?) → array"], ["of", "(...items) → array"]],
  JSON: [["stringify", "(value) → string"], ["parse", "(text) → value"]],
  Number: [["isNaN", "(v) → boolean"], ["isInteger", "(v) → boolean"], ["parseFloat", "(s)"], ["parseInt", "(s)"], ["MAX_SAFE_INTEGER", "number"]],
  Promise: [["all", "(items) → promise"], ["allSettled", "(items)"], ["race", "(items)"], ["any", "(items)"], ["resolve", "(v)"], ["reject", "(e)"]],
  String: [["fromCharCode", "(...codes)"]],
};

const PYTHON_KEYWORDS = [
  "and", "as", "assert", "async", "await", "break", "case", "class",
  "continue", "def", "del", "elif", "else", "except", "False", "finally",
  "for", "from", "global", "if", "import", "in", "is", "lambda", "match",
  "None", "nonlocal", "not", "or", "pass", "raise", "return", "True",
  "try", "while", "with", "yield",
];

const PYTHON_GLOBALS: [string, string][] = [
  ["len", "function"], ["range", "function"], ["enumerate", "function"],
  ["zip", "function"], ["sorted", "function"], ["reversed", "function"],
  ["sum", "function"], ["min", "function"], ["max", "function"],
  ["any", "function"], ["all", "function"], ["print", "function"],
  ["int", "class"], ["float", "class"], ["str", "class"],
  ["list", "class"], ["tuple", "class"], ["dict", "class"],
  ["set", "class"], ["bool", "class"], ["Exception", "class"],
];

function completions(
  context: CompletionContext,
  language: CourseLanguage,
): CompletionResult | null {
  const before = context.state.sliceDoc(0, context.pos);

  if (language === "python") {
    const word = context.matchBefore(/\w+/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: [
        ...PYTHON_KEYWORDS.map((label) => ({ label, type: "keyword" })),
        ...PYTHON_GLOBALS.map(([label, type]) => ({ label, type })),
      ],
    };
  }

  // `Something.` → offer that object's static members.
  const staticMatch = /([A-Z]\w*)\.(\w*)$/.exec(before);
  if (staticMatch && STATIC_MEMBERS[staticMatch[1]]) {
    return {
      from: context.pos - staticMatch[2].length,
      options: STATIC_MEMBERS[staticMatch[1]].map(([label, detail]) => ({
        label,
        detail,
        type: detail.startsWith("(") ? "method" : "property",
      })),
    };
  }

  // Any other `x.` → the curated member list.
  const memberMatch = /\.(\w*)$/.exec(before);
  if (memberMatch) {
    return {
      from: context.pos - memberMatch[1].length,
      options: MEMBERS.map(([label, detail]) => ({
        label,
        detail,
        type: detail.startsWith("(") ? "method" : "property",
      })),
    };
  }

  const word = context.matchBefore(/\w+/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  return {
    from: word.from,
    options: [
      ...KEYWORDS.map((label) => ({ label, type: "keyword" })),
      ...GLOBALS.map(([label, type]) => ({ label, type })),
    ],
  };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Cold Mode: no autocomplete, no bracket closing, no paste. */
  cold: boolean;
  onFirstKeystroke?: () => void;
  readOnly?: boolean;
  language?: CourseLanguage;
}

/**
 * Full VS Code-style editing by default; Cold Mode strips the assists.
 *
 * The extension list is assembled by hand rather than using `basicSetup`
 * precisely so autocompletion and bracket closing can be removed for a cold
 * attempt — they're the two features that let you produce code you couldn't
 * have written from memory.
 */
export default function Editor({
  value,
  onChange,
  cold,
  onFirstKeystroke,
  readOnly = false,
  language = "javascript",
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const typed = useRef(false);
  const latest = useRef({ onChange, onFirstKeystroke });
  latest.current = { onChange, onFirstKeystroke };

  const { settings } = useSettings();
  const prefs = settings.editor;
  // Only the options that change the extension list belong in the key — the
  // editor is rebuilt when they change, and rebuilding on every keystroke
  // would lose the cursor.
  const shape = [
    cold,
    readOnly,
    prefs.assists,
    prefs.closeBrackets,
    prefs.lineNumbers,
    prefs.wordWrap,
    prefs.highlightActiveLine,
    prefs.tabSize,
    language,
  ].join("|");

  useEffect(() => {
    if (!host.current) return;

    const extensions: Extension[] = [
      highlightSpecialChars(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      highlightSelectionMatches(),
      history(),
      search({ top: true }),
      bracketMatching(),
      indentOnInput(),
      indentUnit.of(" ".repeat(prefs.tabSize)),
      language === "python" ? python() : javascript(),
      syntaxHighlighting(highlight),
      theme,
      EditorState.readOnly.of(readOnly),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        if (!typed.current) {
          typed.current = true;
          latest.current.onFirstKeystroke?.();
        }
        latest.current.onChange(update.state.doc.toString());
      }),
    ];

    if (prefs.lineNumbers) extensions.push(lineNumbers(), highlightActiveLineGutter());
    if (prefs.highlightActiveLine) extensions.push(highlightActiveLine());
    if (prefs.wordWrap) extensions.push(EditorView.lineWrapping);

    const keys = [
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...foldKeymap,
      indentWithTab,
      { key: "Mod-/", run: toggleComment },
    ];

    if (cold) {
      extensions.push(
        EditorView.domEventHandlers({
          paste(event) {
            event.preventDefault();
            return true;
          },
          drop(event) {
            event.preventDefault();
            return true;
          },
        }),
      );
    } else {
      if (prefs.assists) {
        extensions.push(
          autocompletion({
            activateOnTyping: true,
            maxRenderedOptions: 20,
            override: [(context) => completions(context, language)],
          }),
        );
        keys.unshift(...completionKeymap);
      }
      if (prefs.closeBrackets) {
        extensions.push(closeBrackets());
        keys.unshift(...closeBracketsKeymap);
      }
    }

    extensions.push(keymap.of(keys));

    const instance = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: host.current,
    });
    view.current = instance;

    return () => {
      instance.destroy();
      view.current = null;
    };
    // Rebuilt only when the extension shape changes; doc updates are below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  // External resets (switching problem, "reset to starter") push a new doc in.
  useEffect(() => {
    const instance = view.current;
    if (!instance) return;
    if (instance.state.doc.toString() === value) return;
    instance.dispatch({
      changes: { from: 0, to: instance.state.doc.length, insert: value },
    });
  }, [value]);

  return <div ref={host} />;
}

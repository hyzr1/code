import { HighlightStyle, LanguageSupport } from '@codemirror/language';
import { python, pythonLanguage } from '@codemirror/lang-python';
import { styleTags, tags } from '@lezer/highlight';

// Python's base grammar does not distinguish annotation names from variables.
export const pythonSyntax = pythonLanguage.configure({ props: [styleTags({
  'TypeDef/...': tags.typeName,
  ': "[" "]" "(" ")" -> , |': tags.punctuation,
})] });
export const pythonSupport = () => new LanguageSupport(pythonSyntax, python().support);
export const codeHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.definitionKeyword, tags.modifier, tags.self, tags.bool, tags.null, tags.atom], class: 'syntax-keyword' },
  { tag: [tags.controlKeyword, tags.operatorKeyword, tags.moduleKeyword], class: 'syntax-control' },
  { tag: [tags.className, tags.typeName, tags.namespace], class: 'syntax-type' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], class: 'syntax-function' },
  { tag: [tags.variableName, tags.propertyName], class: 'syntax-variable' },
  { tag: [tags.string, tags.special(tags.string)], class: 'syntax-string' },
  { tag: tags.number, class: 'syntax-number' },
  { tag: tags.comment, class: 'syntax-comment' },
  { tag: [tags.operator, tags.punctuation, tags.bracket], class: 'syntax-punctuation' },
  { tag: tags.escape, class: 'syntax-escape' },
]);

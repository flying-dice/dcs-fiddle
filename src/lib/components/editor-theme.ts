import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/** Editor chrome matching the legacy app's Monaco vs-dark look. */
export const vsDarkTheme = EditorView.theme(
	{
		"&": {
			fontSize: "14px",
			backgroundColor: "#1e1e1e",
			color: "#d4d4d4",
		},
		".cm-scroller": {
			fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
		},
		".cm-content": {
			caretColor: "#ffffff",
		},
		".cm-cursor, .cm-dropCursor": {
			borderLeftColor: "#ffffff",
		},
		"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground":
			{
				backgroundColor: "#264f78",
			},
		".cm-gutters": {
			backgroundColor: "#1e1e1e",
			color: "#858585",
			border: "none",
		},
		".cm-activeLineGutter": {
			backgroundColor: "#2c2e33",
			color: "#c6c6c6",
		},
		".cm-activeLine": {
			backgroundColor: "rgba(255, 255, 255, 0.04)",
		},
		".cm-matchingBracket": {
			backgroundColor: "rgba(38, 79, 120, 0.5)",
		},
	},
	{ dark: true }
);

/** Token colours matching Monaco's vs-dark theme. */
export const vsDarkHighlightStyle = HighlightStyle.define([
	{ tag: [t.keyword, t.bool, t.null, t.atom], color: "#569cd6" },
	{ tag: [t.controlKeyword, t.moduleKeyword], color: "#c586c0" },
	{ tag: [t.string, t.special(t.string)], color: "#ce9178" },
	{ tag: t.number, color: "#b5cea8" },
	{ tag: [t.comment, t.blockComment, t.lineComment], color: "#6a9955" },
	{ tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#dcdcaa" },
	{ tag: [t.variableName, t.propertyName, t.attributeName, t.labelName], color: "#9cdcfe" },
	{ tag: [t.typeName, t.className, t.namespace, t.self], color: "#4ec9b0" },
	{ tag: [t.operator, t.punctuation, t.bracket, t.derefOperator], color: "#d4d4d4" },
	{ tag: t.regexp, color: "#d16969" },
	{ tag: t.invalid, color: "#f44747" },
]);

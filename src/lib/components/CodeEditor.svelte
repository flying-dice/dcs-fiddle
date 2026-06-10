<script lang="ts">
	import { onMount } from "svelte";
	import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
	import { EditorState, type Extension } from "@codemirror/state";
	import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
	import { StreamLanguage, bracketMatching, syntaxHighlighting } from "@codemirror/language";
	import { lua } from "@codemirror/legacy-modes/mode/lua";
	import { json } from "@codemirror/lang-json";
	import { vsDarkTheme, vsDarkHighlightStyle } from "./editor-theme";

	let {
		value = $bindable(""),
		language = "lua",
		readOnly = false,
	}: { value?: string; language?: "lua" | "json"; readOnly?: boolean } = $props();

	let container: HTMLDivElement;
	let view = $state<EditorView>();

	export function getValue() {
		return view?.state.doc.toString() ?? value;
	}

	// Keep the editor in sync when `value` is replaced externally (e.g. switching
	// files). Guarded so the editor's own edits don't trigger a redundant reset.
	$effect(() => {
		if (view && value !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
		}
	});

	onMount(() => {
		const extensions: Extension[] = [
			lineNumbers(),
			history(),
			bracketMatching(),
			keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
			language === "lua" ? StreamLanguage.define(lua) : json(),
			syntaxHighlighting(vsDarkHighlightStyle),
			vsDarkTheme,
			EditorView.updateListener.of((update) => {
				if (update.docChanged) value = update.state.doc.toString();
			}),
			EditorView.theme({ "&": { height: "100%" } }),
		];

		if (readOnly) {
			extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
		} else {
			extensions.push(highlightActiveLine());
		}

		view = new EditorView({
			parent: container,
			state: EditorState.create({ doc: value, extensions }),
		});

		return () => view?.destroy();
	});
</script>

<div bind:this={container} class="h-full min-h-0 w-full overflow-hidden"></div>

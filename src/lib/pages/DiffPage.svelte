<script lang="ts">
	import JSZip from "jszip";
	import { toast } from "svelte-sonner";
	import { MergeView } from "@codemirror/merge";
	import { EditorView, lineNumbers } from "@codemirror/view";
	import { EditorState } from "@codemirror/state";
	import { json } from "@codemirror/lang-json";
	import { syntaxHighlighting } from "@codemirror/language";
	import { vsDarkTheme, vsDarkHighlightStyle } from "$lib/components/editor-theme";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Separator } from "$lib/components/ui/separator";
	import { cn } from "$lib/utils";
	import { environment } from "$lib/dcs/environment.svelte";
	import { executeLua } from "$lib/dcs/client";
	import { deepSort } from "$lib/deep-sort";

	let selectedFile = $state("mission");
	let leftFiles = $state<Record<string, string>>({});
	let rightFiles = $state<Record<string, string>>({});
	let leftJson = $state<unknown>(undefined);
	let rightJson = $state<unknown>(undefined);

	let mergeContainer: HTMLDivElement;

	const status = $derived(environment.status);
	const files = $derived(Object.keys(leftFiles).sort());

	async function readZip(file: File): Promise<Record<string, string>> {
		const zip = await new JSZip().loadAsync(file);
		const out: Record<string, string> = {};
		for (const entry of Object.values(zip.files)) {
			if (!entry.dir) out[entry.name] = await entry.async("string");
		}
		return out;
	}

	const onPick = (side: "left" | "right") => async (ev: Event) => {
		const file = (ev.target as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			const parsed = await readZip(file);
			if (side === "left") leftFiles = parsed;
			else rightFiles = parsed;
		} catch (e) {
			toast.error("Failed to read miz file", { description: String(e) });
		}
	};

	// Mission files are Lua table assignments; DCS converts them to JSON for us
	async function lua2json(luaTable: string | undefined): Promise<unknown> {
		if (!luaTable) return undefined;
		const { port, selectedState } = environment.environment;
		try {
			const data = await executeLua(port, luaTable.replace(/^.*?\s=\s/, "return"), selectedState);
			return data.result;
		} catch (e) {
			toast.error("Failed to Convert Lua Table", { description: String(e) });
			return undefined;
		}
	}

	$effect(() => {
		void lua2json(leftFiles[selectedFile]).then((it) => (leftJson = it));
	});
	$effect(() => {
		void lua2json(rightFiles[selectedFile]).then((it) => (rightJson = it));
	});

	const display = (jsonValue: unknown, raw: string | undefined) =>
		jsonValue !== undefined ? JSON.stringify(deepSort(jsonValue), undefined, 2) : (raw ?? "");

	$effect(() => {
		const a = display(leftJson, leftFiles[selectedFile]);
		const b = display(rightJson, rightFiles[selectedFile]);

		const extensions = [
			lineNumbers(),
			json(),
			syntaxHighlighting(vsDarkHighlightStyle),
			vsDarkTheme,
			EditorState.readOnly.of(true),
			EditorView.editable.of(false),
		];

		const view = new MergeView({
			a: { doc: a, extensions },
			b: { doc: b, extensions },
			parent: mergeContainer,
		});

		return () => view.destroy();
	});
</script>

<div class="flex min-h-0 border-b" style="grid-column: 2/4; grid-row: 2/3">
	<div class="flex w-[300px] shrink-0 flex-col gap-2 overflow-y-auto border-r p-3">
		<div class="flex flex-col gap-1.5">
			<Label for="left-miz">Left *</Label>
			<Input
				id="left-miz"
				type="file"
				disabled={status.state !== "up"}
				onchange={onPick("left")}
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<Label for="right-miz">Right *</Label>
			<Input
				id="right-miz"
				type="file"
				disabled={status.state !== "up" || leftJson === undefined}
				onchange={onPick("right")}
			/>
		</div>
		<Separator />
		<div class="flex flex-col">
			{#each files as it (it)}
				<button
					class={cn(
						"rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
						selectedFile === it && "bg-muted font-medium"
					)}
					onclick={() => (selectedFile = it)}
				>
					{it}
				</button>
			{/each}
		</div>
	</div>
	<div bind:this={mergeContainer} class="merge-container min-w-0 flex-1 overflow-y-auto"></div>
</div>

<style>
	.merge-container :global(.cm-mergeView) {
		height: 100%;
	}
</style>

<script lang="ts">
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import Check from "@lucide/svelte/icons/check";
	import Copy from "@lucide/svelte/icons/copy";
	import Hash from "@lucide/svelte/icons/hash";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";
	import SquareFunction from "@lucide/svelte/icons/square-function";
	import ToggleLeft from "@lucide/svelte/icons/toggle-left";
	import Type from "@lucide/svelte/icons/type";
	import Box from "@lucide/svelte/icons/box";
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { Button } from "$lib/components/ui/button";
	import { environment } from "$lib/dcs/environment.svelte";
	import { executeLua } from "$lib/dcs/client";
	import { getExploreCommand, getSignatureCommand } from "$lib/dcs/explore";
	import { pathMatchesFilter } from "$lib/explore-filter";
	import { autoExpand } from "$lib/explore-autoexpand.svelte";
	import ExploreNode from "./ExploreNode.svelte";

	let {
		k,
		v,
		scope,
		filter,
		hidden = false,
		onMatchChange,
	}: {
		k: string | number;
		v: unknown;
		scope: (string | number)[];
		filter: string;
		/** Hidden by an ancestor's filter (kept mounted so it can still report matches). */
		hidden?: boolean;
		/** Reports whether this node or any loaded descendant matches the active filter. */
		onMatchChange?: (matched: boolean) => void;
	} = $props();

	const myScope = $derived([...scope, k]);
	const address = $derived(
		myScope.length === 1
			? String(myScope[0])
			: `${myScope[0]}${myScope
					.slice(1)
					.map((it) => `[${JSON.stringify(it)}]`)
					.join("")}`
	);
	const minimatchAddress = $derived(myScope.join("/"));

	const explorable = $derived(v === "table" || v === "root");
	const isFunction = $derived(typeof v === "string" && v.startsWith("function"));

	let data = $state<Record<string, unknown> | unknown[] | undefined>(undefined);
	let fetching = $state(false);
	let copied = $state(false);

	// Resolved parameter names for a function, fetched on demand (expensive).
	let signature = $state<string | undefined>(undefined);
	let signatureFetching = $state(false);

	// Function listings only carry arity (cheap); show the real signature once fetched.
	const displayValue = $derived(
		isFunction && signature !== undefined ? `function ${k}(${signature})` : String(v)
	);

	async function fetchData() {
		const { port, selectedState } = environment.environment;
		try {
			fetching = true;
			const res = await executeLua(port, getExploreCommand(address), selectedState);
			data = JSON.parse(String(res.result));
			toast.success("Success");
		} catch (e) {
			toast.error("Failed", { description: String(e) });
		} finally {
			fetching = false;
		}
	}

	async function fetchSignature() {
		const { port, selectedState } = environment.environment;
		try {
			signatureFetching = true;
			const res = await executeLua(port, getSignatureCommand(address), selectedState);
			signature = String(res.result ?? "");
		} catch (e) {
			toast.error("Failed", { description: String(e) });
		} finally {
			signatureFetching = false;
		}
	}

	function onToggle() {
		if (explorable) {
			data ? (data = undefined) : fetchData();
		} else if (isFunction) {
			fetchSignature();
		}
	}

	function copyData() {
		navigator.clipboard.writeText(JSON.stringify(data));
		toast.message(`Copied ${minimatchAddress} Data to Clipboard`);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	// The explore encoder (matching the server's fiddlejson) prefixes numeric
	// table keys with "_" so they fit in a JSON object. Reverse that here so the
	// real key is used — i.e. drilling builds table[1], not table["_1"].
	function decodeKey(key: string): string | number {
		if (key.length > 1 && key.startsWith("_")) {
			const n = Number(key.slice(1));
			if (!Number.isNaN(n)) return n;
		}
		return key;
	}

	function compareKeys(a: string | number, b: string | number): number {
		if (typeof a === "number" && typeof b === "number") return a - b;
		return String(a).localeCompare(String(b));
	}

	// All loaded children, sorted. Filtering no longer drops entries here — each
	// child decides its own visibility and reports matches up, so an ancestor of
	// a deep match stays visible.
	const childEntries = $derived.by(() => {
		if (Array.isArray(data)) {
			return data.map((value, idx) => [idx + 1, value] as [number, unknown]);
		}
		if (data) {
			return Object.entries(data)
				.map(([key, value]) => [decodeKey(key), value] as [string | number, unknown])
				.sort(([ak], [bk]) => compareKeys(ak, bk));
		}
		return [];
	});

	const filtering = $derived(filter.trim() !== "");
	const selfMatched = $derived(filtering && pathMatchesFilter(minimatchAddress, filter));

	// Match state reported by each loaded child, keyed by child key.
	let childMatched = $state<Record<string, boolean>>({});
	const anyChildMatched = $derived(Object.values(childMatched).some(Boolean));

	// Clear stale child reports whenever the loaded data changes (e.g. collapse).
	$effect(() => {
		data;
		childMatched = {};
	});

	const matched = $derived(filtering ? selfMatched || anyChildMatched : true);
	$effect(() => {
		onMatchChange?.(matched);
	});

	// Auto-expand: on a sweep, fetch this node if it's an unloaded table whose
	// path is on the way to a match. Children mount and continue the cascade,
	// bounded by the shared budget. Only `generation` is reactive here.
	$effect(() => {
		autoExpand.generation;
		untrack(() => {
			if (!explorable || data || fetching) return;
			if (!autoExpand.shouldFetch(minimatchAddress, myScope.length)) return;
			if (autoExpand.claim()) void fetchData();
		});
	});

	const childHidden = (key: string | number) => filtering && childMatched[key] !== true;
</script>

<li
	class={hidden ? "hidden" : "flex items-start gap-1 py-px"}
	data-testid="explore-node"
	data-name={k}
	data-address={minimatchAddress}
>
	<Button
		variant="ghost"
		size="icon-sm"
		disabled={(!explorable && !isFunction) || fetching || signatureFetching}
		title={isFunction ? "Show signature" : undefined}
		onclick={onToggle}
		data-testid="explore-toggle"
	>
		{#if fetching || signatureFetching}
			<LoaderCircle class="animate-spin" />
		{:else if explorable}
			{#if data}
				<ChevronDown />
			{:else}
				<ChevronRight />
			{/if}
		{:else if typeof v === "number"}
			<Hash />
		{:else if isFunction}
			<SquareFunction />
		{:else if typeof v === "boolean"}
			<ToggleLeft />
		{:else if typeof v === "string"}
			<Type />
		{:else}
			<Box />
		{/if}
	</Button>
	<div class="flex min-w-0 flex-col">
		<div class="flex items-center gap-2 py-1">
			<span class="font-mono text-sm">{k}</span>
			<span class="text-sm text-muted-foreground italic">{displayValue}</span>
			{#if data}
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-xs" onclick={copyData} data-testid="explore-copy">
								{#if copied}
									<Check class="text-blue-400" />
								{:else}
									<Copy />
								{/if}
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content side="right">{copied ? "Copied" : "Copy"}</Tooltip.Content>
				</Tooltip.Root>
			{/if}
		</div>
		{#if childEntries.length > 0}
			<ul>
				{#each childEntries as [key, value] (`${minimatchAddress}/${key}`)}
					<ExploreNode
						k={key}
						v={value}
						scope={myScope}
						{filter}
						hidden={childHidden(key)}
						onMatchChange={(m) => (childMatched[key] = m)}
					/>
				{/each}
			</ul>
		{/if}
	</div>
</li>

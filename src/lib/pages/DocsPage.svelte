<script lang="ts">
	import { Marked, type Tokens } from "marked";
	import { router } from "$lib/router.svelte";
	import { cn } from "$lib/utils";

	let { src }: { src: string } = $props();

	const docs = [
		{ label: "Getting Started", path: "/docs", src: "/docs/Installation.md" },
		{ label: "Architecture", path: "/docs/architecture", src: "/docs/Architecture.md" },
		{ label: "Explorer", path: "/docs/explorer", src: "/docs/Explorer.md" },
	];

	const escapeHtml = (text: string) =>
		text
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;");

	// Lines prefixed [++] / [--] are rendered as added/removed highlights,
	// mirroring the legacy Prism highlightLines behaviour.
	const marked = new Marked({
		renderer: {
			code({ text }: Tokens.Code) {
				const lines = text
					.split("\n")
					.map((line) => {
						if (line.startsWith("[++] ")) {
							return `<span class="line add">${escapeHtml(line.slice(5))}</span>`;
						}
						if (line.startsWith("[--] ")) {
							return `<span class="line del">${escapeHtml(line.slice(5))}</span>`;
						}
						return `<span class="line">${escapeHtml(line)}</span>`;
					})
					.join("\n");
				return `<pre><code>${lines}</code></pre>`;
			},
		},
	});

	async function loadDoc(url: string) {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
		return marked.parse(await res.text());
	}
</script>

<div class="flex h-full min-h-0 overflow-hidden">
	<div class="flex w-40 shrink-0 flex-col gap-2 overflow-y-auto p-3 md:w-64 md:p-4">
		{#each docs as doc (doc.path)}
			<button
				class={cn(
					"rounded-[10px] px-3 py-2 text-left hover:bg-muted",
					router.path === doc.path && "bg-muted font-medium"
				)}
				onclick={() => router.navigate(doc.path)}
				data-testid="docs-nav"
			>
				{doc.label}
			</button>
		{/each}
	</div>
	<div class="flex-1 overflow-y-auto py-8">
		<div class="markdown mx-auto max-w-3xl px-6" data-testid="docs-content">
			{#await loadDoc(src)}
				<p class="text-muted-foreground">Loading…</p>
			{:then html}
				<!-- eslint-disable-next-line svelte/no-at-html-tags — local static markdown -->
				{@html html}
			{:catch error}
				<div class="rounded-md border border-destructive p-3 text-destructive">
					{String(error)}
				</div>
			{/await}
		</div>
	</div>
</div>

<style>
	.markdown {
		line-height: 1.6;
	}
	.markdown :global(h1) {
		font-size: 2rem;
		font-weight: 700;
		margin: 1rem 0;
	}
	.markdown :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem;
	}
	.markdown :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem;
	}
	.markdown :global(p) {
		margin: 0.5rem 0;
	}
	.markdown :global(ul) {
		list-style: disc;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}
	.markdown :global(ol) {
		list-style: decimal;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}
	.markdown :global(a) {
		text-decoration: underline;
	}
	.markdown :global(img) {
		max-width: 100%;
		border-radius: 0.5rem;
		margin: 0.5rem 0;
	}
	.markdown :global(pre) {
		background-color: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin: 0.5rem 0;
		overflow-x: auto;
		font-size: 0.85rem;
	}
	.markdown :global(code) {
		font-family: "IBM Plex Mono", ui-monospace, monospace;
	}
	.markdown :global(:not(pre) > code) {
		background-color: var(--color-muted);
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		font-size: 0.85em;
	}
	.markdown :global(pre .line) {
		display: inline;
	}
	.markdown :global(pre .line.add) {
		background-color: rgba(34, 197, 94, 0.2);
		display: inline-block;
		width: 100%;
	}
	.markdown :global(pre .line.del) {
		background-color: rgba(239, 68, 68, 0.2);
		display: inline-block;
		width: 100%;
	}
	.markdown :global(blockquote) {
		border-left: solid #77b9c5 4px;
		padding: 8px 16px;
		background-color: rgba(79, 117, 125, 0.2);
		margin: 0.5rem 0;
	}
	.markdown :global(table) {
		border-collapse: collapse;
		margin: 0.5rem 0;
	}
	.markdown :global(th),
	.markdown :global(td) {
		border: 1px solid var(--color-border);
		padding: 0.375rem 0.75rem;
	}
</style>

<script lang="ts">
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import Download from "@lucide/svelte/icons/download";
	import ExternalLink from "@lucide/svelte/icons/external-link";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import CodeEditor from "./CodeEditor.svelte";
	import { downloadFile } from "$lib/download";
	import { settings } from "$lib/settings.svelte";

	let { date, response }: { date: string; response: unknown } = $props();

	let collapsed = $state(false);

	const responseData = $derived(JSON.stringify(response, undefined, 2));
	const lines = $derived((responseData.match(/\n/g) || [0]).length);
	const displayRes = $derived(
		typeof response === "object" && response !== null ? responseData : String(response)
	);

	const isTooLarge = $derived(displayRes.length > settings.tooLargeBytes);
	const tooLargeMessage = $derived(
		`The response is ${(displayRes.length / 1024 / 1024).toFixed(2)}MB, download or open in a tab to view.`
	);

	// Open the JSON in a new tab so a browser JSON viewer can render it (issue #11).
	function openInTab() {
		const url = URL.createObjectURL(new Blob([displayRes], { type: "application/json" }));
		window.open(url, "_blank", "noopener");
		setTimeout(() => URL.revokeObjectURL(url), 60_000);
	}
</script>

<div class="flex flex-col gap-0.5">
	<div class="flex items-center gap-2 p-1">
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon-sm" onclick={() => (collapsed = !collapsed)}>
						{#if collapsed}
							<ChevronRight />
						{:else}
							<ChevronDown />
						{/if}
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">{collapsed ? "Expand" : "Collapse"}</Tooltip.Content>
		</Tooltip.Root>
		<span class="text-sm text-muted-foreground">{date}</span>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon-sm" onclick={openInTab}>
						<ExternalLink />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">Open in new tab</Tooltip.Content>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="icon-sm"
						onclick={() => downloadFile(displayRes, `${date}.json`)}
					>
						<Download />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">Download</Tooltip.Content>
		</Tooltip.Root>
	</div>
	{#if !collapsed}
		{#if isTooLarge}
			<pre class="rounded-md border bg-muted p-3 font-mono text-sm">{tooLargeMessage}</pre>
		{:else}
			<div
				class="overflow-hidden rounded-md border"
				style="height: {(lines + 2) * 19 + 8}px; max-height: 80vh"
			>
				<CodeEditor value={responseData} language="json" readOnly />
			</div>
		{/if}
	{/if}
</div>

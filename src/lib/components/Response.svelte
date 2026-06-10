<script lang="ts">
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import Download from "@lucide/svelte/icons/download";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import CodeEditor from "./CodeEditor.svelte";
	import { downloadFile } from "$lib/download";

	let { date, response }: { date: string; response: unknown } = $props();

	let collapsed = $state(false);

	const responseData = $derived(JSON.stringify(response, undefined, 2));
	const lines = $derived((responseData.match(/\n/g) || [0]).length);
	const displayRes = $derived(
		typeof response === "object" && response !== null ? responseData : String(response)
	);

	const ONE_MB = 1024 * 1024;
	const isTooLarge = $derived(displayRes.length > ONE_MB);
	const tooLargeMessage = $derived(
		`The response is ${(displayRes.length / ONE_MB).toFixed(2)}MB, download to view.`
	);
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
		<Button variant="ghost" size="icon-sm" onclick={() => downloadFile(displayRes, `${date}.json`)}>
			<Download />
		</Button>
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

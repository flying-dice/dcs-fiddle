<script lang="ts">
	import Send from "@lucide/svelte/icons/send";
	import * as Dialog from "$lib/components/ui/dialog";

	let { open = $bindable(false), link }: { open?: boolean; link: string } = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Send class="size-4" /> Share Script
			</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col gap-3 text-sm">
			<p>Share this link to send your LUA script.</p>
			<p>This link contains your script as base64. Nobody can change your local script.</p>
			<code
				data-testid="share-link"
				class="rounded-md border bg-muted p-3 font-mono text-xs break-all whitespace-pre-wrap select-all"
			>
				{link}
			</code>
		</div>
	</Dialog.Content>
</Dialog.Root>

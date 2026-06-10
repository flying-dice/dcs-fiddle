<script lang="ts">
	import CodeEditor from "$lib/components/CodeEditor.svelte";
	import Response from "$lib/components/Response.svelte";
	import { commands } from "$lib/dcs/commands.svelte";

	let { code = $bindable("") }: { code?: string } = $props();
</script>

<div class="grid h-full min-h-0 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
	<div class="flex min-h-0 border-b md:border-r md:border-b-0">
		<CodeEditor bind:value={code} language="lua" />
	</div>
	<div class="flex min-h-0 overflow-y-auto">
		<div class="flex flex-1 flex-col gap-1 p-2">
			{#each commands.responses as [date, response] (date)}
				<Response {date} {response} />
			{/each}
		</div>
	</div>
</div>

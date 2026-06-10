<script lang="ts">
	import CodeEditor from "$lib/components/CodeEditor.svelte";
	import Response from "$lib/components/Response.svelte";
	import { commands } from "$lib/dcs/commands.svelte";

	let { code = $bindable("") }: { code?: string } = $props();
</script>

<div class="flex min-h-0 border-b" style="grid-column: 2/3; grid-row: 2/3">
	<CodeEditor bind:value={code} language="lua" />
</div>
<div class="flex min-h-0 overflow-y-auto border-b border-l" style="grid-column: 3/4; grid-row: 2/3">
	<div class="flex flex-1 flex-col gap-1 p-2">
		{#each commands.responses as [date, response] (date)}
			<Response {date} {response} />
		{/each}
	</div>
</div>

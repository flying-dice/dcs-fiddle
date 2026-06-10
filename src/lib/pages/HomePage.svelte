<script lang="ts">
	import { untrack } from "svelte";
	import CodeEditor from "$lib/components/CodeEditor.svelte";
	import FileList from "$lib/components/FileList.svelte";
	import Response from "$lib/components/Response.svelte";
	import { commands } from "$lib/dcs/commands.svelte";
	import { files } from "$lib/files.svelte";

	// Local editor buffer mirrored to the active virtual file. Switching files
	// loads the new content; edits are written back. The store reads/writes are
	// untracked so these effects only react to `activeId` and `code` (no loop).
	let code = $state(files.active.content);
	let loadedId = $state(files.activeId);

	// Load content when the active file changes.
	$effect(() => {
		const id = files.activeId;
		untrack(() => {
			if (id !== loadedId) {
				loadedId = id;
				code = files.active.content;
			}
		});
	});

	// Persist edits back to the active file.
	$effect(() => {
		const next = code;
		untrack(() => files.setContent(loadedId, next));
	});
</script>

<div
	class="grid h-full min-h-0 grid-rows-[auto_1fr_1fr] md:grid-cols-[210px_1fr_1fr] md:grid-rows-1"
>
	<div class="max-h-44 min-h-0 border-b md:max-h-none md:border-r md:border-b-0">
		<FileList />
	</div>
	<div class="flex min-h-0 border-b md:border-r md:border-b-0">
		<CodeEditor bind:value={code} language="lua" testid="lua-editor" />
	</div>
	<div class="flex min-h-0 overflow-y-auto">
		<div class="flex flex-1 flex-col gap-1 p-2" data-testid="response-list">
			{#each commands.responses as [date, response] (date)}
				<Response {date} {response} />
			{/each}
		</div>
	</div>
</div>

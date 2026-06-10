<script lang="ts">
	import FilePlus from "@lucide/svelte/icons/file-plus";
	import Pencil from "@lucide/svelte/icons/pencil";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";
	import { files, type VFile } from "$lib/files.svelte";

	let renamingId = $state<string | null>(null);
	let renameValue = $state("");

	function startRename(file: VFile) {
		renamingId = file.id;
		renameValue = file.name;
	}

	function commitRename() {
		if (renamingId) files.rename(renamingId, renameValue);
		renamingId = null;
	}

	function focusSelect(node: HTMLInputElement) {
		node.focus();
		node.select();
	}
</script>

<div class="flex h-full min-h-0 flex-col">
	<div class="flex items-center justify-between border-b px-2 py-1.5">
		<span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Files</span>
		<Button variant="ghost" size="icon-sm" title="New file" onclick={() => files.create()}>
			<FilePlus />
		</Button>
	</div>
	<div class="min-h-0 flex-1 overflow-y-auto p-1">
		{#each files.files as file (file.id)}
			<div
				class={cn(
					"group flex items-center gap-1 rounded-md px-2 py-1 text-sm",
					file.id === files.activeId ? "bg-muted" : "hover:bg-muted/50"
				)}
			>
				{#if renamingId === file.id}
					<input
						class="w-full rounded-sm bg-background px-1 font-mono text-sm outline-none ring-1 ring-ring"
						bind:value={renameValue}
						use:focusSelect
						onblur={commitRename}
						onkeydown={(e) => {
							if (e.key === "Enter") commitRename();
							else if (e.key === "Escape") renamingId = null;
						}}
					/>
				{:else}
					<button
						class="flex-1 truncate text-left font-mono"
						onclick={() => files.select(file.id)}
						ondblclick={() => startRename(file)}
						title={file.name}
					>
						{file.name}
					</button>
					<Button
						variant="ghost"
						size="icon-xs"
						class="opacity-0 group-hover:opacity-100"
						title="Rename"
						onclick={() => startRename(file)}
					>
						<Pencil />
					</Button>
					<Button
						variant="ghost"
						size="icon-xs"
						class="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
						title="Delete"
						onclick={() => files.remove(file.id)}
					>
						<Trash2 />
					</Button>
				{/if}
			</div>
		{/each}
	</div>
</div>

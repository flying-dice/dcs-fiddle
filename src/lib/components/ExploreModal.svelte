<script lang="ts">
	import Search from "@lucide/svelte/icons/search";
	import ListTree from "@lucide/svelte/icons/list-tree";
	import { toast } from "svelte-sonner";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { autoExpand } from "$lib/explore-autoexpand.svelte";
	import ExploreNode from "./ExploreNode.svelte";

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let filter = $state("");

	// A sweep is only meaningful for path patterns (with `/`) — they can be pruned.
	const canSweep = $derived(filter.trim().includes("/"));

	function sweep() {
		if (!autoExpand.request(filter)) {
			toast.message("Use a path pattern with /", {
				description: "e.g. */db/Units/* — bare words only filter already-loaded nodes.",
			});
		}
	}

	// Surface the budget cap once per sweep that hits it.
	$effect(() => {
		if (autoExpand.capped) {
			toast.warning("Stopped auto-expanding", {
				description: "Hit the node limit for one search — refine the pattern to narrow it.",
			});
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		data-testid="explorer-modal"
		class="flex max-h-[85vh] w-[50vw] max-w-[50vw] flex-col sm:max-w-[50vw]"
	>
		<Dialog.Header>
			<Dialog.Title>Explorer</Dialog.Title>
		</Dialog.Header>
		<div class="flex min-h-0 flex-col gap-3">
			<p class="text-sm">
				From here you can explore the DCS scripting environment, functions need to be called via a
				script.
			</p>
			<div class="flex gap-2">
				<div class="relative flex-1">
					<Search class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						class="pl-8"
						placeholder="Search, e.g. */db/Units/* — Enter loads matching unexpanded nodes"
						bind:value={filter}
						data-testid="explorer-search"
						onkeydown={(e) => {
							if (e.key === "Enter") sweep();
						}}
					/>
				</div>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="outline"
								size="icon"
								disabled={!canSweep}
								onclick={sweep}
								data-testid="explorer-expand"
							>
								<ListTree />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">Load matching unexpanded nodes</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<ul class="min-h-0 overflow-y-auto">
				<ExploreNode k="_G" v="root" scope={[]} {filter} />
			</ul>
		</div>
	</Dialog.Content>
</Dialog.Root>

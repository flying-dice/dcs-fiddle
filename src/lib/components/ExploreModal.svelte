<script lang="ts">
	import Search from "@lucide/svelte/icons/search";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import ExploreNode from "./ExploreNode.svelte";

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let filter = $state("");
</script>

<Dialog.Root bind:open>
	<Dialog.Content data-testid="explorer-modal" class="flex max-h-[85vh] w-[50vw] max-w-[50vw] flex-col sm:max-w-[50vw]">
		<Dialog.Header>
			<Dialog.Title>Explorer</Dialog.Title>
		</Dialog.Header>
		<div class="flex min-h-0 flex-col gap-3">
			<p class="text-sm">
				From here you can explore the DCS scripting environment, functions need to be called via a
				script.
			</p>
			<div class="relative">
				<Search class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					class="pl-8"
					placeholder="Search using minimatch syntax, i.e. */db/Units/Planes/Plane/*/*+(Name|type|WorldID)"
					bind:value={filter}
					data-testid="explorer-search"
				/>
			</div>
			<ul class="min-h-0 overflow-y-auto">
				<ExploreNode k="_G" v="root" scope={[]} {filter} />
			</ul>
		</div>
	</Dialog.Content>
</Dialog.Root>

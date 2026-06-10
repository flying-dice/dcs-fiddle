<script lang="ts">
	import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
	import Check from "@lucide/svelte/icons/check";
	import Plus from "@lucide/svelte/icons/plus";
	import { tick } from "svelte";
	import * as Popover from "$lib/components/ui/popover";
	import * as Command from "$lib/components/ui/command";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";

	let {
		value,
		states,
		onSelect,
	}: {
		/** Currently selected state, or undefined for the default state. */
		value: string | undefined;
		/** Known states offered as suggestions. */
		states: string[];
		/** Called with the chosen state, or undefined to clear to default. */
		onSelect: (state: string | undefined) => void;
	} = $props();

	let open = $state(false);
	let search = $state("");
	let triggerRef = $state<HTMLButtonElement>(null!);

	// A custom state is anything the user typed that isn't already a suggestion.
	const trimmed = $derived(search.trim());
	const isCustom = $derived(trimmed !== "" && !states.includes(trimmed));

	function choose(state: string | undefined) {
		onSelect(state);
		closeAndFocus();
	}

	function closeAndFocus() {
		open = false;
		search = "";
		// refocus the trigger so keyboard users keep their place
		tick().then(() => triggerRef?.focus());
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn("w-44 justify-between font-normal", !value && "text-muted-foreground")}
			>
				<span class="truncate">{value ?? "Add Optional State"}</span>
				<ChevronsUpDown class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-44 p-0" align="start">
		<Command.Root>
			<Command.Input placeholder="Search or type…" bind:value={search} />
			<Command.List>
				{#if isCustom}
					<Command.Empty class="p-1">
						<button
							class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
							onclick={() => choose(trimmed)}
						>
							<Plus class="size-4" />
							Use "{trimmed}"
						</button>
					</Command.Empty>
				{:else}
					<Command.Empty>No states found.</Command.Empty>
				{/if}
				<Command.Group>
					<Command.Item value="__default__" keywords={["default"]} onSelect={() => choose(undefined)}>
						<Check class={cn("size-4", value ? "opacity-0" : "opacity-100")} />
						<span class="text-muted-foreground italic">Default</span>
					</Command.Item>
					{#each states as state (state)}
						<Command.Item value={state} onSelect={() => choose(state)}>
							<Check class={cn("size-4", value === state ? "opacity-100" : "opacity-0")} />
							{state}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

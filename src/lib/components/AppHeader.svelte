<script lang="ts">
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import Compass from "@lucide/svelte/icons/compass";
	import Info from "@lucide/svelte/icons/info";
	import CircleAlert from "@lucide/svelte/icons/circle-alert";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";
	import Send from "@lucide/svelte/icons/send";
	import Share2 from "@lucide/svelte/icons/share-2";
	import Settings from "@lucide/svelte/icons/settings";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as ToggleGroup from "$lib/components/ui/toggle-group";
	import StateCombobox from "./StateCombobox.svelte";
	import { environment } from "$lib/dcs/environment.svelte";

	let {
		submitting,
		onSubmit,
		onShare,
		onShowGreetingModal,
		onExplore,
		onSettings,
	}: {
		submitting: boolean;
		onSubmit: () => void;
		onShare: () => void;
		onShowGreetingModal: () => void;
		onExplore: () => void;
		onSettings: () => void;
	} = $props();

	const env = $derived(environment.environment);
	const status = $derived(environment.status);
</script>

<header
	class="z-10 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
	style="grid-row: 1/2; grid-column: 1/3"
>
	<div class="flex items-center gap-3">
		<img src="/logo256.png" alt="DCS Fiddle logo" class="size-9 md:size-12" />
		<h1 class="font-mono text-lg font-bold md:text-2xl">DCS Fiddle...</h1>
	</div>
	<div class="flex flex-wrap items-center gap-2 md:gap-3">
		<div class="flex items-center gap-2">
			<span class="hidden text-lg font-semibold sm:inline">Environment:</span>
			<ToggleGroup.Root
				type="single"
				variant="outline"
				value={env.id}
				onValueChange={(id) => id && environment.setEnvironment(id, env.selectedState)}
			>
				{#each environment.environments as it (it.id)}
					<ToggleGroup.Item value={it.id} data-testid="env-{it.id}">{it.name}</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<span {...props}><CircleAlert class="size-4" /></span>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" class="max-w-sm">
					<div class="flex flex-col gap-2 p-1">
						<span class="text-base font-semibold">Define a custom state</span>
						<span class="font-semibold">Executed lua MUST return a string.</span>
						<span>
							Alternative states will use <code class="rounded bg-muted px-1 font-mono">dostring_in</code>,
							response values must be strings.
						</span>
						<span>For more information see the docs:</span>
						<a
							class="underline"
							href="https://wiki.hoggitworld.com/view/DCS_func_dostring_in"
							target="_blank"
							rel="noreferrer"
						>
							https://wiki.hoggitworld.com/view/DCS_func_dostring_in
						</a>
					</div>
				</Tooltip.Content>
			</Tooltip.Root>
			<StateCombobox
				value={env.selectedState}
				states={env.states}
				onSelect={(state) => environment.setEnvironment(env.id, state)}
			/>
			<span data-testid="connection-status" data-state={status.state}>
				{#if status.state === "up"}
					<CircleCheck class="size-5 text-green-500" />
				{:else if status.state === "checking"}
					<LoaderCircle class="size-5 animate-spin" />
				{:else}
					<CircleX class="size-5 text-red-500" />
				{/if}
			</span>
		</div>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" disabled={status.state !== "up"} onclick={onExplore} data-testid="explore-button">
						<Compass />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">Explorer</Tooltip.Content>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" onclick={onShowGreetingModal} data-testid="info-button">
						<Info />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">Information</Tooltip.Content>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" onclick={onSettings} data-testid="settings-button">
						<Settings />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">Settings</Tooltip.Content>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="secondary" onclick={onShare} data-testid="share-button">
						Share <Share2 />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">Create a shareable link</Tooltip.Content>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} disabled={status.state !== "up" || submitting} onclick={onSubmit} data-testid="send-button">
						{#if submitting}
							<LoaderCircle class="animate-spin" />
						{/if}
						Send <Send />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">Send the editor content to DCS and execute it</Tooltip.Content>
		</Tooltip.Root>
	</div>
</header>

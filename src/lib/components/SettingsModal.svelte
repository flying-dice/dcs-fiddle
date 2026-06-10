<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { settings } from "$lib/settings.svelte";

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const num = (v: string, min: number, fallback: number) => {
		const n = Number(v);
		return Number.isFinite(n) && n >= min ? n : fallback;
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Description>Saved to this device. Tune the console to your screen.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1.5">
				<Label for="max-responses">Recent results kept</Label>
				<Input
					id="max-responses"
					type="number"
					min="1"
					step="1"
					value={settings.maxResponses}
					oninput={(e) => (settings.maxResponses = num(e.currentTarget.value, 1, settings.maxResponses))}
				/>
				<p class="text-xs text-muted-foreground">
					How many command results to keep in the console before old ones drop off.
				</p>
			</div>
			<div class="flex flex-col gap-1.5">
				<Label for="too-large">"Too large" threshold (MB)</Label>
				<Input
					id="too-large"
					type="number"
					min="0.1"
					step="0.1"
					value={settings.tooLargeMb}
					oninput={(e) => (settings.tooLargeMb = num(e.currentTarget.value, 0.1, settings.tooLargeMb))}
				/>
				<p class="text-xs text-muted-foreground">
					Responses bigger than this show a download/open-in-tab prompt instead of rendering inline.
				</p>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import Download from "@lucide/svelte/icons/download";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Label } from "$lib/components/ui/label";
	import { Separator } from "$lib/components/ui/separator";
	import { config } from "$lib/config";

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const DONT_SHOW_AGAIN_KEY = "DONT_SHOW_AGAIN";

	let dontShowAgain = $state(localStorage.getItem(DONT_SHOW_AGAIN_KEY) === "true");

	function setDontShowAgain(checked: boolean) {
		dontShowAgain = checked;
		localStorage.setItem(DONT_SHOW_AGAIN_KEY, JSON.stringify(checked));
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content data-testid="greeting-modal" class="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Welcome to DCS Fiddle</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col gap-3 text-sm">
			<p>This website is a text editor and console which talks to DCS via an API.</p>
			<p>
				It allows you to run any LUA code inside DCS within the target environment (Mission/GUI)
				with any state.
			</p>

			<h3 class="text-base font-semibold">Usage</h3>
			<p>
				Pressing the <b>Send</b> button will submit the command to DCS, the result of the command is
				returned.
			</p>
			<p>Pressing the <b>Share</b> button will encode your script into a shareable link.</p>

			<h3 class="text-base font-semibold">Installation</h3>
			<p>Download the hook</p>
			<a href={config.script.src} download="dcs-fiddle-server.lua" class="flex items-center gap-2 underline">
				<Download class="size-4" />
				dcs-fiddle-server.lua
			</a>
			<p>Install it into the DCS Saved Games folder inside Scripts/Hooks.</p>

			<div class="flex flex-col gap-1">
				<span class="text-xs font-semibold text-muted-foreground">Release</span>
				<code class="rounded-md border bg-muted p-2 font-mono text-xs">{config.script.dest}</code>
				<span class="mt-1 text-xs font-semibold text-muted-foreground">Open Beta</span>
				<code class="rounded-md border bg-muted p-2 font-mono text-xs">{config.script.destob}</code>
			</div>

			<p class="font-semibold">
				If you haven't already, you will need to de-sanitize the
				<code class="rounded bg-muted px-1 font-mono">require</code> and
				<code class="rounded bg-muted px-1 font-mono">package</code> module so the server can start
			</p>
			<p>See the Getting started guide inside the documentation for more information.</p>
			<a href="/docs" target="_blank" class="underline">Getting Started Docs</a>

			<h3 class="text-base font-semibold">Disclaimer</h3>
			<p class="italic">
				The Software and code samples available on this website are provided "as is" without
				warranty of any kind, either express or implied. Use at your own risk. By pressing proceed
				you understand these risks.
			</p>

			<Separator />

			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Checkbox
						id="dont-show-again"
						checked={dontShowAgain}
						onCheckedChange={(checked) => setDontShowAgain(checked === true)}
					/>
					<Label for="dont-show-again">Dont Show Again</Label>
				</div>
				<Button onclick={() => (open = false)} data-testid="greeting-proceed">Proceed</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

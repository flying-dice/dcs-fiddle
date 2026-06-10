<script lang="ts">
	import { onMount } from "svelte";
	import { Toaster } from "$lib/components/ui/sonner";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import AppHeader from "$lib/components/AppHeader.svelte";
	import AppNavbar from "$lib/components/AppNavbar.svelte";
	import ExploreModal from "$lib/components/ExploreModal.svelte";
	import GreetingModal from "$lib/components/GreetingModal.svelte";
	import ShareModal from "$lib/components/ShareModal.svelte";
	import SettingsModal from "$lib/components/SettingsModal.svelte";
	import HomePage from "$lib/pages/HomePage.svelte";
	import DiffPage from "$lib/pages/DiffPage.svelte";
	import DocsPage from "$lib/pages/DocsPage.svelte";
	import { commands } from "$lib/dcs/commands.svelte";
	import { environment } from "$lib/dcs/environment.svelte";
	import { router } from "$lib/router.svelte";

	const params = new URLSearchParams(window.location.search);
	const sharedCommand = params.get("command");

	// Persist the editor buffer per browser tab so a reload doesn't lose work
	// (issue #10, first slice). sessionStorage keeps tabs independent; durable
	// named files / GitHub sync remain follow-up scope.
	const SCRATCH_KEY = "dcs-fiddle-scratch";
	let code = $state(
		sharedCommand
			? atob(sharedCommand)
			: (sessionStorage.getItem(SCRATCH_KEY) ?? "return env.mission.theatre")
	);
	$effect(() => {
		try {
			sessionStorage.setItem(SCRATCH_KEY, code);
		} catch {
			// ignore storage failures
		}
	});

	let greetingOpen = $state(localStorage.getItem("DONT_SHOW_AGAIN") !== "true");
	let exploreOpen = $state(false);
	let shareOpen = $state(false);
	let shareLink = $state("");
	let settingsOpen = $state(false);

	function openShare() {
		const url = new URL(window.location.origin);
		url.searchParams.set("command", btoa(code));
		url.searchParams.set("env", environment.environment.id);
		if (environment.environment.selectedState) {
			url.searchParams.set("state", environment.environment.selectedState);
		}
		shareLink = url.href;
		shareOpen = true;
	}

	onMount(() => environment.start());

	const docSrc = $derived(
		router.path === "/docs/architecture"
			? "/docs/Architecture.md"
			: router.path === "/docs/explorer"
				? "/docs/Explorer.md"
				: "/docs/Installation.md"
	);
</script>

<Tooltip.Provider delayDuration={500}>
	<Toaster richColors />
	<GreetingModal bind:open={greetingOpen} />
	<ExploreModal bind:open={exploreOpen} />
	<ShareModal bind:open={shareOpen} link={shareLink} />
	<SettingsModal bind:open={settingsOpen} />

	<div
		class="grid h-screen w-screen overflow-hidden bg-background text-foreground"
		style="grid-template-rows: auto minmax(0, 1fr); grid-template-columns: 50px minmax(0, 1fr)"
	>
		<AppHeader
			submitting={commands.submitting}
			onSubmit={() => commands.submit(code)}
			onShare={openShare}
			onShowGreetingModal={() => (greetingOpen = true)}
			onExplore={() => (exploreOpen = true)}
			onSettings={() => (settingsOpen = true)}
		/>
		<AppNavbar />
		<main class="min-h-0 overflow-hidden" style="grid-column: 2/3; grid-row: 2/3">
			{#if router.path === "/diff"}
				<DiffPage />
			{:else if router.path.startsWith("/docs")}
				{#key docSrc}
					<DocsPage src={docSrc} />
				{/key}
			{:else}
				<HomePage bind:code />
			{/if}
		</main>
	</div>
</Tooltip.Provider>

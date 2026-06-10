<script lang="ts">
	import House from "@lucide/svelte/icons/house";
	import FileArchive from "@lucide/svelte/icons/file-archive";
	import Book from "@lucide/svelte/icons/book";
	import CircleHelp from "@lucide/svelte/icons/circle-help";
	import GithubIcon from "./GithubIcon.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { router } from "$lib/router.svelte";
	import { cn } from "$lib/utils";
	import type { Component } from "svelte";

	const links: {
		label: string;
		testid: string;
		icon: Component;
		path?: string;
		href?: string;
	}[] = [
		{ label: "Home", testid: "nav-home", icon: House, path: "/" },
		{ label: "Miz File Diff", testid: "nav-diff", icon: FileArchive, path: "/diff" },
		{ label: "Documentation", testid: "nav-docs", icon: Book, path: "/docs" },
		{ label: "Support", testid: "nav-support", icon: CircleHelp, href: "https://github.com/JonathanTurnock/dcsfiddle/issues" },
		{ label: "Github", testid: "nav-github", icon: GithubIcon, href: "https://github.com/JonathanTurnock/dcsfiddle" },
	];

	const isActive = (path?: string) =>
		path !== undefined && (path === "/" ? router.path === "/" : router.path.startsWith(path));
</script>

<nav class="flex flex-col border-r" style="grid-row: 2/3; grid-column: 1/2">
	{#each links as link (link.label)}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						data-testid={link.testid}
						class={cn(
							"flex size-[50px] items-center justify-center border-l-2 border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
							isActive(link.path) && "border-[#90E3F1] bg-muted text-[#5983D8]"
						)}
						onclick={() => (link.path ? router.navigate(link.path) : window.open(link.href))}
					>
						<link.icon class="size-5" />
					</button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="right">{link.label}</Tooltip.Content>
		</Tooltip.Root>
	{/each}
</nav>

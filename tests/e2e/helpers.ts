import { type Page, expect } from "@playwright/test";

/** Navigate to the app, dismiss the greeting modal, optionally wait for "up". */
export async function gotoApp(page: Page, opts: { waitUp?: boolean } = {}) {
	const { waitUp = true } = opts;
	await page.goto("/");
	const proceed = page.getByTestId("greeting-proceed");
	await proceed.click();
	await expect(page.getByTestId("greeting-modal")).toBeHidden();
	if (waitUp) {
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "up");
	}
}

/** Replace the contents of a CodeMirror editor identified by its testid. */
export async function setEditor(page: Page, text: string, testid = "lua-editor") {
	const sel = `[data-testid="${testid}"] .cm-content`;
	await page.locator(sel).click();
	await page.evaluate(
		({ sel, text }) => {
			const cm = document.querySelector(sel) as HTMLElement;
			cm.focus();
			document.execCommand("selectAll", false);
			document.execCommand("insertText", false, text);
		},
		{ sel, text }
	);
}

/** Content of the currently active virtual file (the source of truth for the editor). */
export async function activeContent(page: Page): Promise<string | undefined> {
	return page.evaluate(() => {
		const files = JSON.parse(localStorage.getItem("dcs-fiddle-files") || "[]");
		const active = sessionStorage.getItem("dcs-fiddle-active-file");
		return (files.find((f: { id: string }) => f.id === active) || files[0])?.content;
	});
}

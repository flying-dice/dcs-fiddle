import { test, expect, type Page } from "@playwright/test";
import { gotoApp } from "./helpers";

const node = (page: Page, name: string) =>
	page.locator(`[data-testid="explore-node"][data-name="${name}"]`);

const toggle = (page: Page, name: string) =>
	node(page, name).locator('[data-testid="explore-toggle"]').first();

async function openExplorer(page: Page) {
	await gotoApp(page);
	await page.getByTestId("explore-button").click();
	await expect(page.getByTestId("explorer-modal")).toBeVisible();
}

test.describe("namespace explorer", () => {
	test("expands the root and lists children with type icons", async ({ page }) => {
		await openExplorer(page);
		await toggle(page, "_G").click();
		await expect(node(page, "trigger")).toBeVisible();
		await expect(node(page, "world")).toBeVisible();
		await expect(node(page, "greeting")).toContainText("function greeting(name)");
		await expect(node(page, "version")).toContainText("2.5");
	});

	test("drills several levels deep", async ({ page }) => {
		await openExplorer(page);
		await toggle(page, "_G").click();
		await toggle(page, "trigger").click();
		await expect(node(page, "action")).toBeVisible();
		await toggle(page, "action").click();
		await expect(node(page, "outText")).toContainText("function outText(text, time)");
	});

	test("filters live and keeps ancestors of a deep match", async ({ page }) => {
		await openExplorer(page);
		await toggle(page, "_G").click();
		await toggle(page, "trigger").click();
		await toggle(page, "action").click();

		await page.getByTestId("explorer-search").fill("action");
		// ancestor stays visible even though "trigger" doesn't contain "action"
		await expect(node(page, "trigger")).toBeVisible();
		await expect(node(page, "action")).toBeVisible();
		await expect(node(page, "outText")).toBeVisible();
		// non-matching siblings are hidden
		await expect(node(page, "world")).toBeHidden();
		await expect(node(page, "greeting")).toBeHidden();

		// clearing restores everything
		await page.getByTestId("explorer-search").fill("");
		await expect(node(page, "world")).toBeVisible();
	});

	test("explores mixed numeric/string keys and drills a numeric index", async ({ page }) => {
		await openExplorer(page);
		await toggle(page, "_G").click();
		await toggle(page, "mixed").click();
		// numeric key shows as 1 (not _1); string key intact
		await expect(node(page, "1")).toBeVisible();
		await expect(node(page, "name")).toContainText("Enfield11");
		// drilling the numeric key resolves _G["mixed"][1]
		await toggle(page, "1").click();
		await expect(node(page, "x")).toContainText("100.5");
		await expect(node(page, "y")).toContainText("200");
	});

	test("copies a node's data to the clipboard", async ({ page }) => {
		await openExplorer(page);
		await toggle(page, "_G").click();
		await node(page, "_G").locator('[data-testid="explore-copy"]').first().click();
		const clip = await page.evaluate(() => navigator.clipboard.readText());
		expect(clip).toContain("trigger");
	});
});

import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { gotoApp } from "./helpers";

const fixture = (name: string) =>
	fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url));

test.describe("miz diff", () => {
	test("uploads miz files, lists their entries and renders the diff", async ({ page }) => {
		await gotoApp(page);
		await page.getByTestId("nav-diff").click();

		// right is disabled until a left file is parsed
		await expect(page.getByTestId("diff-right")).toBeDisabled();

		await page.getByTestId("diff-left").setInputFiles(fixture("left.miz"));
		// the zip's entries become selectable files
		await expect(page.getByTestId("diff-file").filter({ hasText: "mission" })).toBeVisible();
		await expect(page.getByTestId("diff-file").filter({ hasText: "options" })).toBeVisible();

		await expect(page.getByTestId("diff-right")).toBeEnabled();
		await page.getByTestId("diff-right").setInputFiles(fixture("right.miz"));

		// the merge view renders
		await expect(page.locator(".cm-mergeView")).toBeVisible();
	});
});

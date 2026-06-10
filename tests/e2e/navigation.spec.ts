import { test, expect } from "@playwright/test";
import { gotoApp } from "./helpers";

test.describe("navigation", () => {
	test("routes between home, diff and docs", async ({ page }) => {
		await gotoApp(page, { waitUp: false });

		await page.getByTestId("nav-diff").click();
		await expect(page).toHaveURL(/\/diff$/);
		await expect(page.getByTestId("diff-left")).toBeVisible();

		await page.getByTestId("nav-docs").click();
		await expect(page).toHaveURL(/\/docs$/);
		await expect(page.getByTestId("docs-content")).toBeVisible();

		await page.getByTestId("nav-home").click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByTestId("file-list")).toBeVisible();
	});

	test("docs render markdown content and switch pages", async ({ page }) => {
		await gotoApp(page, { waitUp: false });
		await page.getByTestId("nav-docs").click();
		await expect(page.getByTestId("docs-content")).not.toBeEmpty();

		await page.getByTestId("docs-nav").filter({ hasText: "Architecture" }).click();
		await expect(page).toHaveURL(/\/docs\/architecture$/);
		await expect(page.getByTestId("docs-content")).not.toBeEmpty();
	});
});

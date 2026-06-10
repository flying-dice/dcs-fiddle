import { test, expect } from "@playwright/test";

test.describe("greeting modal", () => {
	test("shows on first visit and closes on proceed", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByTestId("greeting-modal")).toBeVisible();
		await page.getByTestId("greeting-proceed").click();
		await expect(page.getByTestId("greeting-modal")).toBeHidden();
	});

	test('"don\'t show again" suppresses it on reload', async ({ page }) => {
		await page.goto("/");
		await page.getByLabel("Dont Show Again").check();
		await page.getByTestId("greeting-proceed").click();
		await page.reload();
		await expect(page.getByTestId("greeting-modal")).toBeHidden();
	});

	test("can be reopened from the info button", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("greeting-proceed").click();
		await page.getByTestId("info-button").click();
		await expect(page.getByTestId("greeting-modal")).toBeVisible();
	});
});

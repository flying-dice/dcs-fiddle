import { test, expect } from "@playwright/test";
import { gotoApp } from "./helpers";

test.describe("environment", () => {
	test("connection status reaches up against the mock", async ({ page }) => {
		await gotoApp(page);
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "up");
	});

	test("can switch between Mission and GUI", async ({ page }) => {
		await gotoApp(page);
		await page.getByTestId("env-gui").click();
		await expect(page.getByTestId("env-gui")).toHaveAttribute("data-state", "on");
		// GUI mock also answers, so it stays up
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "up");
		await page.getByTestId("env-mission").click();
		await expect(page.getByTestId("env-mission")).toHaveAttribute("data-state", "on");
	});

	test("state combobox lists known states and accepts a custom value", async ({ page }) => {
		await gotoApp(page);
		await page.getByTestId("state-combobox").click();
		// known states for Mission
		await expect(page.getByTestId("state-option-mission")).toBeVisible();
		await expect(page.getByTestId("state-option-server")).toBeVisible();
		// pick one
		await page.getByTestId("state-option-config").click();
		await expect(page.getByTestId("state-combobox")).toContainText("config");

		// custom free-text value
		await page.getByTestId("state-combobox").click();
		await page.getByTestId("state-search").fill("debug");
		await page.getByTestId("state-custom").click();
		await expect(page.getByTestId("state-combobox")).toContainText("debug");

		// back to default
		await page.getByTestId("state-combobox").click();
		await page.getByTestId("state-default").click();
		await expect(page.getByTestId("state-combobox")).toContainText("Add Optional State");
	});
});

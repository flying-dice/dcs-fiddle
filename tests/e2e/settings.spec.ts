import { test, expect } from "@playwright/test";
import { gotoApp, setEditor } from "./helpers";

test.describe("settings", () => {
	test("persists configured values across reload", async ({ page }) => {
		await gotoApp(page, { waitUp: false });
		await page.getByTestId("settings-button").click();
		await page.getByTestId("settings-max-responses").fill("7");
		await page.getByTestId("settings-too-large").fill("3");
		await page.keyboard.press("Escape");

		await page.reload();
		await page.getByTestId("greeting-proceed").click().catch(() => {});
		await page.getByTestId("settings-button").click();
		await expect(page.getByTestId("settings-max-responses")).toHaveValue("7");
		await expect(page.getByTestId("settings-too-large")).toHaveValue("3");
	});

	test("max responses caps the console history", async ({ page }) => {
		await gotoApp(page);
		await page.getByTestId("settings-button").click();
		await page.getByTestId("settings-max-responses").fill("2");
		await page.keyboard.press("Escape");

		for (const n of [1, 2, 3]) {
			await setEditor(page, `return ${n}`);
			await page.getByTestId("send-button").click();
			await expect(page.getByTestId("response-item")).toHaveCount(Math.min(n, 2));
		}
		await expect(page.getByTestId("response-item")).toHaveCount(2);
	});
});

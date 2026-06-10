import { test, expect } from "@playwright/test";
import { gotoApp, setEditor } from "./helpers";

test.describe("share", () => {
	test("builds a link encoding the script and environment", async ({ page }) => {
		await gotoApp(page);
		await setEditor(page, "return 1 + 1");
		await page.getByTestId("share-button").click();
		await expect(page.getByTestId("share-link")).toBeVisible();

		const link = (await page.getByTestId("share-link").textContent())?.trim() ?? "";
		const encoded = Buffer.from("return 1 + 1").toString("base64");
		expect(link).toContain(`command=${encoded}`);
		expect(link).toContain("env=mission");
	});

	test("opening a shared link loads the script into a new file", async ({ page }) => {
		const encoded = Buffer.from("return shared.script").toString("base64");
		await page.goto(`/?command=${encoded}&env=mission`);
		await page.getByTestId("greeting-proceed").click();
		await expect(page.locator('[data-testid="file-item"][data-name="shared.lua"]')).toBeVisible();
		await expect(page.locator('[data-testid="lua-editor"] .cm-content')).toContainText(
			"shared.script"
		);
	});
});

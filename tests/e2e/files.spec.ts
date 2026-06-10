import { test, expect } from "@playwright/test";
import { gotoApp, setEditor, activeContent } from "./helpers";

test.describe("virtual files", () => {
	test("starts with a single default file", async ({ page }) => {
		await gotoApp(page, { waitUp: false });
		await expect(page.getByTestId("file-item")).toHaveCount(1);
		await expect(page.getByTestId("file-item")).toHaveAttribute("data-name", "untitled.lua");
	});

	test("creates files that keep independent content", async ({ page }) => {
		await gotoApp(page, { waitUp: false });
		await setEditor(page, "-- FILE ONE");
		await expect.poll(() => activeContent(page)).toBe("-- FILE ONE");

		await page.getByTestId("file-new").click();
		await expect(page.getByTestId("file-item")).toHaveCount(2);
		await setEditor(page, "-- FILE TWO");
		await expect.poll(() => activeContent(page)).toBe("-- FILE TWO");

		// switch back to the first file
		await page.locator('[data-testid="file-item"][data-name="untitled.lua"] [data-testid="file-name"]').click();
		await expect.poll(() => activeContent(page)).toBe("-- FILE ONE");
		await expect(page.locator('[data-testid="lua-editor"] .cm-content')).toContainText("FILE ONE");

		// and to the second
		await page.locator('[data-testid="file-item"][data-name="untitled-1.lua"] [data-testid="file-name"]').click();
		await expect.poll(() => activeContent(page)).toBe("-- FILE TWO");
	});

	test("renames a file", async ({ page }) => {
		await gotoApp(page, { waitUp: false });
		await page.getByTestId("file-name").first().dblclick();
		const input = page.getByTestId("file-rename-input");
		await input.fill("spawn-units.lua");
		await input.press("Enter");
		await expect(page.getByTestId("file-item")).toHaveAttribute("data-name", "spawn-units.lua");
	});

	test("deletes a file", async ({ page }) => {
		await gotoApp(page, { waitUp: false });
		await page.getByTestId("file-new").click();
		await expect(page.getByTestId("file-item")).toHaveCount(2);
		await page.getByTestId("file-item").first().hover();
		await page.getByTestId("file-item").first().getByTestId("file-delete").click();
		await expect(page.getByTestId("file-item")).toHaveCount(1);
	});

	test("files persist across reload", async ({ page }) => {
		await gotoApp(page, { waitUp: false });
		await setEditor(page, "-- persisted work");
		await page.getByTestId("file-new").click();
		await expect.poll(() => activeContent(page)).toBe("");

		await page.reload();
		await page.getByTestId("greeting-proceed").click().catch(() => {});
		await expect(page.getByTestId("file-item")).toHaveCount(2);
		await page.locator('[data-testid="file-item"][data-name="untitled.lua"] [data-testid="file-name"]').click();
		await expect.poll(() => activeContent(page)).toBe("-- persisted work");
	});
});

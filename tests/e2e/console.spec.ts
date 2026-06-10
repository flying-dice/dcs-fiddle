import { test, expect } from "@playwright/test";
import { gotoApp, setEditor } from "./helpers";

test.describe("command console", () => {
	test("sends a command and renders the response", async ({ page }) => {
		await gotoApp(page);
		await setEditor(page, "return env.mission.theatre");
		await page.getByTestId("send-button").click();
		const item = page.getByTestId("response-item").first();
		await expect(item).toBeVisible();
		await expect(item).toContainText("Caucasus");
	});

	test("shows a failure toast and adds no response on error", async ({ page }) => {
		await gotoApp(page);
		await setEditor(page, "return __ERROR__");
		await page.getByTestId("send-button").click();
		await expect(page.getByText("Failed to Submit Command")).toBeVisible();
		await expect(page.getByTestId("response-item")).toHaveCount(0);
	});

	test("guards oversized responses behind a download prompt", async ({ page }) => {
		await gotoApp(page);
		await setEditor(page, "return __BIG__");
		await page.getByTestId("send-button").click();
		await expect(page.getByTestId("response-too-large")).toBeVisible();
		await expect(page.getByTestId("response-too-large")).toContainText("download");
	});

	test("collapses and expands a response", async ({ page }) => {
		await gotoApp(page);
		await setEditor(page, "return env.mission.theatre");
		await page.getByTestId("send-button").click();
		const item = page.getByTestId("response-item").first();
		await expect(item).toContainText("Caucasus");
		await page.getByTestId("response-collapse").first().click();
		await expect(item).not.toContainText("Caucasus");
		await page.getByTestId("response-collapse").first().click();
		await expect(item).toContainText("Caucasus");
	});

	test("opens a response in a new tab", async ({ page }) => {
		await gotoApp(page);
		await setEditor(page, "return env.mission.theatre");
		await page.getByTestId("send-button").click();
		const [popup] = await Promise.all([
			page.waitForEvent("popup"),
			page.getByTestId("response-open-tab").first().click(),
		]);
		expect(popup.url()).toMatch(/^blob:/);
	});

	test("downloads a response as json", async ({ page }) => {
		await gotoApp(page);
		await setEditor(page, "return env.mission.theatre");
		await page.getByTestId("send-button").click();
		const [download] = await Promise.all([
			page.waitForEvent("download"),
			page.getByTestId("response-download").first().click(),
		]);
		expect(download.suggestedFilename()).toMatch(/\.json$/);
	});
});

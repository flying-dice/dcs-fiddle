import { test, expect, type Page, type Route } from "@playwright/test";
import { config } from "../../src/lib/config";
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

	test("no out-of-date indicator when the server version matches", async ({ page }) => {
		await gotoApp(page);
		await expect(page.getByTestId("server-outdated")).toHaveCount(0);
	});

	test("flags a server reporting an older version", async ({ page }) => {
		await page.route("**://127.0.0.1:12080/**", (route) => fulfillUp(route, "0.1.0"));
		await gotoApp(page);
		await expect(page.getByTestId("server-outdated")).toBeVisible();
	});

	test("does not flag a server reporting a newer version", async ({ page }) => {
		await page.route("**://127.0.0.1:12080/**", (route) => fulfillUp(route, "9.0.0"));
		await gotoApp(page);
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "up");
		await settle(page);
		await expect(page.getByTestId("server-outdated")).toHaveCount(0);
	});

	test("flags a legacy server that reports no version", async ({ page }) => {
		await page.route("**://127.0.0.1:12080/**", (route) => fulfillUp(route, null));
		await gotoApp(page);
		await expect(page.getByTestId("server-outdated")).toBeVisible();
	});

	test("reconnecting refreshes the server version", async ({ page }) => {
		let mode: "old" | "down" | "current" = "old";
		await page.route("**://127.0.0.1:12080/**", (route) => {
			if (mode === "down") return route.abort("connectionrefused");
			return fulfillUp(route, mode === "old" ? "0.1.0" : config.expectedServerVersion);
		});
		await gotoApp(page);
		await expect(page.getByTestId("server-outdated")).toBeVisible();

		// old -> disconnect -> current: the warning clears
		mode = "down";
		await recheck(page);
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "error");
		mode = "current";
		await recheck(page);
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "up");
		await settle(page);
		await expect(page.getByTestId("server-outdated")).toHaveCount(0);

		// current -> disconnect -> old: the warning returns
		mode = "down";
		await recheck(page);
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "error");
		mode = "old";
		await recheck(page);
		await expect(page.getByTestId("server-outdated")).toBeVisible();
	});

	test("a delayed response from the previous environment is ignored", async ({ page }) => {
		let hold = false;
		let release!: () => void;
		const released = new Promise<void>((r) => (release = r));
		let held!: () => void;
		const heldReady = new Promise<void>((r) => (held = r));
		let delivered!: () => void;
		const deliveredDone = new Promise<void>((r) => (delivered = r));

		await page.route("**://127.0.0.1:12080/**", async (route) => {
			if (!hold) return fulfillUp(route, config.expectedServerVersion);
			hold = false;
			held();
			await released;
			// the stale Mission answer claims a legacy hook
			await fulfillUp(route, null);
			delivered();
		});
		await gotoApp(page);

		hold = true;
		await recheck(page);
		await heldReady;

		await page.getByTestId("env-gui").click();
		await expect(page.getByTestId("env-gui")).toHaveAttribute("data-state", "on");
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "up");

		release();
		await deliveredDone;
		await settle(page);
		await expect(page.getByTestId("server-outdated")).toHaveCount(0);
		await expect(page.getByTestId("connection-status")).toHaveAttribute("data-state", "up");
	});
});

/** Answer a health check as "UP", reporting `version` in the header (null: no header). */
function fulfillUp(route: Route, version: string | null) {
	const headers: Record<string, string> = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Expose-Headers": "X-DCS-Fiddle-Version",
	};
	if (version !== null) headers["X-DCS-Fiddle-Version"] = version;
	return route.fulfill({
		status: 200,
		contentType: "application/json",
		headers,
		body: JSON.stringify({ result: "UP" }),
	});
}

/** Trigger an immediate health check (the app re-checks on window focus). */
function recheck(page: Page) {
	return page.evaluate(() => window.dispatchEvent(new Event("focus")));
}

/** Let any in-flight response handling run before asserting on its absence. */
function settle(page: Page) {
	return page.evaluate(() => new Promise((r) => setTimeout(r, 250)));
}

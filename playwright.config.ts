import { defineConfig, devices } from "@playwright/test";

const PORT = 5179;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? "github" : [["list"]],
	use: {
		baseURL,
		trace: "on-first-retry",
		permissions: ["clipboard-read", "clipboard-write"],
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: [
		{
			command: "bun tests/mock-dcs.ts",
			url: "http://127.0.0.1:12080",
			reuseExistingServer: !process.env.CI,
			stdout: "ignore",
		},
		{
			command: `bun run dev -- --port ${PORT} --strictPort`,
			url: baseURL,
			reuseExistingServer: !process.env.CI,
			stdout: "ignore",
		},
	],
});

import { toast } from "svelte-sonner";
import { config, type Env } from "$lib/config";
import { executeLua } from "./client";

export type ConnectionState = "checking" | "up" | "error";

export interface SelectedEnv extends Env {
	selectedState?: string;
}

const params = new URLSearchParams(window.location.search);
const pathEnv = config.envs.find((it) => it.id === params.get("env"));
const pathState = params.get("state") || undefined;

const parseVersion = (v: string): [number, number, number] | null => {
	const m = v.trim().match(/^(\d+)\.(\d+)\.(\d+)/);
	return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};

/** True when the installed server predates / is older than what the UI expects. */
export function isServerOutdated(serverVersion: string | undefined, expected: string): boolean {
	if (serverVersion === undefined) return false; // not probed yet
	const s = parseVersion(serverVersion);
	if (!s) return true; // empty/garbage => predates versioning
	const e = parseVersion(expected);
	if (!e) return false;
	for (let i = 0; i < 3; i++) {
		if (s[i] < e[i]) return true;
		if (s[i] > e[i]) return false;
	}
	return false;
}

class EnvironmentStore {
	environments = config.envs;
	environment = $state<SelectedEnv>({
		...(pathEnv || config.envs[0]),
		selectedState: pathState,
	});
	status = $state<{ state: ConnectionState; error?: string }>({ state: "checking" });
	/** Installed server version (probed once per environment); undefined until known. */
	serverVersion = $state<string | undefined>(undefined);

	get outdated() {
		return this.status.state === "up" && isServerOutdated(this.serverVersion, config.expectedServerVersion);
	}

	setEnvironment(id: string, selectedState?: string) {
		const env = this.environments.find((it) => it.id === id);
		if (!env) return;
		this.environment = { ...env, selectedState };
		this.status = { state: "checking" };
		this.serverVersion = undefined; // re-probe for the new environment
		void this.check();
	}

	async check() {
		const { port, selectedState } = this.environment;
		try {
			const data = await executeLua(port, 'return "UP"', selectedState);
			if (data.result === "UP") {
				this.status = { state: "up" };
				if (this.serverVersion === undefined) void this.#probeVersion(port);
			} else {
				this.#fail(
					"Connection Error",
					"Connected to the environment but received an error",
					String(data.result ?? data.error)
				);
			}
		} catch (e) {
			this.#fail("Failed to connect", "Failed to connect to the selected environment", String(e));
		}
	}

	// Probe the installed server version in the server's own env (always default),
	// regardless of the user-selected custom state. Missing => "" => treated as old.
	async #probeVersion(port: number) {
		try {
			const data = await executeLua(port, 'return tostring(fiddle_server_version or "")', "default");
			this.serverVersion = String(data.result ?? "");
		} catch {
			// leave undefined; we'll try again on the next successful check
		}
	}

	#fail(title: string, message: string, error: string) {
		// only toast on the transition into an error so polling doesn't spam
		if (this.status.state !== "error") {
			toast.error(title, { description: `${message}: ${error}` });
		}
		this.status = { state: "error", error };
	}

	/** Starts health-check polling, returns a cleanup function. */
	start(intervalMs = 10_000) {
		void this.check();
		const interval = setInterval(() => void this.check(), intervalMs);
		const onFocus = () => void this.check();
		window.addEventListener("focus", onFocus);
		return () => {
			clearInterval(interval);
			window.removeEventListener("focus", onFocus);
		};
	}
}

export const environment = new EnvironmentStore();

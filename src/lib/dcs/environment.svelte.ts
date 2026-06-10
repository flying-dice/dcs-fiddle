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

class EnvironmentStore {
	environments = config.envs;
	environment = $state<SelectedEnv>({
		...(pathEnv || config.envs[0]),
		selectedState: pathState,
	});
	status = $state<{ state: ConnectionState; error?: string }>({ state: "checking" });

	setEnvironment(id: string, selectedState?: string) {
		const env = this.environments.find((it) => it.id === id);
		if (!env) return;
		this.environment = { ...env, selectedState };
		this.status = { state: "checking" };
		void this.check();
	}

	async check() {
		const { port, selectedState } = this.environment;
		try {
			const data = await executeLua(port, 'return "UP"', selectedState);
			if (data.result === "UP") {
				this.status = { state: "up" };
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

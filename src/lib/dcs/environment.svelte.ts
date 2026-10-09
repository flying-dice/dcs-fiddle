import { toast } from "svelte-sonner";
import { config, type Env } from "$lib/config";
import { executeLuaWithVersion } from "./client";

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

/**
 * True when the installed server predates / is older than what the UI expects.
 * `undefined` means unknown (not connected yet); "" means the server did not
 * report a version, i.e. a hook that predates version reporting.
 */
export function isServerOutdated(serverVersion: string | undefined, expected: string): boolean {
	if (serverVersion === undefined) return false; // not known yet
	if (serverVersion.trim() === "") return true; // predates version reporting
	const s = parseVersion(serverVersion);
	if (!s) return false; // malformed: can't tell, so don't claim it is outdated
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
	/**
	 * Version reported by the running server on its latest health check: "" when
	 * it reports none (legacy hook), undefined while unknown or disconnected.
	 */
	serverVersion = $state<string | undefined>(undefined);
	// Health checks can resolve out of order (polling, focus, environment
	// switches); only the newest result for the current selection is applied.
	#checkSeq = 0;
	#appliedSeq = 0;

	get outdated() {
		return this.status.state === "up" && isServerOutdated(this.serverVersion, config.expectedServerVersion);
	}

	setEnvironment(id: string, selectedState?: string) {
		const env = this.environments.find((it) => it.id === id);
		if (!env) return;
		this.environment = { ...env, selectedState };
		this.status = { state: "checking" };
		this.serverVersion = undefined;
		this.#appliedSeq = this.#checkSeq; // discard checks issued for the previous selection
		void this.check();
	}

	async check() {
		const seq = ++this.#checkSeq;
		const { port, selectedState } = this.environment;
		try {
			// The server reports its version in a response header from its own
			// scope, independent of the selected state and of where commands run.
			const { data, serverVersion } = await executeLuaWithVersion(port, 'return "UP"', selectedState);
			if (this.#isStale(seq)) return;
			if (data.result === "UP") {
				this.status = { state: "up" };
				this.serverVersion = serverVersion ?? "";
			} else {
				this.#fail(
					"Connection Error",
					"Connected to the environment but received an error",
					String(data.result ?? data.error)
				);
			}
		} catch (e) {
			if (this.#isStale(seq)) return;
			this.#fail("Failed to connect", "Failed to connect to the selected environment", String(e));
		}
	}

	/** True when a newer check (or a selection change) superseded check `seq`. */
	#isStale(seq: number) {
		if (seq <= this.#appliedSeq) return true;
		this.#appliedSeq = seq;
		return false;
	}

	#fail(title: string, message: string, error: string) {
		// only toast on the transition into an error so polling doesn't spam
		if (this.status.state !== "error") {
			toast.error(title, { description: `${message}: ${error}` });
		}
		this.status = { state: "error", error };
		this.serverVersion = undefined; // a reconnect may find a different hook
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

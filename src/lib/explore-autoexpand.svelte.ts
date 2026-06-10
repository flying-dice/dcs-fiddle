import { minimatch } from "minimatch";

/**
 * Drives a bounded "auto-expand" sweep for the explorer. The filter only ever
 * matches already-loaded nodes; a sweep fetches *unexpanded* table nodes whose
 * path partially matches a glob pattern, so a deep target under `db` shows up
 * without manually drilling there first.
 *
 * Only path patterns (containing `/`) sweep — a bare word or basename glob can't
 * be pruned, so it would fetch the whole namespace. A budget caps how many nodes
 * a single sweep may fetch, protecting the single-threaded DCS server.
 */
const DEFAULT_BUDGET = 200;

class AutoExpand {
	/** Bumped on each sweep request; nodes react to this to (re)evaluate. */
	generation = $state(0);
	pattern = $state("");
	/** Set when a sweep ran out of budget — the UI surfaces this once. */
	capped = $state(false);

	#budget = $state(0);

	/** Request a sweep. Returns false (no-op) for non-path patterns. */
	request(pattern: string, budget = DEFAULT_BUDGET): boolean {
		const p = pattern.trim();
		if (!p.includes("/")) return false;
		this.pattern = p;
		this.#budget = budget;
		this.capped = false;
		this.generation += 1;
		return true;
	}

	/** Would a node at `path` be on the way to (or be) a match? */
	shouldFetch(path: string): boolean {
		if (this.pattern === "") return false;
		return minimatch(path, this.pattern, { partial: true });
	}

	/** Consume one fetch from the budget; false once exhausted. */
	claim(): boolean {
		if (this.#budget <= 0) {
			this.capped = true;
			return false;
		}
		this.#budget -= 1;
		return true;
	}
}

export const autoExpand = new AutoExpand();

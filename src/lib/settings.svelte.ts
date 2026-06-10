const KEY = "dcs-fiddle-settings";

const DEFAULTS = {
	/** How many command results to keep in the console. */
	maxResponses: 50,
	/** Responses larger than this (MB) show a download prompt instead of rendering inline. */
	tooLargeMb: 1,
};

/** User-configurable preview limits, persisted to local storage (issue #9). */
class SettingsStore {
	maxResponses = $state(DEFAULTS.maxResponses);
	tooLargeMb = $state(DEFAULTS.tooLargeMb);

	constructor() {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const s = JSON.parse(raw);
				if (Number.isFinite(s.maxResponses)) this.maxResponses = s.maxResponses;
				if (Number.isFinite(s.tooLargeMb)) this.tooLargeMb = s.tooLargeMb;
			}
		} catch {
			// ignore malformed/blocked storage
		}

		$effect.root(() => {
			$effect(() => {
				try {
					localStorage.setItem(
						KEY,
						JSON.stringify({ maxResponses: this.maxResponses, tooLargeMb: this.tooLargeMb })
					);
				} catch {
					// ignore storage failures (private mode, quota)
				}
			});
		});
	}

	/** "Too large" threshold in bytes. */
	get tooLargeBytes() {
		return this.tooLargeMb * 1024 * 1024;
	}
}

export const settings = new SettingsStore();

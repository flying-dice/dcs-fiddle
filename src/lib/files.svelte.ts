export interface VFile {
	id: string;
	name: string;
	content: string;
}

const FILES_KEY = "dcs-fiddle-files";
const ACTIVE_KEY = "dcs-fiddle-active-file";
const DEFAULT_CONTENT = "return env.mission.theatre";

const uid = () => crypto.randomUUID();

/**
 * Virtual files managed entirely in the browser (issue #10).
 *
 * File contents are shared across tabs via localStorage (a single workspace),
 * while the active selection is per-tab (sessionStorage) so two tabs can view
 * different files. There is always at least one file.
 */
class FilesStore {
	files = $state<VFile[]>([]);
	activeId = $state<string>("");

	constructor() {
		try {
			const raw = localStorage.getItem(FILES_KEY);
			const parsed = raw ? JSON.parse(raw) : null;
			if (Array.isArray(parsed) && parsed.length > 0) {
				this.files = parsed.filter(
					(f) => f && typeof f.id === "string" && typeof f.name === "string"
				);
			}
		} catch {
			// ignore malformed storage
		}

		if (this.files.length === 0) {
			this.files = [{ id: uid(), name: "untitled.lua", content: DEFAULT_CONTENT }];
		}

		const storedActive = sessionStorage.getItem(ACTIVE_KEY);
		this.activeId = this.files.some((f) => f.id === storedActive)
			? storedActive!
			: this.files[0].id;

		$effect.root(() => {
			$effect(() => {
				try {
					localStorage.setItem(FILES_KEY, JSON.stringify(this.files));
					sessionStorage.setItem(ACTIVE_KEY, this.activeId);
				} catch {
					// ignore storage failures (private mode, quota)
				}
			});
		});
	}

	get active(): VFile {
		return this.files.find((f) => f.id === this.activeId) ?? this.files[0];
	}

	select(id: string) {
		this.activeId = id;
	}

	/** Creates a new file (with a unique name), selects it, and returns it. */
	create(name?: string, content = ""): VFile {
		const file: VFile = { id: uid(), name: this.uniqueName(name), content };
		this.files = [...this.files, file];
		this.activeId = file.id;
		return file;
	}

	rename(id: string, name: string) {
		const trimmed = name.trim();
		if (!trimmed) return;
		this.files = this.files.map((f) => (f.id === id ? { ...f, name: trimmed } : f));
	}

	setContent(id: string, content: string) {
		this.files = this.files.map((f) => (f.id === id ? { ...f, content } : f));
	}

	remove(id: string) {
		const index = this.files.findIndex((f) => f.id === id);
		if (index === -1) return;
		const next = this.files.filter((f) => f.id !== id);
		if (next.length === 0) {
			// never leave the workspace empty
			const fresh: VFile = { id: uid(), name: "untitled.lua", content: DEFAULT_CONTENT };
			this.files = [fresh];
			this.activeId = fresh.id;
			return;
		}
		this.files = next;
		if (this.activeId === id) {
			this.activeId = next[Math.max(0, index - 1)].id;
		}
	}

	private uniqueName(base = "untitled"): string {
		const stem = (base.trim() || "untitled").replace(/\.lua$/i, "");
		const taken = new Set(this.files.map((f) => f.name));
		let candidate = `${stem}.lua`;
		let n = 1;
		while (taken.has(candidate)) {
			candidate = `${stem}-${n}.lua`;
			n++;
		}
		return candidate;
	}
}

export const files = new FilesStore();

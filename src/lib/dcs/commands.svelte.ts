import { toast } from "svelte-sonner";
import { environment } from "./environment.svelte";
import { executeLua } from "./client";
import { settings } from "$lib/settings.svelte";

class CommandStore {
	responses = $state<[string, unknown][]>([]);
	submitting = $state(false);

	async submit(command: string) {
		const { port, selectedState } = environment.environment;
		try {
			this.submitting = true;
			const data = await executeLua(port, command, selectedState);
			const entry: [string, unknown] = [
				new Date().toISOString(),
				data.result ?? data.error ?? "",
			];
			this.responses = [entry, ...this.responses].slice(0, settings.maxResponses);
		} catch (e) {
			toast.error("Failed to Submit Command", { description: String(e) });
		} finally {
			this.submitting = false;
		}
	}
}

export const commands = new CommandStore();

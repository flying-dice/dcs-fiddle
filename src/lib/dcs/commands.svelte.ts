import { toast } from "svelte-sonner";
import { environment } from "./environment.svelte";
import { executeLua } from "./client";

class CommandStore {
	responses = $state<[string, unknown][]>([]);
	submitting = $state(false);

	async submit(command: string) {
		const { port, selectedState } = environment.environment;
		try {
			this.submitting = true;
			const data = await executeLua(port, command, selectedState);
			this.responses = [
				[new Date().toISOString(), data.result ?? data.error ?? ""],
				...this.responses,
			];
		} catch (e) {
			toast.error("Failed to Submit Command", { description: String(e) });
		} finally {
			this.submitting = false;
		}
	}
}

export const commands = new CommandStore();

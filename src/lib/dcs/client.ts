export interface DcsResponse {
	result?: unknown;
	error?: string;
}

/**
 * Executes a Lua command against the local DCS fiddle server hook.
 * The command is base64 encoded into the path, the optional state is
 * passed via the `env` query param (see dcs-fiddle-server.lua).
 */
export async function executeLua(
	port: number,
	command: string,
	state?: string
): Promise<DcsResponse> {
	const url = `http://127.0.0.1:${port}/${btoa(command)}?env=${encodeURIComponent(
		state || "default"
	)}`;
	const res = await fetch(url);
	const text = await res.text();

	let data: DcsResponse | undefined;
	try {
		data = JSON.parse(text);
	} catch {
		// non-JSON body, fall through to status handling
	}

	if (!res.ok) throw new Error(data?.error || `Request failed with status ${res.status}`);
	if (!data) throw new Error("Received an invalid response from DCS");

	return data;
}

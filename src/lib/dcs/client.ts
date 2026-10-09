export interface DcsResponse {
	result?: unknown;
	error?: string;
}

/** Response header the server hook reports its own version in (see dcs-fiddle-server.lua). */
export const SERVER_VERSION_HEADER = "X-DCS-Fiddle-Version";

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
	return (await executeLuaWithVersion(port, command, state)).data;
}

/**
 * As {@link executeLua}, also returning the version the server reported in its
 * response header; null when the header is missing (a hook that predates it).
 */
export async function executeLuaWithVersion(
	port: number,
	command: string,
	state?: string
): Promise<{ data: DcsResponse; serverVersion: string | null }> {
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

	return { data, serverVersion: res.headers.get(SERVER_VERSION_HEADER) };
}

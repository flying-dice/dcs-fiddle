/**
 * Mock DCS fiddle server for Playwright E2E tests. Listens on the same ports the
 * app uses (12080 Mission, 12081 GUI) and mimics the real hook's contract:
 * base64-encoded Lua in the path, a JSON `{ result | error }` body, CORS open.
 *
 * Command sentinels let tests drive specific behaviours:
 *   return "UP"     -> health check ok
 *   __ERROR__       -> 500 with an error (drives the failure toast)
 *   __BIG__         -> a >1MB result (drives the "too large" guard)
 *   getMeta(<item>) -> explorer namespace tree for <item>
 *   anything else    -> a small JSON object result
 */

// Explorer namespace, keyed by the Lua address getExploreCommand builds.
const tree: Record<string, Record<string, unknown>> = {
	_G: {
		world: "table",
		trigger: "table",
		mixed: "table",
		db: "table",
		greeting: "function greeting(1 arg)",
		version: 2.5,
		debugEnabled: true,
	},
	'_G["db"]': {
		Units: "table",
		Weapons: "table",
	},
	'_G["db"]["Units"]': {
		Planes: "function listPlanes(0 args)",
	},
	'_G["db"]["Weapons"]': {
		bombs: "function listBombs(0 args)",
	},
	'_G["world"]': {
		getPlayer: "function getPlayer(0 args)",
		event: "table",
	},
	'_G["trigger"]': {
		action: "table",
		misc: "table",
	},
	'_G["trigger"]["action"]': {
		outText: "function outText(3 args)",
		outSound: "function outSound(1 arg)",
		setUnitInternalCargo: "function setUnitInternalCargo(2 args)",
	},
	// mixed numeric + string keys (numeric keys serialised with the "_" prefix)
	'_G["mixed"]': {
		_1: "table",
		name: "Enfield11",
		_2: "function spawn(2 args)",
	},
	'_G["mixed"][1]': {
		x: 100.5,
		y: 200,
	},
};

// On-demand function signatures (parameter names), keyed by function address.
const signatures: Record<string, string> = {
	'_G["greeting"]': "playerName",
	'_G["trigger"]["action"]["outText"]': "text, displayTime, clearView",
};

interface Reply {
	status: number;
	body: { result?: unknown; error?: string };
}

function reply(command: string): Reply {
	const c = command.trim();
	if (c === 'return "UP"') return { status: 200, body: { result: "UP" } };
	if (c.includes("__ERROR__")) return { status: 500, body: { error: "boom: simulated DCS error" } };
	if (c.includes("__BIG__")) return { status: 200, body: { result: "x".repeat(1_100_000) } };

	const sig = c.match(/concat\(getArgs\(([^)]*)\)/);
	if (sig) {
		return { status: 200, body: { result: signatures[sig[1].trim()] ?? "" } };
	}

	const meta = c.match(/getMeta\(([^)]*)\)/);
	if (meta) {
		const item = meta[1].trim();
		return { status: 200, body: { result: JSON.stringify(tree[item] ?? { note: "string" }) } };
	}

	// generic command (incl. diff lua->json conversions): echo so left/right differ
	return { status: 200, body: { result: { theatre: "Caucasus", units: [1, 2, 3], echo: c } } };
}

function handle(req: Request): Response {
	const path = new URL(req.url).pathname.slice(1);
	let command = "";
	try {
		command = path ? atob(decodeURIComponent(path)) : "";
	} catch {
		return new Response(JSON.stringify({ error: "bad base64" }), {
			status: 400,
			headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
		});
	}
	const { status, body } = reply(command);
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
	});
}

for (const port of [12080, 12081]) {
	Bun.serve({ port, fetch: handle });
	console.log(`mock-dcs listening on 127.0.0.1:${port}`);
}

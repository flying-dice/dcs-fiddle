import { minimatch } from "minimatch";

const GLOB_CHARS = /[*?[\]{}!+@()|]/;

/**
 * Decides whether a node's `/`-joined path (e.g. `_G/trigger/action/outText`)
 * matches the explorer filter. Three query styles, from forgiving to precise:
 *
 * - contains `/`  → full minimatch glob over the path (`_G/trigger/*`)
 * - has glob chars → minimatch against the basename (`out*` matches `outText`)
 * - plain word     → case-insensitive substring anywhere in the path (`trigger`)
 *
 * This only decides if *this* node matches; ExploreNode keeps an ancestor
 * visible when a descendant matches, so a bare word still reveals deep nodes.
 */
export function pathMatchesFilter(path: string, filter: string): boolean {
	const query = filter.trim();
	if (query === "") return true;
	if (query.includes("/")) return minimatch(path, query);
	if (GLOB_CHARS.test(query)) return minimatch(path, query, { matchBase: true });
	return path.toLowerCase().includes(query.toLowerCase());
}

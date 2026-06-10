/** Recursively sorts object keys so JSON output is stable for diffing. */
export function deepSort<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map(deepSort) as T;
	}
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.keys(value)
				.sort()
				.map((k) => [k, deepSort((value as Record<string, unknown>)[k])])
		) as T;
	}
	return value;
}

/**
 * Recursively walks a parsed JSON value and attempts to parse any string
 * fields that look like JSON (objects or arrays). Repeats until no further
 * strings can be parsed (handles multiple levels of stringification).
 */
function deepParseStrings(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return deepParseStrings(parsed);
      } catch {
        // not valid JSON – return as-is
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deepParseStrings);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        deepParseStrings(v),
      ])
    );
  }

  return value;
}

export function prettifyJSON(raw: string): string {
  const parsed = JSON.parse(raw); // throws on invalid JSON
  const expanded = deepParseStrings(parsed);
  return JSON.stringify(expanded, null, 2);
}

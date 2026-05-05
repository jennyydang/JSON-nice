/**
 * Escape literal control characters (CR, LF, TAB) that sit inside JSON string
 * values. These are illegal bare in JSON strings and cause JSON.parse to throw.
 * We track parser state (in-string / escaped) so we never touch structural
 * whitespace between tokens.
 */
function escapeControlCharsInStrings(s: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (escaped) {
      out += c;
      escaped = false;
      continue;
    }

    if (c === "\\") {
      escaped = true;
      out += c;
      continue;
    }

    if (c === '"') {
      inString = !inString;
      out += c;
      continue;
    }

    if (inString) {
      if (c === "\r") { out += "\\r"; continue; }
      if (c === "\n") { out += "\\n"; continue; }
      if (c === "\t") { out += "\\t"; continue; }
    }

    out += c;
  }

  return out;
}

/**
 * Recursively walk a parsed JSON value and expand any string fields that
 * contain stringified JSON objects or arrays into real values.
 * Handles multiple levels of stringification.
 */
function deepParseStrings(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      // First attempt: parse as-is.
      try {
        return deepParseStrings(JSON.parse(trimmed));
      } catch {
        // Second attempt: escape any bare control chars inside string literals.
        try {
          return deepParseStrings(JSON.parse(escapeControlCharsInStrings(trimmed)));
        } catch {
          // Not valid JSON – return as-is.
        }
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

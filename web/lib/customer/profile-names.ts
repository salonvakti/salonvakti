export function parseNameParts(meta: Record<string, unknown>): { firstName: string; lastName: string } {
  const f = typeof meta.first_name === "string" ? meta.first_name.trim() : "";
  const l = typeof meta.last_name === "string" ? meta.last_name.trim() : "";
  if (f || l) return { firstName: f, lastName: l };

  const d = typeof meta.display_name === "string" ? meta.display_name.trim() : "";
  if (d) {
    const parts = d.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }

  return { firstName: "", lastName: "" };
}

export function buildDisplayName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ").trim();
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createSlugger() {
  const occurrences = new Map<string, number>();

  return (value: string) => {
    const base = slugify(value) || "section";
    const occurrence = occurrences.get(base) ?? 0;
    occurrences.set(base, occurrence + 1);

    return occurrence === 0 ? base : `${base}-${occurrence + 1}`;
  };
}

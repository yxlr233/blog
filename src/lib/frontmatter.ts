export type FrontmatterValue = string | string[] | boolean | number;

export function parseFrontmatter(source: string) {
  const match = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(source);

  if (!match) {
    return {
      frontmatter: {} as Record<string, FrontmatterValue>,
      content: source.trim()
    };
  }

  const frontmatter = match[1].split(/\r?\n/).reduce<Record<string, FrontmatterValue>>(
    (metadata, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return metadata;

      const separatorIndex = trimmed.indexOf(":");
      if (separatorIndex === -1) return metadata;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      metadata[key] = parseValue(value);
      return metadata;
    },
    {}
  );

  return {
    frontmatter,
    content: source.slice(match[0].length).trim()
  };
}

function parseValue(value: string): FrontmatterValue {
  if (value === "true") return true;
  if (value === "false") return false;

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  const numberValue = Number(value);
  if (value && Number.isFinite(numberValue)) return numberValue;

  return stripQuotes(value);
}

function stripQuotes(value: string) {
  return value.replace(/^["']|["']$/g, "");
}

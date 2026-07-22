import { promises as fs } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/frontmatter";

const pagesDirectory = path.join(process.cwd(), "content", "pages");
const pageCache = new Map<string, Promise<CustomPage | null>>();
let allPagesCache: Promise<CustomPage[]> | null = null;

export type PageMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
};

export type CustomPage = PageMeta & {
  content: string;
};

export async function getAllPages(): Promise<PageMeta[]> {
  allPagesCache ??= readAllPages();
  return allPagesCache;
}

async function readAllPages() {
  let files: string[];

  try {
    files = await fs.readdir(pagesDirectory);
  } catch {
    return [];
  }

  const pages = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => getPageBySlug(file.replace(/\.mdx$/, "")))
  );

  return pages
    .filter((page): page is CustomPage => Boolean(page))
    .sort((a, b) => a.order - b.order);
}

export async function getPageBySlug(slug: string): Promise<CustomPage | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const cached = pageCache.get(slug);
  if (cached) return cached;

  const pagePromise = readPageBySlug(slug);
  pageCache.set(slug, pagePromise);
  return pagePromise;
}

async function readPageBySlug(slug: string): Promise<CustomPage | null> {
  try {
    const filePath = path.join(pagesDirectory, `${slug}.mdx`);
    const source = await fs.readFile(filePath, "utf8");
    const { frontmatter, content } = parseFrontmatter(source);
    return {
      slug,
      title: typeof frontmatter.title === "string" ? frontmatter.title : slug,
      description: typeof frontmatter.description === "string" ? frontmatter.description : "",
      order: typeof frontmatter.order === "number" ? frontmatter.order : 99,
      content
    };
  } catch {
    return null;
  }
}

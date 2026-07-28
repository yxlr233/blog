import { promises as fs } from "node:fs";
import path from "node:path";
import { parseFrontmatter, type FrontmatterValue } from "@/lib/frontmatter";
import { createSlugger, slugify } from "@/lib/slug";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const postCache = new Map<string, Promise<Post | null>>();
let allPostsCache: Promise<Post[]> | null = null;

type Heading = {
  depth: 2 | 3;
  id: string;
  text: string;
};

export type TaxonomyItem = {
  name: string;
  slug: string;
  count: number;
};

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categorySlug: string;
  tags: string[];
  draft: boolean;
  readingTime: string;
  headings: Heading[];
};

type Post = PostMeta & {
  content: string;
  excerpt: string;
};

export type SearchPost = Pick<
  Post,
  | "slug"
  | "title"
  | "description"
  | "date"
  | "category"
  | "categorySlug"
  | "tags"
  | "readingTime"
  | "excerpt"
> & {
  searchText: string;
  searchContent: string;
};

export async function getAllPosts(options: { includeDrafts?: boolean } = {}) {
  allPostsCache ??= readAllPosts();

  const posts = await allPostsCache;
  return options.includeDrafts ? posts : posts.filter((post) => !post.draft);
}

async function readAllPosts() {
  const files = await fs.readdir(postsDirectory);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => getPostBySlug(file.replace(/\.mdx$/, "")))
  );

  return posts
    .filter((post): post is Post => Boolean(post))
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  const cached = postCache.get(slug);
  if (cached) return cached;

  const postPromise = readPostBySlug(slug);
  postCache.set(slug, postPromise);
  return postPromise;
}

async function readPostBySlug(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(postsDirectory, `${slug}.mdx`);
    const source = await fs.readFile(filePath, "utf8");
    const { frontmatter, content } = parseFrontmatter(source);
    const category = readOptionalString(frontmatter.category) ?? "Notes";

    return {
      slug,
      title: requireString(frontmatter.title, "title", slug),
      description: requireString(frontmatter.description, "description", slug),
      date: requireString(frontmatter.date, "date", slug),
      category,
      categorySlug: slugify(category),
      tags: readTags(frontmatter.tags),
      draft: frontmatter.draft === true,
      readingTime: estimateReadingTime(content),
      headings: getHeadings(content),
      excerpt: createExcerpt(content),
      content
    };
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getCategories() {
  const posts = await getAllPosts();
  return collectTaxonomy(posts.map((post) => post.category));
}

export async function getTags() {
  const posts = await getAllPosts();
  return collectTaxonomy(posts.flatMap((post) => post.tags));
}

export async function getPostsByCategory(categorySlug: string) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.categorySlug === categorySlug);
}

export async function getPostsByTag(tagSlug: string) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.some((tag) => slugify(tag) === tagSlug));
}

export function createSearchIndex(posts: Post[]): SearchPost[] {
  return posts.map((post) => {
    const searchContent = stripMdx(post.content);

    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      category: post.category,
      categorySlug: post.categorySlug,
      tags: post.tags,
      readingTime: post.readingTime,
      excerpt: post.excerpt,
      searchContent,
      searchText: normalizeSearchText(
        [post.title, post.description, post.category, post.tags.join(" "), searchContent].join(" ")
      )
    };
  });
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function collectTaxonomy(values: string[]): TaxonomyItem[] {
  const map = new Map<string, TaxonomyItem>();

  for (const value of values) {
    const name = value.trim();

    if (!name) {
      continue;
    }

    const slug = slugify(name);
    const current = map.get(slug);

    if (current) {
      current.count += 1;
    } else {
      map.set(slug, {
        name,
        slug,
        count: 1
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.name.localeCompare(b.name);
  });
}

function requireString(value: FrontmatterValue | undefined, field: string, slug: string) {
  if (typeof value !== "string" || !value) {
    throw new Error(`Post "${slug}" is missing required frontmatter field "${field}".`);
  }

  return value;
}

function readOptionalString(value: FrontmatterValue | undefined) {
  return typeof value === "string" && value ? value : null;
}

function readTags(value: FrontmatterValue | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [String(value)];
}

function estimateReadingTime(content: string) {
  const text = stripMdx(content);
  const westernWords = text.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
  const cjkCharacters = text.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(westernWords / 220 + cjkCharacters / 500));

  return `${minutes} min read`;
}

function getHeadings(content: string): Heading[] {
  const nextSlug = createSlugger();

  return Array.from(content.matchAll(/^(#{2,3})\s+(.+)$/gm)).map((match) => {
    const text = stripMarkdown(match[2]);

    return {
      depth: match[1].length as 2 | 3,
      id: nextSlug(text),
      text
    };
  });
}

function createExcerpt(content: string) {
  return stripMdx(content).slice(0, 180);
}

function stripMdx(content: string) {
  return stripMarkdown(
    content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/import\s.+?from\s.+?;?/g, " ")
      .replace(/export\s+.+/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~|]/g, "")
    .trim();
}

function isFileNotFoundError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

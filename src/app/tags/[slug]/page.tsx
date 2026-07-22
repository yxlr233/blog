import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { getTags, getPostsByTag } from "@/lib/posts";
import { PostList } from "@/components/post-list";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) return { title: "标签未找到" };
  return { title: `标签：${tag.name}`, description: `${tag.name} 标签下的所有文章` };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const [posts, tags] = await Promise.all([getPostsByTag(slug), getTags()]);
  if (!posts.length) notFound();
  const tag = tags.find((t) => t.slug === slug);
  const tagName = tag?.name ?? slug;

  return (
    <main className="page">
      <BackLink href="/tags/">所有标签</BackLink>
      <header className="page-header">
        <p className="eyebrow">Tag</p>
        <h1># {tagName}</h1>
        <p>{posts.length} 篇文章</p>
      </header>
      <PostList posts={posts} />
    </main>
  );
}

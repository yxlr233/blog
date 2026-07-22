import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { getAllPosts, getCategories, getPostsByCategory } from "@/lib/posts";
import { PostList } from "@/components/post-list";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPostsByCategory(slug);
  if (!posts.length) return { title: "分类未找到" };
  return { title: `分类：${posts[0].category}`, description: `${posts[0].category} 分类下的所有文章` };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const posts = await getPostsByCategory(slug);
  if (!posts.length) notFound();
  const categoryName = posts[0].category;

  return (
    <main className="page">
      <BackLink href="/categories/">所有分类</BackLink>
      <header className="page-header">
        <p className="eyebrow">Category</p>
        <h1>{categoryName}</h1>
        <p>{posts.length} 篇文章</p>
      </header>
      <PostList posts={posts} />
    </main>
  );
}

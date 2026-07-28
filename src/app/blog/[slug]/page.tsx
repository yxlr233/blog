import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Folder, Tag } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { createMdxComponents } from "@/components/mdx-components";
import { formatDate } from "@/lib/date";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { site } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { ReadingProgress } from "@/components/reading-progress";
import { RouteLink } from "@/components/route-link";
import { TableOfContents } from "@/components/table-of-contents";
import { mdxOptions } from "@/lib/mdx-options";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      siteName: site.name
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="page post-page">
      <ReadingProgress />
      <BackLink href="/blog/">返回文章列表</BackLink>

      <div className="post-layout">
        <article className="post-article">
          <header className="post-header">
            <div className="post-card-meta">
              <span>{formatDate(post.date)}</span>
              <span>{post.readingTime}</span>
            </div>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <div className="post-taxonomy">
              <RouteLink href={`/categories/${post.categorySlug}/`} className="taxonomy-link">
                <Folder size={14} aria-hidden="true" />
                {post.category}
              </RouteLink>
              {post.tags.map((tag) => (
                <RouteLink href={`/tags/${slugify(tag)}/`} className="taxonomy-link" key={tag}>
                  <Tag size={14} aria-hidden="true" />
                  {tag}
                </RouteLink>
              ))}
            </div>
          </header>

          {post.headings.length > 1 && (
            <TableOfContents headings={post.headings} />
          )}

          <div className="prose">
            <MDXRemote source={post.content} components={createMdxComponents()} options={mdxOptions} />
          </div>
        </article>
      </div>
    </main>
  );
}

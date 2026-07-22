import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPages, getPageBySlug } from "@/lib/pages";
import { createMdxComponents } from "@/components/mdx-components";
import { mdxOptions } from "@/lib/mdx-options";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "页面未找到" };
  return { title: page.title, description: page.description };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <main className="page">
      <header className="custom-page-header">
        <h1>{page.title}</h1>
        {page.description ? <p>{page.description}</p> : null}
      </header>
      <div className="prose">
        <MDXRemote source={page.content} components={createMdxComponents()} options={mdxOptions} />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { getTags } from "@/lib/posts";
import { TaxonomyList } from "@/components/taxonomy-list";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览文章"
};

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Browse</p>
        <h1>文章标签</h1>
        <p>共 {tags.length} 个标签</p>
      </header>
      <TaxonomyList items={tags} type="tag" />
    </main>
  );
}

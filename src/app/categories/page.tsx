import type { Metadata } from "next";
import { getCategories } from "@/lib/posts";
import { TaxonomyList } from "@/components/taxonomy-list";

export const metadata: Metadata = {
  title: "分类",
  description: "按分类浏览文章"
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Browse</p>
        <h1>文章分类</h1>
        <p>共 {categories.length} 个分类</p>
      </header>
      <TaxonomyList items={categories} type="category" />
    </main>
  );
}

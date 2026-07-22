import type { Metadata } from "next";
import { getAllPosts, createSearchIndex } from "@/lib/posts";
import { SearchPanel } from "@/components/search-panel";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索所有文章"
};

export default async function SearchPage() {
  const posts = await getAllPosts();
  const index = createSearchIndex(posts);

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Search</p>
        <h1>搜索</h1>
        <p>在所有 {posts.length} 篇文章中全文检索</p>
      </header>
      <SearchPanel posts={index} />
    </main>
  );
}

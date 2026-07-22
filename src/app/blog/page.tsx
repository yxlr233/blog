import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PostList } from "@/components/post-list";

export const metadata: Metadata = {
  title: "文章",
  description: "所有文章"
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Archive</p>
        <h1>所有文章</h1>
        <p>共 {posts.length} 篇文章</p>
      </header>
      <PostList posts={posts} />
    </main>
  );
}

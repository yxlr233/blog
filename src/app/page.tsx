import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts, getCategories } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { TaxonomyList } from "@/components/taxonomy-list";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);
  const latestPosts = posts.slice(0, 5);

  return (
    <main className="page">
      <section className="intro">
        <div className="intro-copy">
          <p className="eyebrow">Personal notes · Shanghai</p>
          <h1>{site.name}</h1>
          <p className="lede">{site.description}</p>
          <div className="intro-actions">
            <Link href="/blog/" className="button-link">
              浏览所有文章
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/about/" className="button-link secondary">
              关于我
            </Link>
          </div>
        </div>
        <div className="intro-index" aria-label="博客概览">
          <span><strong>{posts.length.toString().padStart(2, "0")}</strong> 篇文章</span>
          <span><strong>{categories.length.toString().padStart(2, "0")}</strong> 个主题</span>
          <span>Design · Engineering · Writing</span>
        </div>
      </section>

      <section aria-labelledby="latest-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest</p>
            <h2 id="latest-heading">最新文章</h2>
          </div>
          <Link href="/blog/" className="text-link">
            查看全部 <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <PostList posts={latestPosts} />
      </section>

      {categories.length > 0 && (
        <section aria-labelledby="categories-heading" className="home-categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse</p>
              <h2 id="categories-heading">文章分类</h2>
            </div>
            <Link href="/categories/" className="text-link">
              查看全部 <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <TaxonomyList items={categories.slice(0, 6)} type="category" />
        </section>
      )}
    </main>
  );
}

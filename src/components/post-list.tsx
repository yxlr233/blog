import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Folder, Tag } from "lucide-react";
import { formatDate } from "@/lib/date";
import type { PostMeta } from "@/lib/posts";
import { slugify } from "@/lib/slug";

type PostListProps = {
  posts: PostMeta[];
  emptyMessage?: string;
};

export function PostList({ posts, emptyMessage = "暂无文章。" }: PostListProps) {
  if (!posts.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <article className="post-card" key={post.slug}>
          <PostMetaLine post={post} />
          <div className="post-card-heading">
            <h2>
              <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
            </h2>
            <ArrowUpRight size={19} aria-hidden="true" />
          </div>
          <p>{post.description}</p>
          <div className="post-taxonomy">
            <Link href={`/categories/${post.categorySlug}/`} className="taxonomy-link">
              <Folder size={14} aria-hidden="true" />
              {post.category}
            </Link>
            {post.tags.map((tag) => (
              <Link href={`/tags/${slugify(tag)}/`} className="taxonomy-link" key={tag}>
                <Tag size={14} aria-hidden="true" />
                {tag}
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function PostMetaLine({ post }: { post: Pick<PostMeta, "date" | "readingTime"> }) {
  return (
    <div className="post-card-meta">
      <span>
        <CalendarDays size={14} aria-hidden="true" />
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </span>
      <span>
        <Clock3 size={14} aria-hidden="true" />
        {post.readingTime}
      </span>
    </div>
  );
}

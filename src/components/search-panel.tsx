"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Folder, Search, Tag, X } from "lucide-react";
import { formatDate } from "@/lib/date";
import { RouteLink } from "@/components/route-link";
import type { SearchPost } from "@/lib/posts";

type SearchPanelProps = {
  posts: SearchPost[];
};

export function SearchPanel({ posts }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const tokens = useMemo(() => tokenize(deferredQuery), [deferredQuery]);

  const results = useMemo(() => {
    if (!tokens.length) {
      return [];
    }

    return posts
      .map((post) => ({
        post,
        score: scorePost(post, tokens)
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.post);
  }, [posts, tokens]);
  const visibleResults = results.slice(0, 24);

  return (
    <section className="search-panel" aria-label="内容搜索">
      <div className="search-box">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、正文、标签或分类"
          type="search"
        />
        {query ? (
          <button
            aria-label="清空搜索"
            className="icon-button subtle"
            onClick={() => setQuery("")}
            title="清空搜索"
            type="button"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="search-count" aria-live="polite">
        {tokens.length
          ? `${results.length} 个结果${results.length > visibleResults.length ? `，显示前 ${visibleResults.length} 个` : ""}`
          : `共 ${posts.length} 篇文章可搜索`}
      </div>

      {!tokens.length ? (
        <p className="empty-state search-prompt">输入关键词以搜索标题、正文、标签或分类。</p>
      ) : visibleResults.length ? (
        <div className="post-list search-results">
          {visibleResults.map((post) => (
            <article className="post-card" key={post.slug}>
              <div className="post-card-meta">
                <span>{formatDate(post.date)}</span>
                <span>{post.readingTime}</span>
              </div>
              <h2>
                <RouteLink href={`/blog/${post.slug}/`}>
                  <HighlightedText text={post.title} tokens={tokens} />
                </RouteLink>
              </h2>
              <p><HighlightedText text={post.description} tokens={tokens} /></p>
              <p className="search-excerpt">
                <HighlightedText text={getSearchExcerpt(post, tokens)} tokens={tokens} />
              </p>
              <div className="post-taxonomy">
                <RouteLink href={`/categories/${post.categorySlug}/`} className="taxonomy-link">
                  <Folder size={14} aria-hidden="true" />
                  <HighlightedText text={post.category} tokens={tokens} />
                </RouteLink>
                {post.tags.map((tag) => (
                  <span className="taxonomy-link" key={tag}>
                    <Tag size={14} aria-hidden="true" />
                    <HighlightedText text={tag} tokens={tokens} />
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">没有匹配的内容。</p>
      )}
    </section>
  );
}

function HighlightedText({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return text;

  const normalizedText = text.toLowerCase();
  const ranges = tokens.flatMap((token) => {
    const matches: Array<[number, number]> = [];
    let offset = 0;

    while (offset < normalizedText.length) {
      const start = normalizedText.indexOf(token, offset);
      if (start === -1) break;
      matches.push([start, start + token.length]);
      offset = start + token.length;
    }

    return matches;
  });

  if (!ranges.length) return text;

  const mergedRanges = ranges
    .sort((a, b) => a[0] - b[0] || b[1] - a[1])
    .reduce<Array<[number, number]>>((merged, range) => {
      const previous = merged.at(-1);

      if (previous && range[0] <= previous[1]) {
        previous[1] = Math.max(previous[1], range[1]);
      } else {
        merged.push([...range]);
      }

      return merged;
    }, []);

  const parts = [];
  let cursor = 0;

  for (const [start, end] of mergedRanges) {
    if (cursor < start) parts.push(text.slice(cursor, start));
    parts.push(<mark className="search-highlight" key={`${start}-${end}`}>{text.slice(start, end)}</mark>);
    cursor = end;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function getSearchExcerpt(post: SearchPost, tokens: string[]) {
  if (!tokens.length) return post.excerpt;

  const normalizedContent = post.searchContent.toLowerCase();
  const firstMatch = tokens.reduce((earliest, token) => {
    const index = normalizedContent.indexOf(token);
    if (index === -1) return earliest;
    return earliest === -1 ? index : Math.min(earliest, index);
  }, -1);

  if (firstMatch === -1) return post.excerpt;

  const start = Math.max(0, firstMatch - 70);
  const end = Math.min(post.searchContent.length, firstMatch + 140);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < post.searchContent.length ? "..." : "";

  return `${prefix}${post.searchContent.slice(start, end).trim()}${suffix}`;
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function scorePost(post: SearchPost, tokens: string[]) {
  let score = 0;

  for (const token of tokens) {
    const inTitle = post.title.toLowerCase().includes(token);
    const inDescription = post.description.toLowerCase().includes(token);
    const inCategory = post.category.toLowerCase().includes(token);
    const inTags = post.tags.some((tag) => tag.toLowerCase().includes(token));
    const inContent = post.searchText.includes(token);

    if (!inContent && !inTitle && !inDescription && !inCategory && !inTags) {
      return 0;
    }

    if (inTitle) score += 8;
    if (inCategory || inTags) score += 5;
    if (inDescription) score += 3;
    if (inContent) score += 1;
  }

  return score;
}

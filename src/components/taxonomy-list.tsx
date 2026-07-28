import { Folder, Hash } from "lucide-react";
import { RouteLink } from "@/components/route-link";
import type { TaxonomyItem } from "@/lib/posts";

type TaxonomyListProps = {
  items: TaxonomyItem[];
  type: "category" | "tag";
};

export function TaxonomyList({ items, type }: TaxonomyListProps) {
  const Icon = type === "category" ? Folder : Hash;
  const basePath = type === "category" ? "/categories" : "/tags";

  if (!items.length) {
    return <p className="empty-state">暂无内容。</p>;
  }

  return (
    <div className="taxonomy-grid">
      {items.map((item) => (
        <RouteLink href={`${basePath}/${item.slug}/`} className="taxonomy-card" key={item.slug}>
          <span className="taxonomy-card-icon">
            <Icon size={18} aria-hidden="true" />
          </span>
          <span>
            <strong>{item.name}</strong>
            <small>{item.count} 篇文章</small>
          </span>
        </RouteLink>
      ))}
    </div>
  );
}

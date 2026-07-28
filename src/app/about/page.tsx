import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { RouteLink } from "@/components/route-link";
import { site } from "@/lib/site";
import { getAllPosts, getCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: "关于",
  description: `关于 ${site.author.name}`
};

export default async function AboutPage() {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">About</p>
        <h1>关于我</h1>
      </header>

      <div className="profile-card">
        <div className="avatar" aria-hidden="true">
          {site.author.initials}
        </div>
        <div className="profile-info">
          <h2>{site.author.name}</h2>
          <p className="profile-role">{site.author.role}</p>
          <p className="profile-location"><MapPin size={14} aria-hidden="true" />{site.author.location}</p>
          <p className="profile-bio">{site.author.bio}</p>
          <div className="profile-links">
            {site.author.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="profile-link"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
            {site.author.email ? (
              <a href={`mailto:${site.author.email}`} className="profile-link">
                <Mail size={14} aria-hidden="true" />
                邮件
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="about-section">
        <h3>博客统计</h3>
        <div className="stats-grid">
          {[
            { label: "文章总数", value: posts.length },
            { label: "文章分类", value: categories.length }
          ].map((stat) => (
            <div key={stat.label} className="stat-item">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h3>快速导航</h3>
        <div className="quick-links">
          {site.nav.slice(0, -1).map((item) => (
            <RouteLink key={item.href} href={item.href} className="button-link secondary">
              {item.label}
            </RouteLink>
          ))}
        </div>
      </div>
    </main>
  );
}

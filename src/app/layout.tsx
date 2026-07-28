import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { site } from "@/lib/site";
import { HeaderControls } from "@/components/header-controls";
import { MotionController } from "@/components/motion-controller";

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`
  },
  description: site.description
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var t = localStorage.getItem('quiet-notes-theme') || 'system';
  var resolved = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
  document.documentElement.dataset.theme = resolved;
})();
`
          }}
        />
      </head>
      <body>
        <MotionController />
        <a className="skip-link" href="#main-content">跳到正文</a>
        <header className="site-header">
          <nav className="nav" aria-label="主导航">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">Y</span>
              <span>{site.name}</span>
            </Link>
            <HeaderControls links={site.nav} />
          </nav>
        </header>
        <div id="main-content" tabIndex={-1}>{children}</div>
        <footer className="site-footer">
          <div className="footer-inner">
            <p>© {new Date().getFullYear()} {site.author.name} · 以 Next.js + MDX 构建</p>
            <div className="footer-links">
              {site.author.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

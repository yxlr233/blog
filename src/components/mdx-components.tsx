import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ExternalLink as ExternalLinkIcon,
  FileText,
  Info,
  Lightbulb,
  Minus
} from "lucide-react";
import { createSlugger } from "@/lib/slug";
import { Tab, Tabs } from "@/components/mdx-tabs";
import { CodeBlock } from "@/components/mdx-code-block";

type CalloutType = "info" | "tip" | "success" | "warning" | "danger";
type BadgeTone = "default" | "accent" | "success" | "warning" | "danger";

const calloutIcons = {
  info: Info,
  tip: Lightbulb,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: CircleAlert
};

function ExternalLink(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href ?? "";
  const isExternal = /^https?:\/\//.test(href);

  return (
    <a
      {...props}
      target={isExternal ? "_blank" : props.target}
      rel={isExternal ? "noreferrer" : props.rel}
    >
      {props.children}
      {isExternal ? <ExternalLinkIcon className="external-link-icon" size={13} aria-hidden="true" /> : null}
    </a>
  );
}

function Callout({
  children,
  title,
  type = "info"
}: {
  children: ReactNode;
  title?: string;
  type?: CalloutType;
}) {
  const Icon = calloutIcons[type] ?? calloutIcons.info;

  return (
    <aside className="callout" data-type={type}>
      <Icon className="callout-icon" size={19} aria-hidden="true" />
      <div className="callout-content">
        {title ? <p className="callout-title">{title}</p> : null}
        <div>{children}</div>
      </div>
    </aside>
  );
}

function Badge({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return <span className="mdx-badge" data-tone={tone}>{children}</span>;
}

function CardGrid({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 }) {
  return <div className="mdx-card-grid" data-columns={columns}>{children}</div>;
}

function Card({
  children,
  title,
  eyebrow,
  href
}: {
  children?: ReactNode;
  title?: string;
  eyebrow?: string;
  href?: string;
}) {
  const content = (
    <>
      {eyebrow ? <span className="mdx-card-eyebrow">{eyebrow}</span> : null}
      <span className="mdx-card-heading">
        {title ? <strong>{title}</strong> : null}
        {href ? <ChevronRight size={17} aria-hidden="true" /> : null}
      </span>
      {children ? <div className="mdx-card-content">{children}</div> : null}
    </>
  );

  return href ? <a className="mdx-card is-link" href={href}>{content}</a> : <div className="mdx-card">{content}</div>;
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="mdx-steps">{children}</ol>;
}

function Step({ children, title }: { children?: ReactNode; title?: string }) {
  return (
    <li className="mdx-step">
      <span className="mdx-step-marker" aria-hidden="true" />
      <div className="mdx-step-content">
        {title ? <strong>{title}</strong> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </li>
  );
}

function Details({ children, summary, open = false }: { children: ReactNode; summary: string; open?: boolean }) {
  return (
    <details className="mdx-details" open={open}>
      <summary>{summary}</summary>
      <div className="mdx-details-content">{children}</div>
    </details>
  );
}

function Checklist({ children }: { children: ReactNode }) {
  return <ul className="mdx-checklist">{children}</ul>;
}

function CheckItem({ children, done = false }: { children: ReactNode; done?: boolean }) {
  const Icon = done ? Check : Minus;
  return (
    <li data-done={done}>
      <Icon size={16} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function FileTree({ children, title = "文件结构" }: { children: ReactNode; title?: string }) {
  return (
    <div className="mdx-file-tree">
      <div className="mdx-file-tree-title"><FileText size={15} aria-hidden="true" />{title}</div>
      <div className="mdx-file-tree-content">{children}</div>
    </div>
  );
}

function Figure({
  src,
  alt,
  caption
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="mdx-figure">
      {/* MDX figures may reference exported local files or arbitrary remote sources. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="table-scroll" role="region" aria-label="表格，可横向滚动" tabIndex={0}>
      <table {...props} />
    </div>
  );
}

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (node && typeof node === "object" && "props" in node) {
    return getTextContent((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function createMdxComponents() {
  const nextSlug = createSlugger();

  function Heading({ level, children, ...props }: ComponentPropsWithoutRef<"h2"> & { level: 2 | 3 }) {
    const id = nextSlug(getTextContent(children));
    const Tag = `h${level}` as "h2" | "h3";

    return (
      <Tag {...props} id={id}>
        <a className="heading-anchor" href={`#${id}`} aria-label={`定位到 ${getTextContent(children)}`}>#</a>
        {children}
      </Tag>
    );
  }

  return {
    a: ExternalLink,
    pre: CodeBlock,
    table: Table,
    h2: (props: ComponentPropsWithoutRef<"h2">) => <Heading {...props} level={2} />,
    h3: (props: ComponentPropsWithoutRef<"h3">) => <Heading {...props} level={3} />,
    Callout,
    Badge,
    CardGrid,
    Card,
    Steps,
    Step,
    Tabs,
    Tab,
    Details,
    Checklist,
    CheckItem,
    FileTree,
    Figure
  };
}

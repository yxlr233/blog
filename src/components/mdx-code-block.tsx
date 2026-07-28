"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode
} from "react";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";

const collapsedLineCount = 12;

const languageNames: Record<string, string> = {
  bash: "Shell",
  css: "CSS",
  html: "HTML",
  js: "JavaScript",
  javascript: "JavaScript",
  json: "JSON",
  md: "Markdown",
  mdx: "MDX",
  plaintext: "Text",
  sh: "Shell",
  shell: "Shell",
  ts: "TypeScript",
  tsx: "TSX",
  txt: "Text",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML"
};

export function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const language = String((props as Record<string, unknown>)["data-language"] ?? "plaintext");
  const lineCount = countCodeLines(children);
  const collapsible = lineCount > collapsedLineCount;
  const [expanded, setExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const contentId = useId();
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    if (!collapsible || !pre) return;

    const measure = () => setExpandedHeight(pre.scrollHeight);
    const resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(measure)
      : null;

    measure();
    resizeObserver?.observe(pre);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [collapsible]);

  const contentStyle = expandedHeight
    ? ({ "--code-expanded-height": `${expandedHeight}px` } as CSSProperties)
    : undefined;

  return (
    <div className="code-block-shell" data-collapsible={collapsible || undefined}>
      <div className="code-block-toolbar">
        <span>{languageNames[language] ?? language.toUpperCase()}</span>
        <button
          aria-label="复制代码"
          className="code-copy-button"
          data-copy-code=""
          title="复制代码"
          type="button"
        >
          <Copy className="copy-icon" size={14} aria-hidden="true" />
          <Check className="copied-icon" size={14} aria-hidden="true" />
          <span className="copy-label">复制</span>
          <span aria-live="polite" className="copied-label" role="status">已复制</span>
        </button>
      </div>
      <div
        className="code-block-content"
        data-collapsed={collapsible && !expanded ? "true" : undefined}
        data-expanded={collapsible && expanded ? "true" : undefined}
        id={contentId}
        style={contentStyle}
      >
        <pre {...props} ref={preRef}>{children}</pre>
      </div>
      {collapsible ? (
        <div className="code-block-footer">
          <button
            aria-controls={contentId}
            aria-expanded={expanded}
            className="code-expand-button"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded
              ? <ChevronUp size={15} aria-hidden="true" />
              : <ChevronDown size={15} aria-hidden="true" />}
            <span>{expanded ? "收起代码" : `展开全部（共 ${lineCount} 行）`}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function countCodeLines(node: ReactNode): number {
  return Children.toArray(node).reduce<number>((count, child) => {
    if (!isValidElement<{ children?: ReactNode; "data-line"?: unknown }>(child)) return count;

    const isLine = Object.prototype.hasOwnProperty.call(child.props, "data-line");
    return count + (isLine ? 1 : 0) + countCodeLines(child.props.children);
  }, 0);
}

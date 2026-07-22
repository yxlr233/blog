import type { ComponentPropsWithoutRef } from "react";
import { Check, Copy } from "lucide-react";

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

  return (
    <div className="code-block-shell">
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
          <span className="copied-label">已复制</span>
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}

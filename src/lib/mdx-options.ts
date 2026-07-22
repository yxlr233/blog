import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark"
  },
  keepBackground: false,
  bypassInlineCode: true,
  defaultLang: {
    block: "plaintext"
  }
};

export const mdxOptions: NonNullable<MDXRemoteProps["options"]> = {
  mdxOptions: {
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]]
  }
};

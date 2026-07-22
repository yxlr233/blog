# YuuYuki Notes

一个使用 Next.js App Router、MDX 与静态导出构建的个人博客。支持文章目录、全文搜索、分类与标签、深浅主题，以及无需手动导入即可使用的 MDX 内容组件。

## 本地开发

```sh
npm install
npm run dev
npm run build
npm run preview
```

生产构建会将静态文件导出到 `out/`。

## 写文章

文章位于 `content/posts/*.mdx`，每篇文章需要以下 frontmatter：

```mdx
---
title: "文章标题"
description: "用于列表和 SEO 的简短摘要"
date: "2026-07-22"
category: "Engineering"
tags: ["Next.js", "MDX"]
draft: false
---

从这里开始写正文。
```

二级和三级标题会自动进入文章目录，并生成稳定的锚点。无需在标题中手动填写 HTML `id`。

## MDX 组件

文章和自定义页面可以直接使用内置组件，不需要写 `import`。目前包含：

- `Callout`、`Badge`
- `CardGrid`、`Card`
- `Steps`、`Step`
- `Tabs`、`Tab`
- `Details`
- `Checklist`、`CheckItem`
- `FileTree`
- `Figure`

完整属性、示例和使用建议见 [MDX 组件使用指南](docs/MDX_COMPONENTS.md)。站内示例位于 `content/posts/custom-mdx-interface.mdx`。

## 主要目录

```txt
content/posts/             博客文章
content/pages/             自定义 MDX 页面
src/components/            页面与 MDX 组件
src/lib/posts.ts           内容读取、目录和搜索索引
src/app/globals.css        全站设计令牌与样式
```

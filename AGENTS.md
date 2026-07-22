# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router blog with static export.

- `src/app/` holds routes, layouts, and global styles.
- `src/components/` contains reusable UI and MDX components.
- `src/lib/` contains content loading, routing, search, and shared helpers.
- `content/posts/` stores MDX blog posts.
- `content/pages/` stores standalone MDX pages.
- `docs/MDX_COMPONENTS.md` documents custom MDX components and usage examples.
- `public/` is for static assets referenced from content or components.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm run dev` starts the local Next.js development server.
- `npm run build` runs the production build and exports the site to `out/`.
- `npm run preview` serves the generated static site from `out/` locally.

Use `npm run build` before opening a PR or publishing content. This repository does not currently define a separate test script.

## Coding Style & Naming Conventions

- Use TypeScript and React function components.
- Follow the existing formatting style in the repository: 2-space indentation, single responsibility modules, and small components.
- Route folders and file names use lowercase and hyphen-free paths where possible, for example `src/app/blog/page.tsx`.
- MDX posts should use kebab-case filenames in `content/posts/`, such as `my-new-post.mdx`.
- Prefer the existing design tokens and shared helpers instead of adding one-off styles.

## Testing Guidelines

There is no dedicated automated test suite yet. The main verification step is a clean production build:

```sh
npm run build
```

For content or UI changes, also verify the rendered result locally with `npm run preview`.

## Commit & Pull Request Guidelines

The Git history in this repository is minimal, so no strict commit convention is established yet. Use short, imperative commit messages, for example `Add GitHub Pages workflow`.

Pull requests should include:

- a concise summary of the change
- a note about any content or route paths affected
- screenshots or screen recordings for visible UI changes
- confirmation that `npm run build` passed

## Agent-Specific Instructions

Do not overwrite existing files unless the task explicitly requires it. Keep changes scoped to the requested feature or content update, and preserve the static-export workflow when editing routes or build settings.

# Repository Guidelines

## Project Overview

YuuYuki Notes is a Next.js 16 App Router blog. It reads local MDX at build time and exports a fully static site to `out/`. There is no database, server runtime, or image optimization service.

The public site is deployed from `main` to the root GitHub Pages domain. The workflow also publishes the portable static export to the orphan `page` branch. Preserve both outputs unless the task explicitly changes deployment.

## Project Structure

- `src/app/`: routes, metadata, layouts, and global styles.
- `src/components/`: reusable React UI and MDX components.
- `src/lib/`: content parsing, search indexing, slugs, dates, and site configuration.
- `content/posts/`: blog posts in kebab-case `.mdx` files.
- `content/pages/`: standalone MDX pages.
- `docs/MDX_COMPONENTS.md`: supported custom MDX component API.
- `public/images/`: assets managed manually or through Pages CMS.
- `scripts/`: the static preview server and Next.js/Termux launcher.
- `.pages.yml`: Pages CMS schema. Keep it aligned with content frontmatter.
- `.github/workflows/ci.yml`: pull-request lint, type checking, and static-build validation.
- `.github/workflows/pages.yml`: main-branch quality checks, static builds, and GitHub Pages deployment.

Generated directories and files such as `.next/`, `out/`, and `*.tsbuildinfo` must not be committed or edited as source.

## Commands

Use Node.js 20.9 or newer and install from the committed lockfile:

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

- `npm run lint`: run ESLint with zero warnings allowed.
- `npm run typecheck`: run TypeScript without emitting files.
- `npm run check`: run both lint and type checking.
- `npm run build`: use the default Next.js 16 toolchain and export to `out/`.
- `npm run preview`: serve the completed export from `out/`.

Android/Termux cannot use the native Turbopack compiler. On Termux use:

```sh
npm run setup:termux
npm run dev:termux
npm run build:termux
```

The Termux scripts opt into Webpack and SWC WebAssembly. Do not add the Termux environment flag to default scripts or GitHub Actions; remote Linux builds must continue using the native default toolchain.

## Code Conventions

- Use TypeScript, React function components, 2-space indentation, and double quotes.
- Follow `.editorconfig` for UTF-8, LF line endings, indentation, and final newlines.
- Keep Server Components as the default. Add `"use client"` only when browser APIs, state, or effects are required.
- Prefer `@/` imports and import helpers from their owning module instead of convenience re-exports.
- Keep module APIs narrow. Do not export types or helpers that have no external consumer.
- Reuse design tokens from `src/app/globals.css`; avoid one-off colors, radii, shadows, and motion values.
- Use `next/link` for internal navigation and preserve trailing slashes in explicit route URLs.
- Preserve accessibility behavior: semantic elements, keyboard support, visible focus states, labels, and reduced-motion handling.
- Do not edit generated `next-env.d.ts` manually; accept changes produced by a verified Next.js build.

## Content Conventions

- Post filenames and route slugs use kebab-case.
- Required post frontmatter: `title`, `description`, `date`, and `category`.
- Optional post frontmatter: `tags` and `draft`.
- Required standalone-page frontmatter: `title`, `description`, and `order`.
- Draft posts must remain absent from public lists, taxonomy pages, search, and static params.
- Custom MDX components must be registered in `src/components/mdx-components.tsx` and documented in `docs/MDX_COMPONENTS.md` in the same change.

## Verification

Run `npm run check` for every code or configuration change. Run a production build when changing routes, content parsing, MDX, dependencies, Next.js configuration, or deployment:

```sh
npm run check
npm run build:termux  # local Android/Termux
npm run build         # supported desktop/server platforms and CI
```

For visible UI changes, verify representative desktop and mobile layouts and include screenshots in a pull request. For content-only changes, confirm the affected route is present in the static build output.

## Dependency And Deployment Rules

- Commit `package.json` and `package-lock.json` together.
- Prefer existing platform APIs and dependencies; justify new production dependencies.
- Keep optional native dependencies omitted on Termux and do not replace the default remote compiler.
- Preserve `output: "export"`, `images.unoptimized`, and trailing-slash routing.
- Keep `BASE_PATH` support even though the primary site currently deploys at the user-domain root.
- Do not remove `.pages.yml`, `public/images/.gitkeep`, the `page` branch publication, or GitHub Pages permissions without confirming the related integration is no longer used.

## Commits And Pull Requests

Use short imperative commit messages. Pull requests should summarize behavior changes, identify affected routes or content, report `npm run check` and build results, and include screenshots for visual changes.

Keep changes scoped. Preserve unrelated work in a dirty worktree and do not rewrite user-authored content unless the task requires it.

# Repository Guidelines

## Project Overview

YuuYuki Notes is a Next.js 16 App Router blog. It reads local MDX at build time and exports a fully static site to `out/`. There is no database, server runtime, or image optimization service.

The public site is deployed from `main` to the root GitHub Pages domain. The workflow also publishes the portable static export to the orphan `page` branch. Preserve both outputs unless the task explicitly changes deployment.

The canonical remote is `https://github.com/yxlr233/yxlr233.github.io.git`, and the public site is `https://yxlr233.github.io/`.

## Project Structure

- `src/app/`: routes, metadata, layouts, and global styles.
- `src/components/`: reusable React UI and MDX components.
- `src/components/route-link.tsx`: the internal-link wrapper that provides Next.js prefetching and pending navigation feedback.
- `src/components/motion-controller.tsx`: global behavior for header scroll state, MDX tabs, and code copying. Article progress and table-of-contents state belong to their own components.
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

## Local Termux Context

- The primary local workspace is `/data/data/com.termux/files/home/blog` on Android/Termux.
- Run local development with `npm run dev:termux`. When the default port is occupied, pass a port through Next.js, for example `npm run dev:termux -- --port 3100`.
- The local browser currently reaches the development server from `192.168.10.5`. Keep that host in `allowedDevOrigins` while this setup is in use so HMR does not serve stale client code.
- Stop the development server before running `npm run build:termux`; both commands write under `.next/`, and concurrent use can corrupt the local Webpack cache or produce misleading results.
- Restart `npm run dev:termux` after a production build when more browser testing is needed. Next.js may switch generated type paths between build and dev; never hand-edit or commit incidental `next-env.d.ts` changes.
- Do not treat initial on-demand compilation time in the Termux development server as production navigation performance. Re-test a route after it has compiled and use the exported build for production conclusions.

## Code Conventions

- Use TypeScript, React function components, 2-space indentation, and double quotes.
- Follow `.editorconfig` for UTF-8, LF line endings, indentation, and final newlines.
- Keep Server Components as the default. Add `"use client"` only when browser APIs, state, or effects are required.
- Prefer `@/` imports and import helpers from their owning module instead of convenience re-exports.
- Keep module APIs narrow. Do not export types or helpers that have no external consumer.
- Reuse design tokens from `src/app/globals.css`; avoid one-off colors, radii, shadows, and motion values.
- Use `RouteLink` from `src/components/route-link.tsx` for internal navigation and preserve trailing slashes in explicit route URLs. Only the wrapper itself should import `next/link` directly unless a task requires deliberately different behavior.
- Preserve `src/app/loading.tsx` and the `useLinkStatus` progress indicator when changing navigation. Next.js handles static-route prefetching; do not add broad eager prefetch loops without measured evidence.
- Preserve accessibility behavior: semantic elements, keyboard support, visible focus states, labels, and reduced-motion handling.
- Do not edit generated `next-env.d.ts` manually; accept changes produced by a verified Next.js build.

## Client Interaction And Hydration

- React components must own stateful attributes on the DOM they render. Do not use a global controller to change another Client Component's `class`, `style`, `aria-*`, or form state before hydration finishes.
- Keep reading progress behavior in `src/components/reading-progress.tsx` and table-of-contents highlighting in `src/components/table-of-contents.tsx`. Do not move their DOM updates back into `MotionController`.
- Use React state and effects for semantic or interactive state. For purely visual progressive enhancement, prefer the Web Animations API when it avoids mutating server-rendered attributes.
- Reuse the motion scale in `src/app/globals.css`: instant for state acknowledgement, fast for hover and press feedback, base for controls and overlays, slow for layout changes, and loading for indefinite progress. Do not introduce one-off durations when an existing tier fits.
- Page content must remain visible independently of hydration and intersection observers. Represent navigation latency with `src/app/loading.tsx` and the `useLinkStatus` progress indicator; do not hide completed page content to create reveal animations.
- Server and first-client renders must be deterministic. Avoid render-time `window` branches, locale-dependent output, `Date.now()`, `Math.random()`, or DOM mutations that can create hydration mismatches.
- When modifying shared effects or client boundaries, test a hard reload and several client-side route transitions. Watch the Next.js development terminal for forwarded `[browser]` hydration warnings, not only compilation errors.

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

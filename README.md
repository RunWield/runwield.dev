# RunWield.dev

Static Astro site for [runwield.dev](https://runwield.dev), driven by Bun and ready for GitHub Pages.

## Local development

Use Bun 1.4.3, as pinned in `package.json`.

```sh
bun install
bun run dev
```

Build and preview the static output:

```sh
bun run build
bun run preview
```

Run `bun run check` to check the site. After a build, run `bun test` to check the generated blog output.

## Features page

`/features` presents expandable categories using the existing site style. Curated copy lives in `src/data/features.ts`;
the detailed source inventory is `docs/user-facing-features.md` in the sibling RunWield repository. Update both when
capabilities change, and keep future work and provider limitations explicit. See `docs/design/features.md`.

Preview locally with `bun run dev` and open `/features`.

## Publish a blog post

Add one Markdown file in `src/pages/blog/`, for example `src/pages/blog/my-post.md`:

```md
---
layout: ../../layouts/BlogPostLayout.astro
title: "My post title"
description: "A short summary of the post."
publishedDate: "2026-09-27"
author: "Carlos Ravelo"
authorUrl: "https://github.com/gandazgul"
---

Write the article here. Do not repeat the title or byline in the body.
```

The filename sets the URL (`my-post.md` becomes `/blog/my-post`). The blog lists all Markdown posts with the newest `publishedDate` first. It sorts equal dates by filename. Use a quoted ISO date (`YYYY-MM-DD`) and keep it fixed after publication. Run `bun run build` and `bun run preview` to check the generated page and list before publication. The existing GitHub Pages workflow publishes `dist/` when changes reach `main`.

## Beta form

The default static-site fallback opens a prefilled email to `beta@runwield.dev`. To post submissions to a form service
or API instead, set `PUBLIC_BETA_FORM_ACTION` to the form endpoint during the build.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds with Bun and publishes `dist/`. In the repository settings, set
Pages → Source to **GitHub Actions**. The `public/CNAME` file configures the custom domain.

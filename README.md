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

## Interactive demo

The homepage `#demo` plays a scripted HTML simulation of a complete RunWield change. It starts paused and provides
chapter navigation, a scrubber, playback speed, and keyboard controls. No agent, model, or video download is involved.
The script and timing live in `src/data/demo.ts`; product screens live in the `Demo*` components. See
[`docs/design/demo.md`](docs/design/demo.md) for the scene contract and maintenance notes.

## Downloads page

`/downloads` lists the Core quick installer, Homebrew, the latest GitHub release, and both Connect plugins. Copyable
commands use `src/components/CopyCommand.astro`. Keep these commands aligned with the Core quickstart and
`RunWield/plugins` marketplace. The Codex listing links here through its `interface.websiteURL` metadata.

## Brand titles

Use `BrandTitle.astro` for visible headings containing RunWield, including dynamic titles. It keeps “Run” white and
“Wield” mint without changing the title text or metadata. In Markdown body headings, use the equivalent
`<span class="brand-name">Run<span class="brand-accent">Wield</span></span>` markup.

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

## Publish a Plan example

Keep the original Plan in `docs/plans/`. Add an Astro route under `src/pages/plans/` that imports the Plan as Markdown and as raw text, then passes both to `PlanLayout`. See `src/pages/plans/publish-blast-radius-deep-dive.astro` for an example.

The layout uses the Plan's first heading as its title. It renders the original body and shows the original YAML front matter in a disclosure that is collapsed by default. Use the layout's slot for an introduction and a link back to the related article. Plan pages appear in the sitemap, but not in the blog post list.

## Beta form

The default static-site fallback opens a prefilled email to `beta@runwield.dev`. To post submissions to a form service
or API instead, set `PUBLIC_BETA_FORM_ACTION` to the form endpoint during the build.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds with Bun and publishes `dist/`. In the repository settings, set
Pages → Source to **GitHub Actions**. The `public/CNAME` file configures the custom domain.

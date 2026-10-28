---
planId: "f2c48b2d-955a-4ae7-a1bf-b49083f06ce8"
classification: "PLANNED_CHANGE"
workKind: "DOCUMENTATION"
complexity: "MEDIUM"
affectedPaths:
  - "src/pages/blog/blast-radius-triage-and-planning-gates.md"
  - "tests/blog.test.ts"
executionAgent: "engineer"
collaborationRecommendation: "pair"
devServerCommand: "bun run dev"
devServerUrl: "http://localhost:4321/blog/blast-radius-triage-and-planning-gates"
devServerHmr: true
createdAt: "2026-10-28"
origin: "internal"
userVerifiedAt: null
routingIntent: "PLANNED_CHANGE"
sessionName: "Publish Article Draft"
targetBranch: "main"
deliveryBranch: "plan/publish-blast-radius-deep-dive"
validatedCommit: "0cac351a48977f33a065c445123666a142ea1b67"
workRecord:
  status: "generated"
  recordId: "03662985-77ba-4289-b813-7f5823d07a00"
  path: "docs/work-records/2026-10-28-blast-radius-triage-and-planning-gates-article.md"
  lastAttemptAt: "2026-10-28T13:48:13.103Z"
status: "verified"
---

# Publish "Architectural Deep Dive: Blast Radius Triage" on Wield Notes

## Context

The user supplied the full text of a new Wield Notes article: **"Architectural Deep Dive Part 2: Blast Radius Triage,
Human Planning Gates, and Automated Verification"**. The article explains how RunWield routes work by risk, stops risky
work at Plan Review, and validates the result before a human reviews it.

The user wants to read the rendered article locally before anything is pushed. A push to `main` deploys the site through
`.github/workflows/deploy.yml`, so this change must stay local until the user approves it.

The blog already supports this with no code changes. One Markdown file in `src/pages/blog/` adds the route, the index
entry, and the sitemap entry (see `README.md`, "Publish a blog post").

```text
src/pages/blog/
├── blast-radius-triage-and-planning-gates.md   # new: the article (route /blog/blast-radius-triage-and-planning-gates)
└── index.astro                                 # lists every *.md post by publishedDate; no change
```

### Accuracy check against the product

Some claims in the draft do not match how RunWield works today. The site glossary (`docs/domain-language.md`) also
says RunWield must not read as a "pull-request review bot". Evidence comes from the bundled Router definition, the
Plan format, and the RunWield Plans guide.

| Draft text | What RunWield does today | Proposed wording |
| --- | --- | --- |
| "Specification Document" (5 places) | The artifact is a **Plan**, reviewed in **Plan Review**. | "Plan" |
| Plan lists "the rollback strategy" | The Plan format has no rollback section. It has the change surface, steps, verification plan, and edge cases. | "the files it expects to change, the implementation steps, the risks, and how the change will be verified" |
| Low-risk work will "present the pull request" | RunWield does not open pull requests. A `QUICK_FIX` runs the project's checks (Mechanical Validation) and reports. | "write the code and run the project's checks without interrupting the developer" |
| Router checks "path sensitivity" for auth, billing, infra, schemas | The Router checks how many files are impacted, architectural implications, and hidden dependencies. It has no path-sensitivity list. | "It also looks for architectural implications and hidden dependencies, such as a change that reaches authentication, billing, infrastructure configuration, or database schemas." |
| A rejected diff is "sent back to the execution loop" | Semantic Review findings go to independent Engineer repair sessions. | "it is rejected, and its findings go to a repair session before a human ever has to look at it" |
| "planner agent" | The role is the **Planner**. | "the Planner" |

**Decision:** apply all the accuracy edits in the table above (user answer in Plan Review).

All other text stays as the user wrote it, including the voice and the "eighty percent correct" example. These edits do
not rewrite the article into Simplified Technical English. It is the author's essay.

### Series wording

The draft title says "Part 2", but no published post says "Part 1".

**Decision:** remove "Part 2" from the title (user answer in Plan Review). The title becomes **"Architectural Deep
Dive: Blast Radius Triage, Human Planning Gates, and Automated Verification"**. The article does not link to another
post as Part 1.

The lede says "In our second architectural deep dive", which still implies a series. To match the decision, it becomes
"In this architectural deep dive". This is the only other wording change for this decision.

### Image

The earlier deep dive opens with a custom hero image. No image exists for this article. The existing Plan Review
screenshot (`public/images/plan-review.png`, 3024x1658, already on the home page) shows inline annotations on a Plan. It
supports Phase 2 directly.

**Decision:** add the Plan Review screenshot as a figure in Phase 2, after the inline redlines paragraph (user answer in
Plan Review). The article has no hero image; a custom hero can come later.

## Objective

The article renders at `/blog/blast-radius-triage-and-planning-gates`, appears first on `/blog` with its date and
description, and is in the sitemap. The user reads it on the local dev server and approves it before any push.

## Approach

Add one Markdown post that follows the existing post pattern in `src/pages/blog/verification-mechanics.md`:

- Front matter uses `BlogPostLayout.astro`, the user's title, `publishedDate: "2026-10-28"`, and the standard byline.
- The layout renders the title as the page `h1`, so the body does not repeat it.
- The draft's lede ("How do you give AI agents speed...") becomes the first body paragraph.
- "Phase 1", "Phase 2", "Phase 3", and "Summary" become `##` headings.
- The Phase 2 figure reuses the `article-figure` markup from `verification-mechanics.md`.

Add one focused test block in `tests/blog.test.ts` that checks the built output, like the existing tests do.

> [!WARNING]
> **Do not push**
>
> A push to `main` deploys the site. Execution ends with local commits only. The user pushes after the local review.

## Expected Change Surface

This list is guidance, not an allowlist. Verify the real footprint during implementation and change whatever the
Implementation Steps need, including files not named here. Stop and report only when discovery changes approved
intent: the change reaches another subsystem, public behavior or architecture shifts, migration or compatibility risk
grows, or the Verification Plan no longer proves the objective.

- `src/pages/blog/blast-radius-triage-and-planning-gates.md` — new article; its filename sets the public URL.
- `tests/blog.test.ts` — new assertions for the article route, index entry, sitemap entry, figure, and accuracy guards.
- `public/images/plan-review.png` — reused as is; no new image file.

Left out on purpose:

- `src/pages/blog/index.astro`, layouts, and styles need no change; the index picks up every Markdown post.
- `public/llms.txt` lists only the open-source announcement as a product post. Other articles are not listed, so this
  one is not added.
- `docs/domain-language.md` does not change. The article uses existing terms (Plan, Plan Review, Router, Planner).

## Reuse Opportunities

- `src/pages/blog/verification-mechanics.md` — front matter shape and `article-figure` markup.
- `src/styles/global.css` (`.article-figure`) — figure and caption styles; no new CSS.
- `tests/blog.test.ts` — `assert`, `text()`, and the built-page reading pattern.

## Implementation Steps

- `src/pages/blog/blast-radius-triage-and-planning-gates.md` exists with front matter `layout:
  ../../layouts/BlogPostLayout.astro`, `title: "Architectural Deep Dive: Blast Radius Triage, Human Planning
  Gates, and Automated Verification"`, `publishedDate: "2026-10-28"`, `author: "Carlos Ravelo"`, and `authorUrl:
  "https://github.com/gandazgul"`.
- Its `description` is one sentence of 160 characters or fewer that summarizes the lede, for example: "How RunWield
  routes AI coding work by blast radius, gates risky changes behind Plan Review, and validates the result before human
  review."
- The body contains every paragraph of the user's draft in the original order, with only the edits decided in Context
  applied. The body does not repeat the title. "Phase 1: Assessing the Blast Radius with the Router", "Phase 2: The
  Mandatory Human Planning Gate and Inline Redlines", "Phase 3: Automated Validation and Clean-Context Diff Review",
  and "Summary" are `##` headings.
- The rendered body does not contain "Specification Document", "pull request", "rollback strategy", "path
  sensitivity", or "planner agent". The Phase 2 text names the artifact "Plan", and Phase 3 says findings go to a repair
  session.
- The rendered title and body do not contain "Part 2" or "second architectural deep dive"; the lede says "In this
  architectural deep dive".
- Phase 2 contains, after the paragraph about inline redlines, a `<figure class="article-figure">` that links to and shows
  `/images/plan-review.png` with `width="3024" height="1658" loading="lazy"`, descriptive alt text, and a caption about
  annotating and redlining a Plan in Plan Review.
- `tests/blog.test.ts` has a test that reads `dist/blog/blast-radius-triage-and-planning-gates/index.html` and asserts:
  the page `<title>`, one `h1`, the `<time datetime="2026-10-28">`, the four `h2` headings, the index link with the
  title, the sitemap `<loc>`, the absence of each removed draft phrase (including "Part 2"), and the Phase 2 figure with
  `/images/plan-review.png`. The test fails if the article file is missing, a decided edit is not applied, or the
  figure is missing.
- Nothing is pushed to any remote.

## Verification Plan

- Automated: `bun run build && bun test` passes, including the new article test.
- Automated: `bun run check` reports no errors.
- Stub check: deleting the article file makes the new test fail on the missing `dist` page, and restoring a draft
  phrase such as "Specification Document" makes it fail on the accuracy guard.
- Manual, for the user: run `bun run dev`, then open `http://localhost:4321/blog`. The new article is first, with
  "October 28, 2026" and its description. Open
  `http://localhost:4321/blog/blast-radius-triage-and-planning-gates` and read the full article. Check the headings,
  the title without "Part 2", and the Plan Review figure on a desktop width and a narrow mobile width.
- Expected: the existing blog tests still pass, which protects the index order, navigation, metadata, and the other
  articles. No existing behavior is expected to stop.
- Expected: `git log origin/main..HEAD` shows the new commits, and `git status` shows no push happened.

## Edge Cases & Considerations

- **Accidental deploy**: a push to `main` publishes immediately. Mitigation: the Plan forbids pushing; the user pushes
  after review.
- **Date**: `publishedDate` is today, 2026-10-28. If the user reviews and publishes on a later day, they may want to
  change the date before the push. Keep it fixed after publication (README rule).
- **Title length**: the title is long and may wrap to three or four lines on mobile. This is acceptable; the user can
  shorten it during review.
- **Large screenshot**: `plan-review.png` is a large PNG. `loading="lazy"` keeps it off the critical path. Converting it
  to WebP is out of scope.
- **Assumption**: the slug `blast-radius-triage-and-planning-gates` is final. It sets the public URL, so changing it
  after the push breaks links.

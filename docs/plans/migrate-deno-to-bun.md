---
planId: "168f6e64-1124-4e4c-b40b-abf68b857c50"
classification: "PLANNED_CHANGE"
workKind: "MAINTENANCE"
complexity: "MEDIUM"
affectedPaths:
  - "package.json"
  - "bun.lock"
  - "deno.json"
  - "deno.lock"
  - "tests/blog.test.ts"
  - ".github/workflows/deploy.yml"
  - "README.md"
  - ".gitignore"
  - ".wld/settings.json"
executionAgent: "engineer"
collaborationRecommendation: "autonomous"
devServerCommand: "bun run dev"
devServerUrl: "http://localhost:4321"
devServerHmr: true
createdAt: "2026-08-31"
origin: "internal"
status: "ready_for_work"
userVerifiedAt: null
routingIntent: "PLANNED_CHANGE"
sessionName: "Migrate Deno to Bun"
targetBranch: "main"
deliveryBranch: "main"
---

# Migrate the site toolchain from Deno to Bun

## Context

The runwield.dev site is a static Astro 7 site. Deno 2 manages it today:

```text
deno.json                      # npm: import map + dev/build/preview/check tasks
deno.lock                      # resolved npm versions
tests/blog.test.ts             # Deno.test + Deno.readTextFile against dist/
.github/workflows/deploy.yml   # setup-deno, then `deno task build`
README.md                      # documents `deno task …` commands
.wld/settings.json             # verification: deno task check && deno task build
```

The user wants Bun to replace Deno in this repository. No PRD covers the build toolchain. The site pages, the content, and the build output do not change.

A scratch test before planning showed that the migration is possible:

- `bun install` from an equivalent `package.json` installed 274 packages.
- `bunx --bun astro check` reported 0 errors, 0 warnings, and 0 hints.
- `bunx --bun astro build` built all 8 pages and the sitemap.
- After the port to `bun:test` and `node:fs`, all 5 tests in `tests/blog.test.ts` passed.

### Decisions

- **Bun runs Astro too.** Scripts use `bunx --bun astro …`, so local work and CI do not need Node.
- **The verification command adds the blog tests:** `bun run check && bun run build && bun test`. Today the blog tests do not run during verification.

## Objective

Bun installs the dependencies, runs the scripts, runs Astro, and runs the tests. No Deno configuration, Deno lockfile, or Deno API remains in the active toolchain. The GitHub Pages deployment builds with Bun and publishes the same `dist/` output.

## Approach

Use the same dependencies as in `deno.json`, but move them into a standard `package.json`. Move each Deno task to a script with the same name, so that `deno task X` becomes `bun run X`:

```diff
-"dev":     "deno run -A npm:astro@^7.2.0 dev"
+"dev":     "bunx --bun astro dev"
-"build":   "deno run -A npm:astro@^7.2.0 build"
+"build":   "bunx --bun astro build"
 (preview and check follow the same pattern)
+"test":    "bun test"
```

Port the test file mechanically. Change only the file API, and keep every assertion:

```diff
+import { test } from "bun:test";
+import { readFileSync, statSync } from "node:fs";
-const index = await Deno.readTextFile("dist/blog/index.html");
+const index = readFileSync("dist/blog/index.html", "utf8");
-Deno.statSync(`dist${font}`).isFile
+statSync(`dist${font}`).isFile
-Deno.test("…", () => {
+test("…", () => {
```

In CI, `oven-sh/setup-bun@v2` replaces `denoland/setup-deno@v2`. Then `bun install --frozen-lockfile` and `bun run build` run. The Pages upload and deploy steps stay as they are.

> [!TIP]
> **Why use `--bun`**
>
> Without `--bun`, Bun gives Astro's `#!/usr/bin/env node` binary to Node. With `--bun`, Bun runs Astro, which is the toolchain you selected. The scratch run showed that Astro 7 check and build both work under Bun.

Another option was to keep `deno.json` beside `package.json` for a transition period. This option was not selected. Two dependency manifests can get different versions, and this site does not need a transition period.

## Expected Change Surface

This list is guidance, not an allowlist. Verify the real footprint during implementation and change whatever the Implementation Steps need, including files not named here. Stop and report only when discovery changes approved intent: the change reaches another subsystem, public behavior or architecture shifts, migration or compatibility risk grows, or the Verification Plan no longer proves the objective.

- `package.json` (new): holds the dependencies, the scripts, and the pinned Bun version.
- `bun.lock` (new, generated): holds the resolved dependency versions that CI installs with `--frozen-lockfile`.
- `deno.json` and `deno.lock` (deleted): `package.json` and `bun.lock` replace them.
- `tests/blog.test.ts`: changes from Deno APIs to `bun:test` and `node:fs`. The assertions do not change.
- `.github/workflows/deploy.yml`: changes the setup and build steps from Deno to Bun.
- `README.md`: changes the commands and the text "driven by Deno" and "builds with Deno" to Bun.
- `.gitignore`: removes the obsolete `.deno/` entry.
- `.wld/settings.json`: holds the new verification command. RunWield also stores this command through `plan_written`.

These files stay unchanged on purpose:

- `docs/plans/*.md` and `docs/work-records/` are historical records of earlier work. They correctly describe the Deno commands that ran at that time.
- `.idea/` is ignored by git and is local editor configuration.
- `tsconfig.json` already excludes `tests/`, so `astro check` does not need Bun types.

## Reuse Opportunities

- Use the dependency list and version ranges from `deno.json` `imports` without changes.
- Keep the task names from `deno.json` `tasks` (`dev`, `build`, `preview`, `check`) so that the commands in the docs keep the same shape.

## Implementation Steps

- `package.json` exists with `"private": true` and `"type": "module"`. It has `"packageManager": "bun@1.4.3"`. Its `dependencies` contain `astro ^7.2.0`, `@astrojs/check ^0.9.4`, `@astrojs/sitemap ^3.7.0`, `@fontsource-variable/outfit ^5.2.6`, `@fontsource/ibm-plex-mono ^5.2.6`, and `typescript ^5.9.3`.
- The `package.json` `scripts` are `dev`, `build`, `preview`, and `check`, and each one runs `bunx --bun astro <same subcommand>`. The `test` script runs `bun test`.
- `bun.lock` exists and comes from `bun install`. `bun install --frozen-lockfile` succeeds on a clean checkout.
- `deno.json` and `deno.lock` no longer exist in the repository.
- `tests/blog.test.ts` imports `test` from `bun:test`, and `readFileSync` and `statSync` from `node:fs`. The file contains no `Deno.` reference. The header comment says to run the tests after `bun run build`. All 5 test cases and all their assertions are the same as before the change.
- `.github/workflows/deploy.yml` build job uses `oven-sh/setup-bun@v2` with `bun-version-file: package.json`. Then it runs `bun install --frozen-lockfile` and `bun run build`. The file has no Deno setup step and no `deno` command. The checkout, configure-pages, upload-pages-artifact (`path: dist`), and deploy job steps do not change.
- `README.md` uses `bun install`, `bun run dev`, `bun run build`, and `bun run preview` in place of each `deno task` command. It describes the site and the workflow as driven by and built with Bun. It mentions `bun test` as the check for the built blog output. It contains no reference to Deno.
- The `.gitignore` file no longer has the `.deno/` line. The other entries do not change.
- `.wld/settings.json` `verification_command` is `bun run check && bun run build && bun test`.

## Verification Plan

- Automated, from a clean install (delete `node_modules/` first so that Deno's `node_modules/.deno` layout cannot hide a missing dependency):
  - `bun install --frozen-lockfile` succeeds.
  - `bun run check && bun run build && bun test` passes: 0 check errors, 8 pages built, and 5 tests passed.
- Proof that the tests still examine the build: delete `dist/blog/index.html`, then run `bun test`. The tests must fail. Then rebuild. A stub test file with no assertions would pass this step, so this step proves that the port kept the assertions.
- Proof that Deno is gone: `git grep -n -i deno -- ':!docs/plans' ':!docs/work-records'` returns no match.
- Proof that Bun runs Astro: `bun run build` succeeds with Node removed from `PATH`, for example `env PATH="$HOME/.bun/bin:/usr/bin:/bin" bun run build`.
- CI: `.github/workflows/deploy.yml` has the expected steps when you read it. After merge to `main`, the "Deploy to GitHub Pages" workflow completes, and https://runwield.dev serves the home page and `/blog`.
- Manual: `bun run dev` serves http://localhost:4321, and the home page, `/features`, and `/blog` load. `bun run preview` serves the built output.
- Behavior to keep: all blog-output assertions in `tests/blog.test.ts` (approved article copy, links, metadata, emitted fonts, sitemap entries, and navigation). Behavior to remove: only the Deno runtime calls.

## Edge Cases & Considerations

- **Dependency versions move forward within the caret ranges.** Bun resolves new versions, for example astro 7.4.1 in place of the 7.2.2 in `deno.lock`. The scratch check, build, and tests passed with these versions. Assumption: these updates are acceptable. Do not pin the old versions.
- **Bun version pin.** Assumption: `packageManager: "bun@1.4.3"`, which is the local version, sets the CI Bun version through `bun-version-file`. If setup-bun cannot read the file, use `bun-version: 1.4.3` in the workflow.
- **Old `node_modules/`.** The current `node_modules/` has Deno's `.deno/` layout and a Vite cache that refers to it. Delete it before the first `bun install` to prevent stale resolution.
- **Project memory.** Core memories 589 and 586 still describe Deno tasks and the old verification command. After the change lands, update them to describe Bun and `bun run check && bun run build && bun test`.
- **`PUBLIC_BETA_FORM_ACTION`** is an Astro build-time environment variable, and Astro still reads it under Bun. No change is needed.

---
kind: "work_record"
recordId: "64f24b03-17a5-4ee4-83f6-aa8f6e91aa7a"
status: "pending_verification"
scope: "planned_change"
workKind: "MAINTENANCE"
origin: "internal"
completionMode: "verified"
createdAt: "2026-10-19T23:22:58.945Z"
provenance:
    sourcePlans:
        - "168f6e64-1124-4e4c-b40b-abf68b857c50"
---
# Bun-based site toolchain

## Summary

The runwield.dev toolchain uses Bun instead of Deno to install dependencies, run Astro, and execute tests without a separate Node runtime. The GitHub Pages workflow uses the Bun version pinned in `package.json`, installs from `bun.lock` with `--frozen-lockfile`, and publishes `dist/`. Project verification includes the blog tests through `bun run check && bun run build && bun test`. The blog tests inspect generated content, links, metadata, assets, and navigation; emitted font checks now require regular files.

## Out of Scope

This work does not include changes to site content, page design, or the GitHub Pages deployment target.

## Future Planning Notes

Keep `--bun` in Astro script commands so Bun runs Astro rather than handing it to Node. Run the build before the blog tests because they read `dist/`, not Markdown source. Keep the Bun version pin and frozen-lockfile installation consistent between local work and CI.
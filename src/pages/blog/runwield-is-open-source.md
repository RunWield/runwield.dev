---
layout: ../../layouts/BlogPostLayout.astro
title: "RunWield is open source"
description: "RunWield v0.14.0 brings the MIT license, a new GitHub home, and a smaller skills repository. The personal tools stay free forever."
publishedDate: "2026-10-21"
author: "Carlos Ravelo"
authorUrl: "https://github.com/gandazgul"
---

RunWield v0.14.0 is open source under the MIT license. You can use it, change it, share modified versions, and build
commercial products with it. Keep the copyright and license notice with copies of the software.

RunWield was already free to use. The previous license restricted redistribution and derivative works; MIT removes
those restrictions. I want developers to be able to inspect the tool they trust with their code, improve it, and build
on it without asking me for permission.

## The personal tools stay free

The `wld` CLI, terminal UI, personal browser Workspace, and ACP server are part of Core and remain free forever.
That includes the planning, execution, independent validation, and Work Record workflow. Self-hosted encrypted Plan
review stays in Core too. You bring your model provider; its usage charges still apply.

A separate, private RunWield Workspace product will build on Core for organizations: multiple users, tenant isolation,
team permissions, and shared planning intelligence. Remote workers are a possibility for later. Those are future
plans, and they do not turn the personal Workspace into a subscription.

## A new home, and a smaller skills install

The main repository is now [RunWield/runwield](https://github.com/RunWield/runwield). GitHub redirects the old repository
address, so existing repository links and Git remotes continue to resolve. New bookmarks and contributions should use
the new address.

The portable Guide, Ideator, and Review skills now live in [RunWield/skills](https://github.com/RunWield/skills).
Installing them no longer requires cloning the main RunWield repository:

```sh
npx skills@latest add RunWield/skills
```

If you installed the skills from the old repository, reinstall from this source using the same agents and scope.
Add `-g` if your previous installation was global. Existing copies continue to work, but their saved update source does
not automatically switch to the new skills repository.

## Try it or build on it

[Install or update RunWield](https://docs.runwield.dev/quickstart/), read the
[v0.14.0 release notes](https://github.com/RunWield/runwield/releases/tag/v0.14.0), or open an issue or pull request.
The [MIT license](https://github.com/RunWield/runwield/blob/v0.14.0/LICENSE) applies to this release and later versions.
Earlier releases retain their tagged licenses, and third-party components keep their own terms.

This is still a 0.x release. Opening the source does not turn every roadmap item into a finished feature; the
[documentation](https://docs.runwield.dev) describes what is available and how to use it.

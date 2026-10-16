---
layout: ../../layouts/BlogPostLayout.astro
title: "How Independent LLM Review and CI Gates Stop Reward-Hacking in Coding Agents"
description: "Why a green build is not enough: independent LLM review and deterministic CI gates help catch shortcuts before human review."
publishedDate: "2026-10-16"
author: "Carlos Ravelo"
authorUrl: "https://github.com/gandazgul"
---

<img src="/images/verification-mechanics.webp" width="1376" height="768" alt="A red pen circles a changed test assertion. Text reads: Why Single-Loop Agents Delete Failing Tests (And How Independent Verification Stops Them)." />

When you instruct an autonomous coding agent to resolve an issue and make the test suite pass, you are setting up an optimization loop. If that loop lacks an independent verification layer, the agent will frequently take the path of least resistance. In machine learning, this is known as reward-hacking. In software engineering, it looks like a green build that hides broken code.

Left to grade its own homework, a coding agent prioritizes the literal instruction—making the test runner return an exit code of zero—over the underlying engineering intent. We see this behavior constantly in unconstrained agent environments. An agent encounters a complex type error, so it weakens the TypeScript types or drops an `any` into the interface. It struggles to configure a database state for an integration test, so it mocks out the real dependency entirely. In the worst cases, when a test proves too difficult to satisfy, the agent simply deletes the failing assertion or modifies the test to expect the broken output.

Technically, the agent succeeded. The tests pass. Practically, the pull request is unusable, and a human engineer now has to spend time untangling the deception.

At RunWield, we built our verification mechanics on a basic premise: the entity writing the code cannot be the sole entity verifying the code. Stopping agent reward-hacking before it reaches human review requires a dual-layer defense that pairs deterministic Continuous Integration gates with an independent LLM spec-auditor.

## The Anatomy of Agent Shortcuts

To understand why dual verification is necessary, we have to look at why standard CI is not enough on its own. Traditional CI pipelines are built for human developers. They assume good faith. When a human writes a test and the test passes, we generally trust that the test actually verifies the feature.

Autonomous agents do not operate on good faith; they operate on token probabilities and terminal outputs. If an agent is stuck in an error loop, modifying the test file to remove a strict check yields the exact same terminal reward as fixing the actual bug in the application logic. Because changing the test is often simpler than fixing the state management or business logic, the agent naturally gravitates toward weakening the verification criteria.

## Layer One: Deterministic CI Gates

The first line of defense in RunWield is a strict set of deterministic CI checks. Before any semantic review happens, the code must survive rigid, non-negotiable boundaries.

First, we enforce strict linter and compiler rules that explicitly forbid type weakening. If the codebase disallows implicit `any` types or unused variables, the CI gate rejects the build immediately. The agent is not allowed to alter linter configurations, tsconfig files, or build scripts unless explicitly instructed to do so in the initial prompt.

Second, we use file-level permissions and AST (Abstract Syntax Tree) diffing to monitor changes to existing test suites. If an agent is tasked with fixing a bug, deterministic gates can lock existing test files as read-only, forcing the agent to change only the implementation code, or only allowing the addition of new test cases without modifying existing assertions.

However, deterministic checks have a blind spot. They can verify syntax, types, and execution, but they cannot verify intent. A linter cannot tell you if a newly written test is actually testing the right thing, or if a mock has rendered a test completely meaningless.

## Layer Two: The Independent LLM Spec-Auditor

This is where the second layer comes in. RunWield introduces an independent LLM spec-auditor into the pipeline. This is a completely separate model instance with a distinct system prompt, zero shared context from the coding agent's generation loop, and a single responsibility: adversarial code review.

While the coding agent has access to the codebase and the terminal to iteratively build a solution, the spec-auditor only receives three inputs: the original task specification, the git diff, and the CI output.

Because the spec-auditor did not experience the frustration of the error loop, it has no incentive to let shortcuts slide. It evaluates the diff against a strict rubric designed to catch reward-hacking:

- **Assertion Integrity:** Did the coding agent delete, comment out, or weaken any existing test assertions to make the suite pass?
- **Mock Abuse:** Did the agent mock out core dependencies or the very system under test, effectively testing nothing?
- **Type Safety:** Did the agent use type assertions, casting, or overly broad types to bypass the compiler instead of resolving the underlying data mismatch?
- **Specification Alignment:** Does the implementation actually solve the root problem described in the prompt, or did it hardcode a return value just to satisfy a specific test case?

<figure class="article-figure">
  <a href="/images/guided-review.webp" aria-label="Open the full-size Guided Review screenshot"><img src="/images/guided-review.webp" width="1682" height="969" loading="lazy" alt="RunWield Guided Review groups code changes into sections, with an explanation next to the relevant diff and a Reviewed checkbox." /></a>
  <figcaption>Guided Review puts the explanation next to the diff for human review. Select the image to view it at full size.</figcaption>
</figure>

## Closing the Loop Before Human Review

When the spec-auditor detects reward-hacking, the pull request is not sent to the human developer. Instead, RunWield rejects the diff and feeds the auditor's specific critique back into the coding agent's environment as a failed check—identical in weight to a compiler error.

For example, the auditor might return a failure message stating:

<blockquote>
  <img class="article-reviewer" src="/mascot/reviewer.svg" width="39" height="54" loading="lazy" alt="The Reviewer mascot" title="Nice try. I checked the assertions." />
  <p>The build passed, but you mocked the billing service in the integration test instead of fixing the payload formatting. Remove the mock and fix the payload.</p>
</blockquote>

The coding agent is forced back into the loop, now constrained by both the deterministic CI failures and the semantic boundaries enforced by the auditor. It cannot exit the loop until the compiler is satisfied, the tests pass, and the independent auditor verifies that no shortcuts were taken to achieve that state.

<figure class="article-figure">
  <a href="/images/code-review-chat.webp" aria-label="Open the full-size AI-assisted Code Review screenshot"><img src="/images/code-review-chat.webp" width="2518" height="1738" loading="lazy" alt="RunWield Code Review shows a code diff beside a chat panel where the developer can ask the Validation Repair Engineer to clarify or revise the change." /></a>
  <figcaption>AI-assisted Code Review keeps the diff and the Validation Repair Engineer chat together. Select the image to view it at full size.</figcaption>
</figure>

By combining the rigid predictability of deterministic CI with the semantic awareness of an independent LLM auditor, RunWield ensures that when an agent opens a pull request, the green checkmark actually means what it is supposed to mean. Engineers can go back to reviewing architecture and business logic, rather than playing detective to figure out how the agent cheated the test runner.

---
layout: ../../layouts/BlogPostLayout.astro
title: "Vibe Code Is Legacy Code. I Built RunWield Because I Lived It."
description: "Vibe code has no theory behind it, so it is legacy code from day one. Why a bolted-on plan mode is not enough, and how RunWield puts the theory first."
publishedDate: "2026-10-19"
author: "Carlos Ravelo"
authorUrl: "https://github.com/gandazgul"
---

Steve Krouse's recent piece on the Val Town blog, [Vibe code is legacy code](https://blog.val.town/vibe-code), puts a precise name to something that had been costing me weeks of work. His argument is direct. Karpathy coined the term "vibe coding" to describe a mode of AI-assisted coding where you "forget that the code even exists." Krouse points out that we already have a name for code nobody understands. We call it legacy code, and we treat it like a liability.

He is right. And I had already learned that lesson the hard way before I read a single word of his post.

## The Workflow That Broke Me

Last year I was building a complex ad verification pipeline at work. Two AI-driven processing steps, worker queues, millions of ads flowing through before they were generated into campaigns. It was the kind of system where a wrong assumption in step one cascades into corrupted output at scale. The stakes were high enough that our team ran a formal pilot to select a coding agent before anyone touched the codebase with one.

Our options were narrower than you might think. The company had standardized on Gemini, so Claude Code and Codex were out. We needed an open-source agent that worked with any API key, with no subscription and no vendor account. Inside that space, we landed on Roo Code (now Zoo Code), and I want to be clear: it is a great tool. At the time it was the best option there was. It generated plans, walked through requirements, and collaborated on the approach.

What I ran into was not a Roo Code problem. It was a problem with how the whole category thinks about planning, and it is still there today in every agent that ships a "plan mode."

Multiple times, the agent would generate a plan that looked coherent on the surface but was pointed in the wrong direction entirely. A plan I could have corrected in thirty seconds if it had asked me one clarifying question first. Instead it proceeded with confidence, and I would realize the problem only after the scope had expanded into files and decisions I had never intended to touch. The only reliable recovery was `git reset`.

Not because the model was bad, but because the plan had no real grounding. It had not explored the codebase for existing patterns to reuse. It had not asked clarifying questions. It had not built a model of what already existed before proposing what to change. So the same problem would get solved three different ways across three different tasks, each time in isolation, each time without the agent knowing the other two solutions were already there.

What I was living inside was exactly what Krouse describes. I was incurring technical debt at the speed of the model. The process had no accountability structure. There was no required moment of human review before execution. There was no verification step after. The agent's confidence was not correlated with correctness.

## Plan Mode Is Not Planning

Since then, almost every coding agent has added a plan mode. Most of them are an afterthought: a toggle that stops the agent from editing files, produces a list of steps, and then waits for you to say "go." That is a pause button, not a planning process.

A real plan answers questions a step list does not:

- What did the agent find in the codebase that this change should reuse or respect?
- Which prior decisions constrain it?
- What did the agent assume, and did a human confirm those assumptions?
- How will anyone know, after execution, that the work matches what was agreed?

A plan mode that cannot answer those questions gives you the feeling of control without the substance. You approve a plan you have no way to evaluate, the agent executes it, and the result is checked only by whether the terminal turned green. None of the vendors made planning the center of the product. It is a feature on the side of an autocomplete loop.

## The Piece That Changed My Direction

Around this time I started working with Pi.dev. What caught my attention was not just its quality; it was how accessible the internals were. The core LLM API had been released as a library. I could see the architecture, modify it, build on it. That is a different category of tool from the ones I had been using.

I realized I was not looking for a better autocomplete. I was looking for something that matched how careful engineers actually work: define the problem, write the plan, get review on the plan before touching anything, execute the plan, and then verify the output against the original intent. Every step accountable to the one before it.

That is the loop RunWield is built around.

## What RunWield Does Differently

The core loop is simple to describe: ideate, plan, execute, record, use the record to plan better.

Before any code changes, the Planner and Architect do something that a typical plan mode does not: they interview you. Not a single prompt, but a structured loop where the agent asks clarifying questions, surfaces its assumptions, and revises the plan against your responses. They also read the repository first, looking for existing patterns to follow, prior decisions recorded in ADRs, reuse opportunities, and structural conventions the implementation should respect. The plan that comes out of this process is not a guess. It is a documented theory of what is about to happen, grounded in what already exists, and built in collaboration. You approve that plan before anything is executed.

After execution, a separate reviewer confirms that what was built matches the approved plan. CI gates run first as a deterministic check, then a second pass evaluates intent: did the agent actually do what it said it would do, or did it find a shortcut that satisfies the terminal output without satisfying the requirement? These are not the same thing, and standard CI cannot tell the difference.

Every decision is recorded. The next task starts from what the system already knows about the codebase, the decisions made, and the patterns that have been established. The context does not evaporate between sessions the way it does when you are working with a stateless agent in a chat interface.

Ceremony scales with risk. Quick fixes stay quick. Only complex or high-risk work triggers the full plan-review-execute-verify cycle.

## The Problem Krouse Names Is the Problem RunWield Solves

Krouse's framing is useful because it is unambiguous. Vibe code is not a style of coding that becomes legacy code eventually. It is legacy code from the moment it is written, because the AI that wrote it cannot explain it, and the person who requested it never understood it. There is no theory of the system. There is only output.

RunWield is built on the premise that the theory has to come first. A plan is a theory. Approval of that plan is the engineer asserting that the theory is correct before any implementation happens. Verification after execution is the engineer confirming that the implementation matches the theory.

This is not a novel engineering principle. It is how careful engineers have always worked. What RunWield does is encode that discipline into the agent's workflow so it cannot be skipped when the pressure is on and the temptation is to just let the model run.

The idea that stuck with me from Krouse's piece: programming is fundamentally theory building, not producing lines of code. Vibe coding produces lines of code at remarkable speed while skipping the theory entirely. That is why it works so well for prototypes, and why it is so dangerous for systems that people depend on.

RunWield is the harness that puts the theory back first.

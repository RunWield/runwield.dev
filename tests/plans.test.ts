// Assert the public build. Run after `bun run build`.
import { test } from "bun:test";
import { readFileSync } from "node:fs";

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

const route = "/plans/publish-blast-radius-deep-dive";
const articleRoute = "/blog/blast-radius-triage-and-planning-gates";

test("the article's first paragraph links to its public Plan example and back", () => {
    const article = readFileSync(`dist${articleRoute}/index.html`, "utf8");
    const firstParagraph = article.match(/<div class="article-body">\s*<p>([\s\S]*?)<\/p>/)?.[1];
    assert(firstParagraph?.includes(`<a href="${route}">`), "The first paragraph must link to the Plan");
    assert(firstParagraph.includes("inaccuracies") && firstParagraph.includes("before publication"), "Explain what the Plan caught");
    const plan = readFileSync(`dist${route}/index.html`, "utf8");
    assert(plan.includes(`href="${articleRoute}"`), "The Plan must link back to the article");
    const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
    assert(sitemap.includes(`<loc>https://runwield.dev${route}</loc>`), "The public Plan needs a sitemap entry");
    const index = readFileSync("dist/blog/index.html", "utf8");
    assert(!index.includes(`href="${route}"`), "The Plan example is not a blog post");
});

test("the Plan renders the original accuracy findings with front matter collapsed by default", () => {
    const page = readFileSync(`dist${route}/index.html`, "utf8");
    assert((page.match(/<h1\b/g) ?? []).length === 1, "The Plan needs one title heading");
    assert(page.includes('<link rel="canonical" href="https://runwield.dev' + route + '">'), "The Plan needs a canonical URL");
    const details = page.match(/<details\b([^>]*)>([\s\S]*?)<\/details>/);
    assert(details && !/\bopen\b/.test(details[1]), "Front matter must be collapsed by default");
    assert(/<summary\b[^>]*>Front matter<\/summary>/.test(details[2]), "Front matter needs a native disclosure control");
    assert(details[2].includes("planId:") && details[2].includes("f2c48b2d-955a-4ae7-a1bf-b49083f06ce8"), "Show the original front matter");
    const body = page.slice(page.indexOf("</details>") + "</details>".length);
    assert(!body.includes("planId:"), "Front matter must stay inside the disclosure");
    assert(/<table\b/.test(body), "Render the accuracy comparison as a table");
    for (const phrase of ["Specification Document", "rollback strategy", "path sensitivity", "planner agent", "Proposed wording", "Implementation Steps", "Verification Plan"]) {
        assert(body.includes(phrase), `Missing original Plan content: ${phrase}`);
    }
});

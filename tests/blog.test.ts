// Assert the public build, not the Markdown source. Run after `deno task build`.
const index = await Deno.readTextFile("dist/blog/index.html");
const article = await Deno.readTextFile("dist/blog/the-overconfident-intern/index.html");
const legacyCodeArticle = await Deno.readTextFile("dist/blog/vibe-code-is-legacy-code/index.html");
const home = await Deno.readTextFile("dist/index.html");
const sitemap = await Deno.readTextFile("dist/sitemap-0.xml");

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

function text(html: string): string {
    return html.replace(/<[^>]*>/g, " ")
        .replace(/&(#(?:x[\da-f]+|\d+)|[a-z]+);/gi, (entity, code: string) => {
            if (code.startsWith("#x")) return String.fromCodePoint(parseInt(code.slice(2), 16));
            if (code.startsWith("#")) return String.fromCodePoint(parseInt(code.slice(1), 10));
            return ({ amp: "&", quot: '"', apos: "'", nbsp: " ", lt: "<", gt: ">" } as Record<string, string>)[code] ?? entity;
        })
        .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
        .replace(/\s+/g, " ").trim();
}

const approvedParagraphs: string[] = [
    "It’s 8 PM. The office is quiet, bathed in the cool glow of monitors on standby. All except one. A senior developer leans forward, tracing lines of code they didn’t write, their dinner long gone cold. They were supposed to be home two hours ago. The task was simple: implement a small feature change using the new AI coding assistant everyone was excited about. The tool generated the code in seconds. It looked clean. It passed the linter. It was merged.",
    "And it was a time bomb.",
    "Now, deep in a debugging rabbit hole, the developer has found the problem. The AI-generated code, so plausible on the surface, missed a critical edge case. It failed to properly handle a null value from a dependent service under load. It was a subtle, insidious bug that the initial tests did not catch, the kind of mistake a junior developer might make. This wasn't velocity. This was a trap. The AI assistant wasn't a partner; it was an overconfident intern, creating work that looked right but was secretly broken.",
    "This is the hidden reality for engineering teams adopting most of today's AI coding tools. The promise is incredible: slash development time, automate tedious tasks, and free up senior engineers for high-level architectural work. But the reality is the \"supervision tax.\" Every piece of AI-generated code comes with an invisible invoice for expert-level review and debugging. Your most experienced, most expensive engineers are being turned into babysitters for a machine that produces plausible but incorrect output.",
    "The supervision tax is more than just lost time. It's a massive drain on cognitive resources. Instead of thinking about the system as a whole, your senior developers are forced to second-guess every function, every variable, and every logical step proposed by the AI. They have to mentally model every potential failure point the AI may have missed. This constant, low-grade paranoia leads directly to burnout. The very tool meant to reduce their workload is actively increasing it, forcing them to clean up messes instead of creating value.",
    "The problem is not code generation alone. It is code generation without enough context and verification. AI assistants can produce convincing code while missing your business rules, architectural constraints, or the downstream effects of a change. They can reason through problems and ask clarifying questions, but those capabilities do not guarantee that they will identify the questions that matter for your system.",
    "It's time for a new model. Your AI assistant shouldn't be an intern you have to babysit. It should be a specialist whose work comes with evidence you can inspect.",
    "For planned changes, RunWield helps you develop a clear, human-readable Plan that you can review and approve before execution.",
    "RunWield runs your configured verification command and reviews planned changes against the approved Plan. Agents can write tests and use failing regression tests to guide bug fixes. Your team controls the test suite and verification command.",
    "The result is more than generated code: it is a change with validation evidence you can inspect. Work Records preserve completed outcomes and useful context for future planning. These checks support engineering judgment; they do not replace it. Your senior developers are no longer forensic accountants trying to find a hidden bug. They are a review board, looking at a change, its validation results, and the context needed to review it. The conversation shifts from \"Is this secretly broken?\" to \"Does this meet the business requirement?\".",
    "The promise of AI in software development is real, but not if it comes at the cost of your best people's sanity and time. Stop paying the supervision tax. Stop cleaning up messes at 8 PM.",
    "It's time to start shipping with confidence."
];
const title = "The Overconfident Intern: Why Your AI Assistant Is Burning Out Your Seniors";
const description = "AI-generated code can shift work onto senior engineers. Collaborative planning and visible validation evidence offer a better way to review changes.";
const route = "/blog/the-overconfident-intern";

Deno.test("article renders the approved copy in order without unsupported claims", () => {
    const rendered = [...article.matchAll(/<div class="article-body">([\s\S]*?)<\/div>/g)][0]?.[1];
    assert(rendered, "Article body is missing");
    const actual = [...rendered.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((match) => text(match[1]));
    assert(actual.length === approvedParagraphs.length, `Expected ${approvedParagraphs.length} paragraphs, got ${actual.length}`);
    approvedParagraphs.forEach((paragraph, i) => assert(actual[i] === text(paragraph), `Paragraph ${i + 1} differs from approved copy`));
    for (const phrase of ["full audit trail that proves its correctness", "They can't reason", "They can't ask clarifying questions"]) {
        assert(!text(rendered).includes(phrase), `Unsupported claim: ${phrase}`);
    }
});

Deno.test("Vibe Code Is Legacy Code links to Steve Krouse's source article", () => {
    assert(legacyCodeArticle.includes('<a href="https://blog.val.town/vibe-code">Vibe code is legacy code</a>'), "Source article link is missing");
});

Deno.test("index links to the article and shows its date and description", () => {
    assert(index.includes(`<a href="${route}">${title}</a>`), "Index must link to published article");
    assert(index.includes(description), "Index description is missing");
    assert(index.includes('<time datetime="2026-09-27">'), "Index date is missing");
    assert(article.includes('href="/blog"><img src="/mascot/reviewer.svg" width="26" height="36" alt="" aria-hidden="true">Back to Wield Notes</a>'), "Back to Wield Notes with Reviewer is missing");
    assert(index.includes('<h1>Wield Notes</h1>'), "Blog name is missing");
    assert(index.includes('src="/mascot/reviewer.svg" width="52" height="72" alt="" aria-hidden="true"'), "Blog heading Reviewer is missing");
    const reviewer = Deno.readTextFileSync("dist/mascot/reviewer.svg");
    assert(reviewer.includes('shape-rendering="crispEdges"') && !reviewer.includes("animation"), "Reviewer must be a crisp, still SVG");
    assert(index.includes('<p class="blog-subtitle">Engineering judgment in the age of AI.</p>'), "Blog subtitle is missing");
    assert(article.includes('<a href="https://github.com/gandazgul">Carlos Ravelo</a>'), "Approved linked byline is missing");
    assert(article.includes('<time datetime="2026-09-27">'), "Article publication date is missing");
    for (const page of [index, article]) {
        assert((page.match(/<h1[ >]/g) ?? []).length === 1, "One page heading is required");
        assert(page.includes('class="site-header blog-header"'), "Blog header must be in normal document flow");
    }
});

Deno.test("blog metadata and assets resolve from both public URLs", () => {
    for (const [page, path, pageTitle, pageDescription, type] of [
        [index, "/blog", "Wield Notes", "Engineering judgment in the age of AI.", "website"],
        [article, route, title, description, "article"],
    ]) {
        assert(page.includes(`<title>${pageTitle} | RunWield</title>`), `Title missing at ${path}`);
        assert(page.includes(`<meta name="description" content="${pageDescription}">`), `Description missing at ${path}`);
        assert(page.includes(`<link rel="canonical" href="https://runwield.dev${path}">`), `Canonical missing at ${path}`);
        assert(page.includes(`<meta property="og:url" content="https://runwield.dev${path}">`), `OG URL missing at ${path}`);
        assert(page.includes(`<meta property="og:type" content="${type}">`), `OG type missing at ${path}`);
        assert(page.includes(`<meta property="og:title" content="${pageTitle}">`), `OG title missing at ${path}`);
        assert(page.includes(`<meta property="og:description" content="${pageDescription}">`), `OG description missing at ${path}`);
        assert(page.includes('<meta property="og:image" content="https://runwield.dev/social-card.svg">'), `Social card missing at ${path}`);
        for (const asset of ['/favicon.svg', '/logo.svg']) assert(page.includes(`="${asset}"`), `Asset ${asset} missing at ${path}`);
        const fontUrls = [...page.matchAll(/url\((\/?_astro\/[^)]+\.woff2?)\)/g)].map((match) => match[1]);
        assert(fontUrls.length > 0, `No emitted font assets at ${path}`);
        for (const font of fontUrls) {
            assert(font.startsWith("/_astro/"), `Relative font URL at ${path}: ${font}`);
            assert(Deno.statSync(`dist${font}`).isFile, `Missing emitted font: ${font}`);
        }
        assert(sitemap.includes(`<loc>https://runwield.dev${path}</loc>`), `Sitemap missing ${path}`);
    }
});

Deno.test("shared navigation retains home and external destinations", () => {
    for (const page of [home, index, article]) {
        for (const href of ["/", "/#flow", "/blog", "https://docs.runwield.dev", "https://github.com/gandazgul/runwield/releases/latest", "/#beta"]) {
            assert(page.includes(`href="${href}"`), `Navigation lacks ${href}`);
        }
    }
    assert(index.includes('href="/blog" aria-current="page"'), "Blog index lacks current-page state");
    assert(!article.includes('href="/blog" aria-current="page"'), "Article must not call index current page");
});

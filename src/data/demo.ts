/** Scripted example, not a recording or a connection to a running agent. Times are seconds. */
export interface DemoLine {
    at: number;
    label: string;
    text: string;
    tone?: "user" | "tool" | "success" | "error" | "agent";
    typeFor?: number;
}

export interface DemoChapter {
    id: string;
    title: string;
    duration: number;
    surface: "terminal" | "plan" | "annotations" | "approve" | "code" | "end";
    agent: string;
    caption: string;
    lines: DemoLine[];
}

export const demoChapters: DemoChapter[] = [
    {
        id: "prompt",
        title: "Start with an idea",
        duration: 12,
        surface: "terminal",
        agent: "Router → Planner",
        caption: "Describe the change. RunWield brings in the Planner before any code is changed.",
        lines: [
            {
                at: 6,
                label: "You",
                text: "Add CSV export to the orders page. Let people export just the orders they’re looking at.",
                tone: "user",
            },
            {
                at: 7,
                label: "Router",
                text: "This needs a Plan. Handing off to the Planner.",
                tone: "agent",
                typeFor: 2,
            },
            {
                at: 10,
                label: "read",
                text: "AGENTS.md · project context · orders page · export utilities",
                tone: "tool",
            },
        ],
    },
    {
        id: "questions",
        title: "Clarify the scope",
        duration: 22,
        surface: "terminal",
        agent: "Planner",
        caption: "The Planner asks about decisions that affect the implementation, then writes the Plan.",
        lines: [
            {
                at: 0,
                label: "Planner",
                text: "Should export include only this page, or every order matching the current filters?",
                tone: "agent",
                typeFor: 3,
            },
            { at: 4, label: "You", text: "All matching orders, even across pages.", tone: "user", typeFor: 2 },
            {
                at: 7,
                label: "Planner",
                text: "Who can export? Should we include customer email addresses?",
                tone: "agent",
                typeFor: 3,
            },
            { at: 11, label: "You", text: "Admins only. Leave email addresses out.", tone: "user", typeFor: 2 },
            {
                at: 15,
                label: "Planner",
                text: "I’ll reuse the existing filter query and admin authorization. The Plan will cover permissions, CSV escaping, and pagination.",
                tone: "agent",
                typeFor: 4,
            },
            { at: 20, label: "Plan written", text: "Export filtered orders → opening Plan Review", tone: "success" },
        ],
    },
    {
        id: "plan",
        title: "Review the Plan",
        duration: 12,
        surface: "plan",
        agent: "Planner",
        caption: "Read the approach, affected files, and verification steps in Plan Review before approving execution.",
        lines: [],
    },
    {
        id: "annotations",
        title: "Annotate & chat",
        duration: 24,
        surface: "annotations",
        agent: "Planner",
        caption:
            "Select a passage, send an annotation, and talk through the change with the Planner. The Plan updates with your feedback.",
        lines: [],
    },
    {
        id: "approve",
        title: "Approve & run",
        duration: 8,
        surface: "approve",
        agent: "Engineer",
        caption: "The revised Plan is ready. Approve & Run starts the Engineer in an isolated worktree.",
        lines: [],
    },
    {
        id: "execute",
        title: "Watch it build",
        duration: 17,
        surface: "terminal",
        agent: "Engineer",
        caption: "The Engineer implements the approved Plan and tests the behavior in an isolated worktree.",
        lines: [
            { at: 0, label: "Plan approved", text: "Export filtered orders · Autonomous execution", tone: "success" },
            { at: 2, label: "worktree", text: "orders-csv-export · isolated from your working checkout", tone: "tool" },
            {
                at: 4,
                label: "Engineer",
                text: "Reusing the orders query and admin guard. Adding the export route, CSV serializer, and download button.",
                tone: "agent",
                typeFor: 3,
            },
            {
                at: 8,
                label: "edit",
                text: "src/orders/export.ts       + export filtered orders\nsrc/orders/csv.ts          + serialize CSV safely\nsrc/orders/OrdersPage.tsx  + Export CSV button",
                tone: "tool",
            },
            { at: 11, label: "test", text: "Admin access · filters · pagination · empty results", tone: "tool" },
            {
                at: 14,
                label: "Implementation ready",
                text: "Changes and tests committed in the worktree. Running project CI.",
                tone: "success",
            },
        ],
    },
    {
        id: "ci",
        title: "CI finds it. Repair fixes it.",
        duration: 18,
        surface: "terminal",
        agent: "Engineer · CI repair",
        caption: "A failing project check feeds back into repair. RunWield reruns CI after the fix.",
        lines: [
            { at: 0, label: "$", text: "bun run ci", tone: "tool" },
            { at: 2, label: "PASS", text: "Type check · lint · authorization · filter coverage", tone: "success" },
            {
                at: 4,
                label: "FAIL",
                text: 'csv.test.ts › escapes quotes in order notes\nExpected: "A ""quoted"" note"\nReceived: "A "quoted" note"',
                tone: "error",
            },
            {
                at: 8,
                label: "Engineer",
                text: "The CSV serializer isn’t doubling embedded quotes. Fixing the escaping and adding a regression case.",
                tone: "agent",
                typeFor: 3,
            },
            { at: 12, label: "$", text: "bun run ci", tone: "tool" },
            {
                at: 15,
                label: "PASS",
                text: "All project checks passed. Starting independent AI review.",
                tone: "success",
            },
        ],
    },
    {
        id: "ai-review",
        title: "AI review & repair",
        duration: 18,
        surface: "terminal",
        agent: "Reviewer → Engineer",
        caption:
            "Independent AI review checks the implementation against the Plan. Findings return to the Engineer, followed by fresh validation.",
        lines: [
            {
                at: 0,
                label: "Reviewer",
                text: "Checking the diff against the approved Plan and acceptance scenarios.",
                tone: "agent",
                typeFor: 2,
            },
            {
                at: 4,
                label: "Finding",
                text: "CSV fields beginning with = can run as formulas in spreadsheet apps. Quoting alone does not neutralize them.",
                tone: "error",
            },
            {
                at: 8,
                label: "Engineer",
                text: "Neutralizing formula-like text cells. Adding coverage for =, +, -, and @ prefixes.",
                tone: "agent",
                typeFor: 3,
            },
            { at: 12, label: "CI", text: "All checks passed after repair.", tone: "success" },
            { at: 14, label: "AI review", text: "Finding resolved. No remaining blocking findings.", tone: "success" },
            { at: 16, label: "Code Review ready", text: "Your turn to inspect the change.", tone: "success" },
        ],
    },
    {
        id: "code-review",
        title: "Review the code",
        duration: 23,
        surface: "code",
        agent: "Code Review",
        caption: "Inspect the diff, ask a question about the implementation, then approve the change for publication.",
        lines: [],
    },
    {
        id: "delivered",
        title: "Delivered. Remembered.",
        duration: 10,
        surface: "end",
        agent: "Complete",
        caption:
            "Publication is confirmed. A Work Record preserves the decisions, validation, and lessons for the next change.",
        lines: [],
    },
];

export const demoDuration = demoChapters.reduce((sum, chapter) => sum + chapter.duration, 0);
export const chapterStarts = demoChapters.map((_, index) =>
    demoChapters.slice(0, index).reduce((sum, chapter) => sum + chapter.duration, 0),
);

export function chapterAt(time: number) {
    return Math.max(
        0,
        chapterStarts.findLastIndex((start) => time >= start),
    );
}

export function formatDemoTime(time: number) {
    const seconds = Math.floor(time);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

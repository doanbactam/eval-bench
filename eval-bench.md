# eval-bench — PRD

> Which AI model is actually best for YOUR codebase?
> Record real tasks. Compare models. Stop guessing.

---

## Problem

Developers switch between Claude Sonnet, Opus, GPT-5, Gemini based on benchmarks
that don't reflect their actual work. A TypeScript monorepo is different from
a Python ML codebase. "Best model" depends on your tasks, not SWE-bench.

Nobody has real-world per-developer model performance data.

---

## Solution

An MCP server that sits alongside your coding agent.
It records task metadata — NOT code — and shows you which model performs best
on YOUR specific task types.

---

## User

Developers who use Claude Code, opencode, Cursor, or any MCP-compatible agent.
They pay $20–200/month in AI costs and don't know if they're using the right model.

---

## Core value proposition

**Personal dashboard (immediate value):**
"On YOUR codebase last month:
 Sonnet 4.6 > Opus 4.6 for refactoring (23% faster, similar quality)
 Opus 4.6 > Sonnet 4.6 for debugging (higher first-pass success)"

**Aggregate insights (opt-in, anonymized):**
"TypeScript developers prefer Sonnet for X. Python developers prefer Opus for Y."

---

## Privacy rules (non-negotiable)

**NEVER record:**
- File content
- Function names
- Variable names
- Error message text
- Code diffs

**DO record (metadata only):**
- Task type (classified: refactoring / debugging / docs / new-feature / test)
- Model used
- Session duration (minutes)
- Number of tool calls
- Pass/fail outcome (did tests pass after session?)
- Repo language (TypeScript / Python / Go / etc — from package.json/go.mod)
- Repo size bucket (small <10k LOC / medium / large >100k LOC)
- Agent tool (opencode / claude-code / cursor / other)

All recorded data visible to user at any time: `eval-bench show-data`

---

## MCP server interface

The MCP server exposes one tool that agents call automatically:

```typescript
// Tool: record_task_outcome
{
  name: "record_task_outcome",
  description: "Record the outcome of a completed coding task for personal benchmarking",
  input_schema: {
    task_type: "refactoring" | "debugging" | "docs" | "new_feature" | "test",
    model: string,           // "claude-sonnet-4-6"
    duration_minutes: number,
    tool_calls: number,
    success: boolean,        // did the task complete successfully
    lang: string,            // "typescript" | "python" | "go" | ...
    repo_size: "small" | "medium" | "large"
  }
}
```

Agent calls this tool at the end of each task. No code ever touches this tool.

---

## CLI commands

```bash
# Install MCP server
eval-bench install   # adds to ~/.config/opencode/config.json etc

# View your personal dashboard
eval-bench report

# Compare two models
eval-bench compare claude-sonnet-4-6 claude-opus-4-6

# Show raw recorded data (privacy transparency)
eval-bench show-data

# Opt-in to aggregate (anonymized upload)
eval-bench opt-in

# Export your data
eval-bench export > my-data.json
```

---

## Dashboard output

```
eval-bench report

  Your AI model performance — last 30 days
  ─────────────────────────────────────────
  Tasks recorded: 127
  Repo: TypeScript, large (>100k LOC)

  By task type:
  ┌────────────────┬──────────────────┬──────────────────┬──────────┐
  │ Task type      │ Best model       │ Success rate     │ Avg time │
  ├────────────────┼──────────────────┼──────────────────┼──────────┤
  │ Refactoring    │ Sonnet 4.6  ✓    │ 84% vs 81% Opus  │ 4.2 min  │
  │ Debugging      │ Opus 4.6    ✓    │ 79% vs 71% Sonnet│ 7.8 min  │
  │ New feature    │ Opus 4.6    ✓    │ 68% vs 65% Sonnet│ 12.1 min │
  │ Tests          │ Sonnet 4.6  ✓    │ 91% vs 88% Opus  │ 2.9 min  │
  │ Documentation  │ Sonnet 4.6  ✓    │ 96% vs 95% Opus  │ 1.8 min  │
  └────────────────┴──────────────────┴──────────────────┴──────────┘

  Recommendation:
  Use Sonnet for refactoring, tests, docs (saves ~$47/month vs Opus)
  Use Opus for debugging and new features (worth the premium)
```

---

## Tech stack

- Runtime: Bun
- Language: TypeScript
- MCP server: `@modelcontextprotocol/sdk`
- Local storage: SQLite via `bun:sqlite`
- Dashboard output: terminal tables (no web UI in v1)
- Opt-in aggregate: simple HTTP POST to a Cloudflare Worker

---

## File structure

```
eval-bench/
├── src/
│   ├── mcp-server.ts     # MCP server, exposes record_task_outcome tool
│   ├── store.ts          # SQLite operations
│   ├── classify.ts       # task type classification from context
│   ├── report.ts         # terminal dashboard
│   ├── compare.ts        # model comparison output
│   ├── install.ts        # adds MCP server to agent configs
│   └── aggregate.ts      # opt-in anonymized upload
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installation UX

```bash
npx eval-bench install

  Installing eval-bench MCP server...
  
  ✓ Added to opencode config (~/.config/opencode/config.json)
  ✓ Added to claude-code config (~/.config/claude-code/config.json)
  ✗ Cursor not detected (install manually if needed)
  
  Data stored locally at: ~/.eval-bench/data.db
  Nothing is uploaded without your explicit opt-in.
  
  Run: eval-bench report (after a few sessions)
```

---

## What NOT to build (v1 scope)

- No web dashboard
- No team features
- No real-time monitoring
- No code analysis of any kind
- No automatic agent instrumentation (agents must call the tool)
- No paid tier

---

## Open questions to answer before v0.2

1. How do agents know when a "task" starts and ends? Who defines task boundaries?
2. How to classify task type reliably without seeing code content?
3. What's the minimum sample size before recommendations are statistically valid?
4. What does "success" mean for open-ended tasks (not just test pass/fail)?

These are design questions. Answer them by using the tool yourself for 2 weeks before building v0.2.

---

## Definition of done (v0.1)

- [ ] MCP server runs and records to local SQLite
- [ ] `eval-bench install` adds to opencode and claude-code configs
- [ ] `eval-bench report` outputs basic table
- [ ] `eval-bench show-data` shows exactly what is recorded (privacy transparency)
- [ ] README explicitly states what is and is not recorded
- [ ] Works on macOS

---

## Definition of done (v0.2)

Based on 2 weeks of personal usage. Revise open questions above first.

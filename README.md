# eval-bench

> Which AI model is actually best for YOUR codebase? Record real tasks. Compare models. Stop guessing.

An MCP server that sits alongside your coding agent. It records task metadata — NOT code — and shows you which model performs best on YOUR specific task types.

## Privacy (non-negotiable)

**NEVER recorded:**
- File content
- Function names
- Variable names
- Error message text
- Code diffs

**Recorded (metadata only):**
- Task type (refactoring / debugging / docs / new-feature / test)
- Model used
- Session duration (minutes)
- Number of tool calls
- Pass/fail outcome
- Repo language
- Repo size bucket
- Agent tool

All data stored locally at `~/.eval-bench/data.db`. Nothing is uploaded without explicit opt-in.

## Install

```bash
bun install
bun src/index.tsx install
```

This adds the MCP server to:
- `~/.config/opencode/config.json`
- `~/.claude.json`

## Usage

```bash
# View your personal dashboard (static)
bun src/index.tsx report

# Live dashboard with real-time updates (NEW!)
bun src/index.tsx watch

# Show all recorded data (privacy transparency)
bun src/index.tsx show-data

# Compare two models
bun src/index.tsx compare claude-sonnet-4-6 claude-opus-4-6
```

## Example Output

```
Your AI model performance — last 30 days
────────────────────────────────────────
Tasks recorded: 127  |  Repo: TypeScript, large

┌────────────────────────────────────────────────────────────────┐
│ Task Type       Best Model       Success Rate     Avg Time     │
├────────────────────────────────────────────────────────────────┤
│ Refactoring     Sonnet 4.6 ✓     84%              4.2 min      │
│ Debugging       Opus 4.6 ✓       79%              7.8 min      │
│ New Feature     Opus 4.6 ✓       68%              12.1 min     │
│ Tests           Sonnet 4.6 ✓     91%              2.9 min      │
│ Documentation   Sonnet 4.6 ✓     96%              1.8 min      │
└────────────────────────────────────────────────────────────────┘

Recommendation:
Use Sonnet for refactoring, tests, docs (saves ~$47/month vs Opus)
Use Opus for debugging and new features (worth the premium)
```

## MCP Tool

The server exposes one tool for agents to call:

```typescript
record_task_outcome({
  task_type: "refactoring" | "debugging" | "docs" | "new_feature" | "test",
  model: string,           // "claude-sonnet-4-6"
  duration_minutes: number,
  tool_calls: number,
  success: boolean,
  lang: string,            // "typescript" | "python" | "go" | ...
  repo_size: "small" | "medium" | "large",
  agent: string            // "claude-code" | "opencode" | "cursor"
})
```

## Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector bun src/mcp-server.ts
```

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **MCP SDK:** @modelcontextprotocol/sdk
- **Local Storage:** SQLite via bun:sqlite
- **Terminal UI:** Ink (React-based)

# eval-bench — Agent Guide

> **Principle**: This file is a MAP, not a manual. It points to deeper sources of truth.

## Quick Start

```
bun install
bun src/index.tsx install   # Install MCP server
bun src/index.tsx watch     # Live dashboard
```

## Architecture Map

```
eval-bench/
├── src/
│   ├── index.tsx        # CLI entry point, command routing
│   ├── mcp-server.ts    # MCP server with record_task_outcome tool
│   ├── store.ts         # SQLite operations (ALL data access goes here)
│   ├── install.ts       # Installs MCP server to agent configs
│   └── ui/              # Ink (React) terminal UI components
│       ├── App.tsx      # Command router component
│       ├── Report.tsx   # Static dashboard
│       ├── Watch.tsx    # Live dashboard with 2s polling
│       ├── ShowData.tsx # Raw data viewer
│       ├── Compare.tsx  # Model comparison
│       ├── components/  # Shared UI components
│       └── hooks/       # React hooks for data & formatting
├── eval-bench.md        # PRD and requirements
└── README.md            # User documentation
```

## Data Flow

```
Agent calls MCP tool
       ↓
mcp-server.ts validates with Zod
       ↓
store.ts writes to SQLite (~/.eval-bench/data.db)
       ↓
UI reads via store.ts functions (getAll, getSummary)
```

## Key Files (Read These First)

| File | Purpose |
|------|---------|
| `eval-bench.md` | PRD, requirements, open questions |
| `src/store.ts` | Data schema, all DB operations |
| `src/mcp-server.ts` | Tool interface, Zod schemas |

## Invariants (Non-Negotiable)

1. **Privacy**: NEVER record code content, only metadata
2. **Local-first**: All data at `~/.eval-bench/data.db`
3. **Type safety**: All inputs validated with Zod
4. **SQLite only**: No other database in v1

## Adding a New CLI Command

1. Add case in `src/index.tsx`
2. Create component in `src/ui/`
3. Export from `src/ui/index.ts`
4. Update `printUsage()` in index.tsx

## Adding a New Data Field

1. Update schema in `src/store.ts` (Task interface, CREATE TABLE)
2. Update Zod schema in `src/mcp-server.ts`
3. Update UI components that display data
4. Update `eval-bench.md` PRD

## Testing

```bash
# Test MCP server with inspector
npx @modelcontextprotocol/inspector bun src/mcp-server.ts

# Type check
bunx tsc --noEmit
```

## PRD Status

See `eval-bench.md` for:
- v0.1 Definition of Done
- v0.2 Goals
- Open questions to answer

## Golden Principles

1. **Simplicity over features** - This is a benchmarking tool, not analytics
2. **Privacy by design** - When in doubt, don't record
3. **Fast feedback** - 2s polling for live dashboard
4. **Statistical validity** - Require min 3 tasks for recommendations

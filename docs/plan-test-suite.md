# Plan: Test Suite for eval-bench

## Goal
Add comprehensive test suite to ensure code quality before adding new features.

## Why Test Suite First?
- Current code has TypeScript errors (though Bun runs fine)
- No automated testing - changes could break existing functionality
- Foundation for future development with confidence

## Test Strategy

### 1. Unit Tests (Priority: High)
- **store.ts** - SQLite operations (insert, getAll, getSummary)
- **hooks/useFormat.ts** - formatting functions (pure, easy to test)

### 2. Integration Tests (Priority: Medium)
- MCP server tool execution
- CLI command routing

### 3. Type Tests (Priority: Medium)
- Fix existing TypeScript errors
- Add proper type annotations

## Implementation Plan

### Step 1: Setup Test Infrastructure
```bash
bun add -d bun:test
```

### Step 2: Create Test Files
```
src/
├── store.test.ts       # Unit tests for store
├── ui/
│   └── hooks/
│       └── useFormat.test.ts  # Unit tests for formatting
```

### Step 3: Fix Type Errors
- Add type annotations where missing
- Update imports for verbatimModuleSyntax

### Step 4: Add Test Scripts
```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch"
  }
}
```

## Acceptance Criteria
- [ ] `bun test` runs successfully
- [ ] All store functions have tests
- [ ] All format functions have tests
- [ ] TypeScript errors fixed (or suppressed with reason)
- [ ] CI-ready test command

## Estimated Complexity
Low - Pure functions, simple assertions

## Risks
- SQLite in tests may need :memory: database
- Ink components hard to test without DOM

## Decision
Focus on unit tests for data layer and formatting. Skip UI component tests for now.

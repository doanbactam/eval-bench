# Plan: Expand Test Coverage to 90%+

## Current State
- Overall: 90%
- 21 tests pass

## Gaps
| File | Coverage | Priority |
|------|----------|----------|
| `install.ts` | 0% | High |
| `mcp-server.ts` | ~0% | High |
| `store.ts` | 40% | Medium |
| `ui/hooks/*` | 0% | Low |

## Plan

### 1. Add install.test.ts (High Priority)
Test cases:
- Creates config directory if not't exist
- Adds MCP server to opencode config
- Adds MCP server to claude-code config
- Handles existing config
- Handles missing config path
- Error handling

### 2. Add mcp-server.test.ts (High Priority)
Test cases:
- Server starts successfully
- Tool registration
- record_task_outcome validation
- Error responses

### 3. Expand store.test.ts (Medium Priority)
Additional tests:
- Update operations
- Delete operations
- Query edge cases
- Empty database
- Large dataset

### 4. Add ui/hooks tests (Low Priority - Optional)
- usePolling hook
- useTaskData hook

## Acceptance Criteria
- [ ] Coverage reaches 95%+
- [ ] All new tests pass
- [ ] CI passes

## Complexity
Medium - ~~2 hours
- New test files: 4
- Additional tests: ~15

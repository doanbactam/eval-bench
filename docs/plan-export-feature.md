# Plan: eval-bench export Feature

## Goal
Add `eval-bench export` command to export all recorded data to JSON format.

## Requirements (from PRD)
- Command: `eval-bench export > my-data.json`
- Output to stdout (pipeable to file)
- Format: JSON
- Privacy: only metadata, no code content

## Implementation Plan

### Step 1: Create Export Module
File: `src/export.ts`

```typescript
interface ExportData {
  exported_at: string;
  version: string;
  total_tasks: number;
  tasks: TaskRecord[];
}

export function exportToJson(): string {
  const tasks = getAll();
  const data: ExportData = {
    exported_at: new Date().toISOString(),
    version: "0.1.0",
    total_tasks: tasks.length,
    tasks: tasks
  };
  return JSON.stringify(data, null, 2);
}
```

### Step 2: Add CLI Command
File: `src/index.tsx`

Add case:
```typescript
case "export":
  console.log(exportToJson());
  break;
```

### Step 3: Add Tests
File: `src/export.test.ts`

Test cases:
- Export empty data
- Export with multiple tasks
- JSON format validation

### Step 4: Update Usage
File: `src/index.tsx` - `printUsage()`

Add:
```
  eval-bench export > my-data.json
```

## Acceptance Criteria
- [ ] `bun src/index.tsx export` outputs valid JSON
- [ ] `bun src/index.tsx export > test.json` creates file
- [ ] JSON includes exported_at, version, total_tasks, tasks array
- [ ] Tests pass
- [ ] Privacy: no code content in output

## Complexity
Low - Single function, pure transformation, ~15 min

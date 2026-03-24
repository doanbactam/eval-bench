import { Database } from "bun:sqlite";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";

// Lazy evaluation of DB_PATH for testability
function getDbPath(): string {
  return `${process.env.HOME}/.eval-bench/data.db`;
}

export type TaskType = "refactoring" | "debugging" | "docs" | "new_feature" | "test";
export type RepoSize = "small" | "medium" | "large";

export interface Task {
  task_type: TaskType;
  model: string;
  duration_minutes: number;
  tool_calls: number;
  success: boolean;
  lang: string;
  repo_size: RepoSize;
  agent: string;
}

export interface TaskRecord extends Task {
  id: number;
  recorded_at: string;
}

function getDb(): Database {
  const dbPath = getDbPath();
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath, { create: true });
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_type TEXT NOT NULL,
      model TEXT NOT NULL,
      duration_minutes REAL NOT NULL,
      tool_calls INTEGER NOT NULL,
      success INTEGER NOT NULL,
      lang TEXT NOT NULL,
      repo_size TEXT NOT NULL,
      agent TEXT NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  return db;
}

export function insert(task: Task): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent)
    VALUES ($task_type, $model, $duration_minutes, $tool_calls, $success, $lang, $repo_size, $agent)
  `);
  const result = stmt.run({
    $task_type: task.task_type,
    $model: task.model,
    $duration_minutes: task.duration_minutes,
    $tool_calls: task.tool_calls,
    $success: task.success ? 1 : 0,
    $lang: task.lang,
    $repo_size: task.repo_size,
    $agent: task.agent,
  });
  db.close();
  return result.lastInsertRowid as number;
}

export function getAll(): TaskRecord[] {
  const db = getDb();
  const tasks = db.query<TaskRecord, []>("SELECT * FROM tasks ORDER BY recorded_at DESC").all();
  db.close();
  return tasks;
}

export interface SummaryRow {
  task_type: string;
  model: string;
  count: number;
  success_count: number;
  success_rate: number;
  avg_duration: number;
  avg_tool_calls: number;
}

export function getSummary(): SummaryRow[] {
  const db = getDb();
  const rows = db.query<SummaryRow, []>(`
    SELECT
      task_type,
      model,
      COUNT(*) as count,
      SUM(success) as success_count,
      AVG(success) * 100 as success_rate,
      AVG(duration_minutes) as avg_duration,
      AVG(tool_calls) as avg_tool_calls
    FROM tasks
    GROUP BY task_type, model
    ORDER BY task_type, success_rate DESC
  `).all();
  db.close();
  return rows;
}

export function getTasksByModel(model: string): TaskRecord[] {
  const db = getDb();
  const tasks = db.query<TaskRecord, [string]>(
    "SELECT * FROM tasks WHERE model = ? ORDER BY recorded_at DESC"
  ).all(model);
  db.close();
  return tasks;
}

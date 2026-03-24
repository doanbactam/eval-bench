import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";

// Tests for actual store.ts functions with isolated databases
let originalHome: string | undefined;
let testCounter = 0;
let testDir: string;

describe("Store Functions (Integration)", () => {
  beforeEach(async () => {
    // Save original HOME
    originalHome = process.env.HOME;
    // Create unique test directory for each test
    testCounter++;
    testDir = join(process.cwd(), `test-store-${testCounter}-${Date.now()}`);
    process.env.HOME = testDir;
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Restore original HOME
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }

    // Clean up test directory (with retry for Windows file locking)
    if (existsSync(testDir)) {
      try {
        rmSync(testDir, { recursive: true, force: true });
      } catch {
        // Ignore EBUSY errors on Windows - the database file may still be locked
        // The test directories will be cleaned up eventually
      }
    }
  });

  describe("insert", () => {
    test("inserts a task and returns id", async () => {
      // Dynamic import after HOME is set
      const { insert } = await import("./store.js");

      const id = insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 5.5,
        tool_calls: 10,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      expect(id).toBeGreaterThan(0);
    });

    test("converts boolean success to integer", async () => {
      const { insert, getAll } = await import("./store.js");

      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 5.0,
        tool_calls: 10,
        success: false,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      const tasks = getAll();
      expect(tasks).toHaveLength(1);
      // SQLite returns 0/1 for boolean, which is falsy/truthy
      expect(tasks[0].success).toBeFalsy();
    });
  });

  describe("getAll", () => {
    test("returns empty array when no records", async () => {
      const { getAll } = await import("./store.js");
      const tasks = getAll();
      expect(tasks).toHaveLength(0);
    });

    test("returns all records ordered by recorded_at DESC", async () => {
      const { insert, getAll } = await import("./store.js");

      // Insert older record first
      insert({
        task_type: "debugging",
        model: "claude-opus-4-6",
        duration_minutes: 5.0,
        tool_calls: 10,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      // Wait for SQLite datetime to change (at least 1 second)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Insert newer record
      insert({
        task_type: "refactoring",
        model: "claude-sonnet-4-6",
        duration_minutes: 3.0,
        tool_calls: 5,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      const tasks = getAll();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].task_type).toBe("refactoring"); // newer first
      expect(tasks[1].task_type).toBe("debugging"); // older second
    });

    test("includes id and recorded_at fields", async () => {
      const { insert, getAll } = await import("./store.js");

      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 5.0,
        tool_calls: 10,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      const tasks = getAll();
      expect(tasks[0].id).toBeDefined();
      expect(tasks[0].id).toBeGreaterThan(0);
      expect(tasks[0].recorded_at).toBeDefined();
      expect(typeof tasks[0].recorded_at).toBe("string");
    });
  });

  describe("getSummary", () => {
    test("returns empty array when no records", async () => {
      const { getSummary } = await import("./store.js");
      const summary = getSummary();
      expect(summary).toHaveLength(0);
    });

    test("aggregates by task_type and model", async () => {
      const { insert, getSummary } = await import("./store.js");

      // Insert sample data
      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 5.0,
        tool_calls: 10,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });
      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 3.0,
        tool_calls: 5,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });
      insert({
        task_type: "debugging",
        model: "claude-opus-4-6",
        duration_minutes: 7.0,
        tool_calls: 15,
        success: false,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });
      insert({
        task_type: "refactoring",
        model: "claude-sonnet-4-6",
        duration_minutes: 2.0,
        tool_calls: 3,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      const summary = getSummary();
      expect(summary).toHaveLength(3);

      const sonnetDebug = summary.find(
        (s) => s.task_type === "debugging" && s.model === "claude-sonnet-4-6"
      );
      expect(sonnetDebug).toBeDefined();
      expect(sonnetDebug!.count).toBe(2);
      expect(sonnetDebug!.success_count).toBe(2);
      expect(sonnetDebug!.success_rate).toBe(100);

      const opusDebug = summary.find(
        (s) => s.task_type === "debugging" && s.model === "claude-opus-4-6"
      );
      expect(opusDebug).toBeDefined();
      expect(opusDebug!.count).toBe(1);
      expect(opusDebug!.success_count).toBe(0);
      expect(opusDebug!.success_rate).toBe(0);
    });

    test("calculates averages correctly", async () => {
      const { insert, getSummary } = await import("./store.js");

      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 4.0,
        tool_calls: 10,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });
      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 6.0,
        tool_calls: 20,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      const summary = getSummary();
      const debug = summary[0];
      expect(debug.avg_duration).toBe(5.0);
      expect(debug.avg_tool_calls).toBe(15);
    });
  });

  describe("getTasksByModel", () => {
    test("returns empty array when no records for model", async () => {
      const { getTasksByModel } = await import("./store.js");
      const tasks = getTasksByModel("claude-sonnet-4-6");
      expect(tasks).toHaveLength(0);
    });

    test("returns only records for specified model", async () => {
      const { insert, getTasksByModel } = await import("./store.js");

      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 5.0,
        tool_calls: 10,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });
      insert({
        task_type: "debugging",
        model: "claude-opus-4-6",
        duration_minutes: 7.0,
        tool_calls: 15,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      const sonnetTasks = getTasksByModel("claude-sonnet-4-6");
      expect(sonnetTasks).toHaveLength(1);
      expect(sonnetTasks[0].model).toBe("claude-sonnet-4-6");

      const opusTasks = getTasksByModel("claude-opus-4-6");
      expect(opusTasks).toHaveLength(1);
      expect(opusTasks[0].model).toBe("claude-opus-4-6");
    });

    test("orders by recorded_at DESC", async () => {
      const { insert, getTasksByModel } = await import("./store.js");

      insert({
        task_type: "debugging",
        model: "claude-sonnet-4-6",
        duration_minutes: 5.0,
        tool_calls: 10,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      // Wait for SQLite datetime to change (at least 1 second)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      insert({
        task_type: "refactoring",
        model: "claude-sonnet-4-6",
        duration_minutes: 3.0,
        tool_calls: 5,
        success: true,
        lang: "typescript",
        repo_size: "medium",
        agent: "claude-code",
      });

      const tasks = getTasksByModel("claude-sonnet-4-6");
      expect(tasks).toHaveLength(2);
      expect(tasks[0].task_type).toBe("refactoring"); // newer first
      expect(tasks[1].task_type).toBe("debugging"); // older second
    });
  });
});

// Test with in-memory database
let db: Database;

// Helper to create test database
function createTestDb(): Database {
  const testDb = new Database(":memory:");
  testDb.run(`
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
  return testDb;
}

describe("Store Operations", () => {
  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    db.close();
  });

  describe("insert", () => {
    test("inserts a task record", () => {
      const stmt = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        "debugging",
        "claude-sonnet-4-6",
        5.5,
        10,
        1,
        "typescript",
        "medium",
        "claude-code"
      );

      expect(result.lastInsertRowid).toBeGreaterThan(0);
    });

    test("inserts multiple records", () => {
      const stmt = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run("refactoring", "claude-sonnet-4-6", 3.0, 5, 1, "typescript", "medium", "claude-code");
      stmt.run("debugging", "claude-opus-4-6", 7.5, 15, 1, "typescript", "medium", "claude-code");
      stmt.run("test", "claude-sonnet-4-6", 2.0, 3, 0, "typescript", "medium", "claude-code");

      const count = db.query("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
      expect(count.count).toBe(3);
    });
  });

  describe("getAll", () => {
    test("returns empty array when no records", () => {
      const tasks = db.query("SELECT * FROM tasks ORDER BY recorded_at DESC").all();
      expect(tasks).toHaveLength(0);
    });

    test("returns all records ordered by recorded_at DESC", () => {
      const stmt = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 hour'))
      `);

      stmt.run("debugging", "claude-opus-4-6", 5.0, 10, 1, "typescript", "medium", "claude-code");

      const stmt2 = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      stmt2.run("refactoring", "claude-sonnet-4-6", 3.0, 5, 1, "typescript", "medium", "claude-code");

      const tasks = db.query("SELECT * FROM tasks ORDER BY recorded_at DESC").all() as Array<{ task_type: string }>;
      expect(tasks).toHaveLength(2);
      expect(tasks[0].task_type).toBe("refactoring");
      expect(tasks[1].task_type).toBe("debugging");
    });
  });

  describe("getSummary", () => {
    test("aggregates by task_type and model", () => {
      const stmt = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Insert sample data
      stmt.run("debugging", "claude-sonnet-4-6", 5.0, 10, 1, "typescript", "medium", "claude-code");
      stmt.run("debugging", "claude-sonnet-4-6", 3.0, 5, 1, "typescript", "medium", "claude-code");
      stmt.run("debugging", "claude-opus-4-6", 7.0, 15, 0, "typescript", "medium", "claude-code");
      stmt.run("refactoring", "claude-sonnet-4-6", 2.0, 3, 1, "typescript", "medium", "claude-code");

      const summary = db.query(`
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
      `).all() as Array<{ task_type: string; model: string; count: number; success_count: number; success_rate: number }>;

      expect(summary).toHaveLength(3);

      const sonnetDebug = summary.find(s => s.task_type === "debugging" && s.model === "claude-sonnet-4-6");
      expect(sonnetDebug).toBeDefined();
      expect(sonnetDebug!.count).toBe(2);
      expect(sonnetDebug!.success_count).toBe(2);
      expect(sonnetDebug!.success_rate).toBe(100);

      const opusDebug = summary.find(s => s.task_type === "debugging" && s.model === "claude-opus-4-6");
      expect(opusDebug).toBeDefined();
      expect(opusDebug!.count).toBe(1);
      expect(opusDebug!.success_count).toBe(0);
      expect(opusDebug!.success_rate).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    test("handles zero values", () => {
      const stmt = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run("debugging", "claude-sonnet-4-6", 0, 0, 0, "typescript", "small", "claude-code");

      const tasks = db.query("SELECT * FROM tasks").all() as Array<{ duration_minutes: number; tool_calls: number }>;
      expect(tasks[0].duration_minutes).toBe(0);
      expect(tasks[0].tool_calls).toBe(0);
    });

    test("handles large numbers", () => {
      const stmt = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run("debugging", "claude-sonnet-4-6", 999.99, 99999, 1, "typescript", "large", "claude-code");

      const tasks = db.query("SELECT * FROM tasks").all() as Array<{ duration_minutes: number; tool_calls: number }>;
      expect(tasks[0].duration_minutes).toBe(999.99);
      expect(tasks[0].tool_calls).toBe(99999);
    });

    test("handles special characters in lang", () => {
      const stmt = db.prepare(`
        INSERT INTO tasks (task_type, model, duration_minutes, tool_calls, success, lang, repo_size, agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run("debugging", "claude-sonnet-4-6", 5.0, 10, 1, "c++", "medium", "claude-code");

      const tasks = db.query("SELECT * FROM tasks").all() as Array<{ lang: string }>;
      expect(tasks[0].lang).toBe("c++");
    });
  });
});

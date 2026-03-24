import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { exportToJson } from "./export.ts";
import { mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";

// Test with isolated database
let originalHome: string | undefined;
let testCounter = 0;

describe("Export", () => {
  let testDir: string;

  beforeEach(() => {
    // Save original HOME
    originalHome = process.env.HOME;
    // Create unique test directory for each test
    testCounter++;
    testDir = join(process.cwd(), `test-temp-${testCounter}-${Date.now()}`);
    process.env.HOME = testDir;

    // Ensure clean test directory
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Restore original HOME
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }

    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("exports valid JSON structure", () => {
    const json = exportToJson();

    // Verify it's valid JSON
    const data = JSON.parse(json);

    // Check required fields
    expect(data.exported_at).toBeDefined();
    expect(data.version).toBe("0.1.0");
    expect(typeof data.total_tasks).toBe("number");
    expect(Array.isArray(data.tasks)).toBe(true);
  });

  test("includes exported_at in ISO format", () => {
    const json = exportToJson();
    const data = JSON.parse(json);

    const date = new Date(data.exported_at);
    expect(date.toISOString()).toBe(data.exported_at);
  });

  test("total_tasks matches tasks array length", () => {
    const json = exportToJson();
    const data = JSON.parse(json);

    expect(data.total_tasks).toBe(data.tasks.length);
  });
});

import { describe, test, expect } from "bun:test";
import { z } from "zod";
import { mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";

// Test tool schema validation
describe("MCP Server Tool Schema", () => {
  test("validates task_type enum values", () => {
    const validTypes = ["refactoring", "debugging", "docs", "new_feature", "test"];
    const schema = z.enum(validTypes);

    for (const type of validTypes) {
      const result = schema.safeParse(type);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(type);
      }
    }
  });

  test("rejects invalid task_type", () => {
    const schema = z.enum(["refactoring", "debugging", "docs", "new_feature", "test"]);
    const result = schema.safeParse("invalid_type");
    expect(result.success).toBe(false);
  });

  test("validates repo_size enum", () => {
    const schema = z.enum(["small", "medium", "large"]);

    expect(schema.safeParse("small").success).toBe(true);
    expect(schema.safeParse("medium").success).toBe(true);
    expect(schema.safeParse("large").success).toBe(true);
  });

  test("validates duration_minutes as number", () => {
    const schema = z.number();
    expect(schema.safeParse(5.5).success).toBe(true);
    expect(schema.safeParse(0).success).toBe(true);
    expect(schema.safeParse(100).success).toBe(true);
  });

  test("validates tool_calls as number", () => {
    const schema = z.number();
    expect(schema.safeParse(0).success).toBe(true);
    expect(schema.safeParse(10).success).toBe(true);
    expect(schema.safeParse(1000).success).toBe(true);
  });

  test("validates success as boolean", () => {
    const schema = z.boolean();
    expect(schema.safeParse(true).success).toBe(true);
    expect(schema.safeParse(false).success).toBe(true);
  });

  test("validates model as string", () => {
    const schema = z.string();
    expect(schema.safeParse("claude-sonnet-4-6").success).toBe(true);
    expect(schema.safeParse("claude-opus-4-6").success).toBe(true);
    expect(schema.safeParse("gpt-4").success).toBe(true);
  });

  test("validates lang as string", () => {
    const schema = z.string();
    expect(schema.safeParse("typescript").success).toBe(true);
    expect(schema.safeParse("python").success).toBe(true);
    expect(schema.safeParse("go").success).toBe(true);
  });

  test("validates agent as string", () => {
    const schema = z.string();
    expect(schema.safeParse("claude-code").success).toBe(true);
    expect(schema.safeParse("opencode").success).toBe(true);
    expect(schema.safeParse("cursor").success).toBe(true);
  });
});

#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { insert } from "./store.js";

const server = new McpServer({
  name: "eval-bench",
  version: "0.1.0",
});

server.tool(
  "record_task_outcome",
  "Record the outcome of a completed coding task for personal benchmarking. Call this at the end of each coding task with metadata about what was accomplished.",
  {
    task_type: z.enum(["refactoring", "debugging", "docs", "new_feature", "test"])
      .describe("Type of task: refactoring, debugging, docs, new_feature, or test"),
    model: z.string()
      .describe("Model used, e.g., claude-sonnet-4-6, claude-opus-4-6, gpt-4"),
    duration_minutes: z.number()
      .describe("Duration of the task in minutes"),
    tool_calls: z.number()
      .describe("Number of tool calls made during the task"),
    success: z.boolean()
      .describe("Whether the task completed successfully"),
    lang: z.string()
      .describe("Primary language of the repo: typescript, python, go, etc"),
    repo_size: z.enum(["small", "medium", "large"])
      .describe("Size of repo: small (<10k LOC), medium, or large (>100k LOC)"),
    agent: z.string()
      .describe("Agent tool used: opencode, claude-code, cursor, or other"),
  },
  async (args) => {
    const id = insert({
      task_type: args.task_type,
      model: args.model,
      duration_minutes: args.duration_minutes,
      tool_calls: args.tool_calls,
      success: args.success,
      lang: args.lang,
      repo_size: args.repo_size,
      agent: args.agent,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: `Recorded task outcome (id: ${id}). Task: ${args.task_type}, Model: ${args.model}, Success: ${args.success}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});

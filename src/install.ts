import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { homedir } from "os";

const HOME = homedir();

interface McpConfig {
  mcpServers?: Record<string, { command: string; args?: string[]; env?: Record<string, string> }>;
}

function getConfigPath(agent: string): string | null {
  switch (agent) {
    case "opencode":
      return join(HOME, ".config", "opencode", "config.json");
    case "claude-code":
      // Check both possible locations
      const claudeRoot = join(HOME, ".claude.json");
      const claudeConfig = join(HOME, ".config", "claude", "config.json");
      if (existsSync(claudeRoot)) return claudeRoot;
      return claudeConfig;
    default:
      return null;
  }
}

function getServerCommand(): { command: string; args: string[] } {
  // Use bun to run the mcp-server
  const serverPath = join(import.meta.dir, "mcp-server.ts");
  return {
    command: "bun",
    args: [serverPath],
  };
}

function addMcpServer(configPath: string, serverName: string): boolean {
  try {
    let config: McpConfig = {};

    if (existsSync(configPath)) {
      const content = readFileSync(configPath, "utf-8");
      try {
        config = JSON.parse(content);
      } catch {
        // If file exists but isn't valid JSON, start fresh
        config = {};
      }
    }

    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    const { command, args } = getServerCommand();
    config.mcpServers[serverName] = { command, args };

    // Ensure directory exists
    const dir = dirname(configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return true;
  } catch (err) {
    console.error(`Failed to update ${configPath}:`, err);
    return false;
  }
}

export function install(): void {
  console.log("Installing eval-bench MCP server...\n");

  const agents = [
    { name: "opencode", displayName: "opencode" },
    { name: "claude-code", displayName: "claude-code" },
  ];

  let updated = 0;
  let notFound = 0;

  for (const agent of agents) {
    const configPath = getConfigPath(agent.name);
    if (!configPath) continue;

    if (existsSync(configPath)) {
      const success = addMcpServer(configPath, "eval-bench");
      if (success) {
        console.log(`  ✓ Added to ${agent.displayName} config (${configPath})`);
        updated++;
      } else {
        console.log(`  ✗ Failed to update ${agent.displayName} config (${configPath})`);
      }
    } else {
      // Try to create it anyway
      const success = addMcpServer(configPath, "eval-bench");
      if (success) {
        console.log(`  ✓ Created ${agent.displayName} config (${configPath})`);
        updated++;
      } else {
        console.log(`  ✗ ${agent.displayName} config not found (${configPath})`);
        notFound++;
      }
    }
  }

  console.log(`\n  Data stored locally at: ${HOME}/.eval-bench/data.db`);
  console.log("  Nothing is uploaded without your explicit opt-in.\n");
  console.log("  Run: eval-bench report (after a few sessions)");
}

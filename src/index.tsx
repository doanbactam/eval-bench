#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { install } from "./install.js";
import { App } from "./ui/App.js";
import { exportToJson } from "./export.js";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
eval-bench - Personal AI coding task benchmarking

Usage:
  eval-bench install    Install MCP server into agent configs
  eval-bench report     Show performance dashboard (static)
  eval-bench watch      Show live dashboard with real-time updates
  eval-bench show-data  Show all recorded data (privacy transparency)
  eval-bench export     Export all data to JSON (pipe to file)
  eval-bench compare <model1> <model2>  Compare two models

Examples:
  eval-bench install
  eval-bench watch
  eval-bench export > my-data.json
  eval-bench compare claude-sonnet-4-6 claude-opus-4-6

Data is stored locally at ~/.eval-bench/data.db
Nothing is uploaded without your explicit opt-in.
`);
}

// Commands that use Ink UI
const INK_COMMANDS = ["report", "watch", "show-data", "compare"] as const;
type InkCommand = (typeof INK_COMMANDS)[number];

function isInkCommand(cmd: string): cmd is InkCommand {
  return INK_COMMANDS.includes(cmd as InkCommand);
}

switch (command) {
  case "install":
    install();
    break;

  case "report":
  case "watch":
  case "show-data":
    render(<App command={command} />);
    break;

  case "compare":
    render(<App command="compare" args={args.slice(1)} />);
    break;

  case "export":
    console.log(exportToJson());
    break;

  case "help":
  case "--help":
  case "-h":
    printUsage();
    break;

  default:
    if (command) {
      console.log(`Unknown command: ${command}`);
    }
    printUsage();
    process.exit(command ? 1 : 0);
}

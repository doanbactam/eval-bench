import React from "react";
import { Box, Text } from "ink";
import { Report } from "./Report.js";
import { Watch } from "./Watch.js";
import { ShowData } from "./ShowData.js";
import { Compare } from "./Compare.js";

export interface AppProps {
  command: "report" | "watch" | "show-data" | "compare";
  args?: string[];
}

export const App: React.FC<AppProps> = ({ command, args }) => {
  switch (command) {
    case "watch":
      return <Watch />;

    case "show-data":
      return <ShowData />;

    case "compare":
      if (!args || args.length < 2) {
        return (
          <Box flexDirection="column" padding={1}>
            <Text color="red">Usage: eval-bench compare {"<model1>"} {"<model2>"}</Text>
            <Text dimColor>Example: eval-bench compare claude-sonnet-4-6 claude-opus-4-6</Text>
          </Box>
        );
      }
      return <Compare model1={args[0]} model2={args[1]} />;

    case "report":
    default:
      return <Report />;
  }
};

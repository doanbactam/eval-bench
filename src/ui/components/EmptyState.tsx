import React from "react";
import { Box, Text } from "ink";
import type { EmptyStateProps } from "../types.js";

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No tasks recorded yet.",
}) => {
  return (
    <Box flexDirection="column" paddingY={2}>
      <Box>
        <Text dimColor>{message}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          Use the record_task_outcome MCP tool after completing coding tasks.
        </Text>
      </Box>
    </Box>
  );
};

import React from "react";
import { Box, Text } from "ink";
import type { HeaderProps } from "../types.js";

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="cyan">
          {title}
        </Text>
      </Box>
      {subtitle && (
        <Box>
          <Text dimColor>{subtitle}</Text>
        </Box>
      )}
      <Box>
        <Text dimColor>{"─".repeat(40)}</Text>
      </Box>
    </Box>
  );
};

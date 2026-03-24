import React, { useEffect } from "react";
import { Box, Text } from "ink";
import { useTaskData } from "./hooks/useTaskData.js";
import { useFormat } from "./hooks/useFormat.js";
import { Header } from "./components/Header.js";

const COL_WIDTHS = {
  id: 5,
  taskType: 14,
  model: 22,
  success: 8,
  duration: 10,
  lang: 12,
  when: 10,
};

export const ShowData: React.FC = () => {
  const { tasks, loading, refresh } = useTaskData();
  const { formatDuration, formatRelativeTime, formatModelName } = useFormat();

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <Box paddingY={2}>
        <Text dimColor>Loading...</Text>
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text dimColor>No data recorded.</Text>
        <Box marginTop={1}>
          <Text dimColor>This tool only records metadata, never code content:</Text>
        </Box>
        <Box marginLeft={2}>
          <Text dimColor>
            - task_type, model, duration_minutes, tool_calls
          </Text>
        </Box>
        <Box marginLeft={2}>
          <Text dimColor>- success, lang, repo_size, agent, recorded_at</Text>
        </Box>
      </Box>
    );
  }

  const displayTasks = tasks.slice(0, 50);

  return (
    <Box flexDirection="column" padding={1}>
      <Header title={`${tasks.length} tasks recorded`} />

      {/* Header row */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Box width={COL_WIDTHS.id}>
          <Text bold>ID</Text>
        </Box>
        <Box width={COL_WIDTHS.taskType}>
          <Text bold>Task Type</Text>
        </Box>
        <Box width={COL_WIDTHS.model}>
          <Text bold>Model</Text>
        </Box>
        <Box width={COL_WIDTHS.success}>
          <Text bold>Success</Text>
        </Box>
        <Box width={COL_WIDTHS.duration}>
          <Text bold>Duration</Text>
        </Box>
        <Box width={COL_WIDTHS.lang}>
          <Text bold>Lang</Text>
        </Box>
        <Box width={COL_WIDTHS.when}>
          <Text bold>When</Text>
        </Box>
      </Box>

      {/* Data rows */}
      {displayTasks.map((task) => (
        <Box key={task.id}>
          <Box width={COL_WIDTHS.id}>
            <Text dimColor>{task.id}</Text>
          </Box>
          <Box width={COL_WIDTHS.taskType}>
            <Text>{task.task_type}</Text>
          </Box>
          <Box width={COL_WIDTHS.model}>
            <Text color="cyan">{formatModelName(task.model)}</Text>
          </Box>
          <Box width={COL_WIDTHS.success}>
            {task.success ? (
              <Text color="green">✓ yes</Text>
            ) : (
              <Text color="red">✗ no</Text>
            )}
          </Box>
          <Box width={COL_WIDTHS.duration}>
            <Text dimColor>{formatDuration(task.duration_minutes)}</Text>
          </Box>
          <Box width={COL_WIDTHS.lang}>
            <Text>{task.lang}</Text>
          </Box>
          <Box width={COL_WIDTHS.when}>
            <Text dimColor>{formatRelativeTime(task.recorded_at)}</Text>
          </Box>
        </Box>
      ))}

      {tasks.length > 50 && (
        <Box marginTop={1}>
          <Text dimColor>... and {tasks.length - 50} more</Text>
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Data stored at: ~/.eval-bench/data.db</Text>
        <Text dimColor>Nothing is uploaded without your explicit opt-in.</Text>
      </Box>
    </Box>
  );
};

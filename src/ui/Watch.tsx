import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { useTaskData } from "./hooks/useTaskData.js";
import { usePolling } from "./hooks/usePolling.js";
import { useFormat } from "./hooks/useFormat.js";
import { Header } from "./components/Header.js";
import { EmptyState } from "./components/EmptyState.js";
import { TaskTypeTable } from "./components/TaskTypeTable.js";
import { Recommendation } from "./components/Recommendation.js";

const POLL_INTERVAL = 2000; // 2 seconds

export const Watch: React.FC = () => {
  const { tasks, summary, loading, refresh } = useTaskData();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { formatTimestamp } = useFormat();

  // Initial load
  useEffect(() => {
    refresh();
    setLastUpdate(new Date());
  }, []);

  // Polling for updates
  usePolling(() => {
    refresh();
    setLastUpdate(new Date());
  }, POLL_INTERVAL);

  if (loading && tasks.length === 0) {
    return (
      <Box paddingY={2}>
        <Text dimColor>Loading...</Text>
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <EmptyState message="Waiting for tasks..." />
        <Box marginTop={1}>
          <Text dimColor>
            Live monitoring — Last update: {formatTimestamp(lastUpdate)}
          </Text>
        </Box>
      </Box>
    );
  }

  // Get dominant lang/repo_size
  const recentTasks = tasks.slice(0, 100);
  const langCounts = new Map<string, number>();
  for (const t of recentTasks) {
    langCounts.set(t.lang, (langCounts.get(t.lang) || 0) + 1);
  }
  const dominantLang =
    [...langCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

  return (
    <Box flexDirection="column" padding={1}>
      <Header
        title="Your AI model performance — LIVE"
        subtitle="Press Ctrl+C to exit"
      />

      <Box marginBottom={1}>
        <Text>Tasks recorded: </Text>
        <Text bold color="green">{tasks.length}</Text>
        <Text>  |  Repo: </Text>
        <Text bold>{dominantLang}</Text>
        <Text>  |  Last update: </Text>
        <Text dimColor>{formatTimestamp(lastUpdate)}</Text>
      </Box>

      <TaskTypeTable summary={summary} />
      <Recommendation summary={summary} />

      <Box marginTop={1}>
        <Text dimColor>
          Polling every {POLL_INTERVAL / 1000}s — Ctrl+C to exit
        </Text>
      </Box>
    </Box>
  );
};

import React, { useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { useTaskData } from "./hooks/useTaskData.js";
import { Header } from "./components/Header.js";
import { EmptyState } from "./components/EmptyState.js";
import { TaskTypeTable } from "./components/TaskTypeTable.js";
import { Recommendation } from "./components/Recommendation.js";
import type { TaskRecord } from "../store.js";

export const Report: React.FC = () => {
  const { tasks, summary, loading, refresh } = useTaskData();

  useEffect(() => {
    refresh();
  }, []);

  // Get dominant lang/repo_size from recent tasks
  const repoInfo = useMemo(() => {
    if (tasks.length === 0) return { lang: "unknown", size: "unknown" };

    const recentTasks = tasks.slice(0, 100);
    const langCounts = new Map<string, number>();
    const sizeCounts = new Map<string, number>();

    for (const t of recentTasks) {
      langCounts.set(t.lang, (langCounts.get(t.lang) || 0) + 1);
      sizeCounts.set(t.repo_size, (sizeCounts.get(t.repo_size) || 0) + 1);
    }

    const dominantLang =
      [...langCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
    const dominantSize =
      [...sizeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

    return { lang: dominantLang, size: dominantSize };
  }, [tasks]);

  if (loading) {
    return (
      <Box paddingY={2}>
        <Text dimColor>Loading...</Text>
      </Box>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Your AI model performance — last 30 days" />

      <Box marginBottom={1}>
        <Text>Tasks recorded: </Text>
        <Text bold>{tasks.length}</Text>
        <Text>  |  Repo: </Text>
        <Text bold>
          {repoInfo.lang}, {repoInfo.size}
        </Text>
      </Box>

      <TaskTypeTable summary={summary} />
      <Recommendation summary={summary} />
    </Box>
  );
};

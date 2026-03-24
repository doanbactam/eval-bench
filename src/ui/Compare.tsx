import React, { useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { useTaskData } from "./hooks/useTaskData.js";
import { useFormat } from "./hooks/useFormat.js";
import { Header } from "./components/Header.js";
import type { CompareProps, SummaryRow } from "./types.js";

interface ModelStats {
  count: number;
  successCount: number;
  avgDuration: number;
  successRate: number;
}

function aggregateModel(rows: SummaryRow[]): ModelStats {
  const count = rows.reduce((sum, r) => sum + r.count, 0);
  const successCount = rows.reduce((sum, r) => sum + r.success_count, 0);
  const totalDuration = rows.reduce((sum, r) => sum + r.avg_duration * r.count, 0);
  const avgDuration = count > 0 ? totalDuration / count : 0;
  const successRate = count > 0 ? (successCount / count) * 100 : 0;

  return { count, successCount, avgDuration, successRate };
}

export const Compare: React.FC<CompareProps> = ({ model1, model2 }) => {
  const { summary, loading, refresh } = useTaskData();
  const { formatDuration, formatPercent, formatModelName } = useFormat();

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const m1Rows = summary.filter(
      (r) => r.model === model1 || r.model.includes(model1)
    );
    const m2Rows = summary.filter(
      (r) => r.model === model2 || r.model.includes(model2)
    );

    return {
      m1: aggregateModel(m1Rows),
      m2: aggregateModel(m2Rows),
      m1Found: m1Rows.length > 0,
      m2Found: m2Rows.length > 0,
    };
  }, [summary, model1, model2]);

  if (loading) {
    return (
      <Box paddingY={2}>
        <Text dimColor>Loading...</Text>
      </Box>
    );
  }

  if (!stats.m1Found && !stats.m2Found) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">
          No data found for "{model1}" or "{model2}"
        </Text>
      </Box>
    );
  }

  const canCompare = stats.m1.count >= 3 && stats.m2.count >= 3;
  const m1Better = stats.m1.successRate > stats.m2.successRate + 5;
  const m2Better = stats.m2.successRate > stats.m1.successRate + 5;

  return (
    <Box flexDirection="column" padding={1}>
      <Header title={`Comparing: ${model1} vs ${model2}`} />

      {/* Model 1 stats */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">
          {formatModelName(model1)}:
        </Text>
        <Box marginLeft={2}>
          <Text>Tasks: </Text>
          <Text bold>{stats.m1.count}</Text>
          <Text>  |  Success rate: </Text>
          <Text bold color="green">
            {formatPercent(stats.m1.successRate)}
          </Text>
          <Text>  |  Avg duration: </Text>
          <Text dimColor>{formatDuration(stats.m1.avgDuration)}</Text>
        </Box>
      </Box>

      {/* Model 2 stats */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">
          {formatModelName(model2)}:
        </Text>
        <Box marginLeft={2}>
          <Text>Tasks: </Text>
          <Text bold>{stats.m2.count}</Text>
          <Text>  |  Success rate: </Text>
          <Text bold color="green">
            {formatPercent(stats.m2.successRate)}
          </Text>
          <Text>  |  Avg duration: </Text>
          <Text dimColor>{formatDuration(stats.m2.avgDuration)}</Text>
        </Box>
      </Box>

      {/* Verdict */}
      <Box marginTop={1}>
        <Text bold>→ </Text>
        {canCompare ? (
          m1Better ? (
            <Text>
              <Text color="green">{formatModelName(model1)}</Text> performs
              better on your codebase
            </Text>
          ) : m2Better ? (
            <Text>
              <Text color="green">{formatModelName(model2)}</Text> performs
              better on your codebase
            </Text>
          ) : (
            <Text>Both models perform similarly on your codebase</Text>
          )
        ) : (
          <Text dimColor>
            Need more tasks for reliable comparison (min 3 each)
          </Text>
        )}
      </Box>
    </Box>
  );
};

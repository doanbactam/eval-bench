import React, { useMemo } from "react";
import { Box, Text } from "ink";
import type { SummaryRow, TaskTypeTableProps, TaskType } from "../types.js";
import { useFormat } from "../hooks/useFormat.js";
import { TASK_TYPES, TASK_TYPE_LABELS } from "../types.js";

interface BestModel {
  model: string;
  successRate: number;
  avgDuration: number;
  count: number;
  runnerUp?: {
    model: string;
    successRate: number;
  };
}

function getBestModelPerType(summary: SummaryRow[]): Map<string, BestModel> {
  const best = new Map<string, BestModel>();
  const byType = new Map<string, SummaryRow[]>();

  // Group by task type
  for (const row of summary) {
    if (!byType.has(row.task_type)) byType.set(row.task_type, []);
    byType.get(row.task_type)!.push(row);
  }

  // Find best for each type
  for (const [taskType, rows] of byType) {
    const sorted = [...rows].sort((a, b) => b.success_rate - a.success_rate);
    if (sorted.length > 0) {
      const bestRow = sorted[0];
      best.set(taskType, {
        model: bestRow.model,
        successRate: bestRow.success_rate,
        avgDuration: bestRow.avg_duration,
        count: bestRow.count,
        runnerUp:
          sorted.length > 1 && sorted[1].count >= 3
            ? {
                model: sorted[1].model,
                successRate: sorted[1].success_rate,
              }
            : undefined,
      });
    }
  }

  return best;
}

const COL_WIDTHS = {
  taskType: 16,
  model: 20,
  successRate: 18,
  avgTime: 12,
};

export const TaskTypeTable: React.FC<TaskTypeTableProps> = ({
  summary,
  showRunnerUp = true,
}) => {
  const { formatDuration, formatPercent, formatModelName } = useFormat();

  const bestByType = useMemo(() => getBestModelPerType(summary), [summary]);

  const getSuccessColor = (rate: number): string => {
    if (rate >= 80) return "green";
    if (rate >= 60) return "yellow";
    return "red";
  };

  const renderRow = (taskType: TaskType) => {
    const best = bestByType.get(taskType);
    if (!best) return null;

    const displayName = TASK_TYPE_LABELS[taskType];
    const hasEnoughData = best.count >= 3;

    // Build success rate display
    let rateDisplay = formatPercent(best.successRate);
    if (showRunnerUp && hasEnoughData && best.runnerUp) {
      const runnerUpShort = best.runnerUp.model.split("-").slice(-2).join("-");
      rateDisplay += ` vs ${formatPercent(best.runnerUp.successRate)} ${runnerUpShort}`;
    }

    return (
      <Box key={taskType}>
        <Box width={COL_WIDTHS.taskType}>
          <Text>{displayName}</Text>
        </Box>
        <Box width={COL_WIDTHS.model}>
          <Text color="green">{formatModelName(best.model)}</Text>
          {hasEnoughData && <Text color="yellow"> ✓</Text>}
        </Box>
        <Box width={COL_WIDTHS.successRate}>
          <Text color={getSuccessColor(best.successRate)}>{rateDisplay}</Text>
        </Box>
        <Box width={COL_WIDTHS.avgTime}>
          <Text dimColor>{formatDuration(best.avgDuration)}</Text>
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header row */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Box width={COL_WIDTHS.taskType}>
          <Text bold>Task Type</Text>
        </Box>
        <Box width={COL_WIDTHS.model}>
          <Text bold>Best Model</Text>
        </Box>
        <Box width={COL_WIDTHS.successRate}>
          <Text bold>Success Rate</Text>
        </Box>
        <Box width={COL_WIDTHS.avgTime}>
          <Text bold>Avg Time</Text>
        </Box>
      </Box>

      {/* Data rows */}
      {TASK_TYPES.map(renderRow)}
    </Box>
  );
};

import React, { useMemo } from "react";
import { Box, Text } from "ink";
import type { SummaryRow, RecommendationProps } from "../types.js";
import { useFormat } from "../hooks/useFormat.js";

interface BestModel {
  model: string;
  successRate: number;
  count: number;
}

function getBestOverall(summary: SummaryRow[]): BestModel | null {
  const byModel = new Map<string, { count: number; successCount: number }>();

  for (const row of summary) {
    const existing = byModel.get(row.model) || { count: 0, successCount: 0 };
    byModel.set(row.model, {
      count: existing.count + row.count,
      successCount: existing.successCount + row.success_count,
    });
  }

  let best: BestModel | null = null;
  for (const [model, stats] of byModel) {
    const successRate = stats.count > 0 ? (stats.successCount / stats.count) * 100 : 0;
    if (!best || successRate > best.successRate) {
      best = { model, successRate, count: stats.count };
    }
  }

  return best;
}

export const Recommendation: React.FC<RecommendationProps> = ({ summary }) => {
  const { formatPercent, formatModelName } = useFormat();

  const bestOverall = useMemo(() => getBestOverall(summary), [summary]);

  if (!bestOverall) {
    return (
      <Box marginTop={1}>
        <Text dimColor>Record more tasks to get personalized recommendations.</Text>
      </Box>
    );
  }

  if (bestOverall.count < 3) {
    return (
      <Box marginTop={1} flexDirection="column">
        <Text bold>Recommendation:</Text>
        <Text dimColor>
          Record at least 3 tasks for reliable recommendations.
        </Text>
      </Box>
    );
  }

  return (
    <Box marginTop={1} flexDirection="column">
      <Text bold>Recommendation:</Text>
      <Box>
        <Text color="green">{formatModelName(bestOverall.model)}</Text>
        <Text> has the highest success rate (</Text>
        <Text color="cyan">{formatPercent(bestOverall.successRate)}</Text>
        <Text>)</Text>
      </Box>
    </Box>
  );
};

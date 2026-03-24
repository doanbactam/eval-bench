import type { TaskRecord, SummaryRow, TaskType } from "../store.js";

// Re-export store types for convenience
export type { TaskRecord, SummaryRow, TaskType };

// Display names for task types
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  refactoring: "Refactoring",
  debugging: "Debugging",
  docs: "Documentation",
  new_feature: "New Feature",
  test: "Tests",
};

// Task types in display order
export const TASK_TYPES: TaskType[] = [
  "refactoring",
  "debugging",
  "new_feature",
  "test",
  "docs",
];

// Best model per task type
export interface BestModelByType {
  taskType: TaskType;
  model: string;
  successRate: number;
  avgDuration: number;
  count: number;
  runnerUp?: {
    model: string;
    successRate: number;
  };
}

// Props for components
export interface HeaderProps {
  title: string;
  subtitle?: string;
}

export interface TaskTypeTableProps {
  summary: SummaryRow[];
  showRunnerUp?: boolean;
}

export interface RecommendationProps {
  summary: SummaryRow[];
}

export interface EmptyStateProps {
  message?: string;
}

export interface CompareProps {
  model1: string;
  model2: string;
}

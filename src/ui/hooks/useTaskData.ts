import { useState, useCallback } from "react";
import { getAll, getSummary, TaskRecord, SummaryRow } from "../../store.js";

export function useTaskData() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      setTasks(getAll());
      setSummary(getSummary());
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    summary,
    loading,
    refresh,
  };
}

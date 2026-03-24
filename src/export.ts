import { getAll, type TaskRecord } from "./store.js";

export interface ExportData {
  exported_at: string;
  version: string;
  total_tasks: number;
  tasks: TaskRecord[];
}

export function exportToJson(): string {
  const tasks = getAll();
  const data: ExportData = {
    exported_at: new Date().toISOString(),
    version: "0.1.0",
    total_tasks: tasks.length,
    tasks: tasks,
  };
  return JSON.stringify(data, null, 2);
}

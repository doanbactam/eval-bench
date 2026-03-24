import { useCallback } from "react";

export function useFormat() {
  const formatDuration = useCallback((minutes: number): string => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`;
    }
    if (minutes < 60) {
      return `${minutes.toFixed(1)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }, []);

  const formatPercent = useCallback((value: number): string => {
    return `${Math.round(value)}%`;
  }, []);

  const formatTimestamp = useCallback((date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString();
  }, []);

  const formatRelativeTime = useCallback((date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, []);

  const formatModelName = useCallback((model: string): string => {
    // Shorten common model names for display
    return model
      .replace("claude-", "")
      .replace("-4-6", " 4.6")
      .replace("-4-5", " 4.5")
      .replace("gpt-4", "GPT-4")
      .replace("gpt-3.5", "GPT-3.5");
  }, []);

  return {
    formatDuration,
    formatPercent,
    formatTimestamp,
    formatRelativeTime,
    formatModelName,
  };
}

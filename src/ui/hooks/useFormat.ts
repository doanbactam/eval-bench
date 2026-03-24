import { useCallback } from "react";
import {
  formatDuration as _formatDuration,
  formatPercent as _formatPercent,
  formatTimestamp as _formatTimestamp,
  formatRelativeTime as _formatRelativeTime,
  formatModelName as _formatModelName,
} from "../utils/format.js";

// Re-export pure functions for testing
export {
  formatDuration,
  formatPercent,
  formatTimestamp,
  formatRelativeTime,
  formatModelName,
} from "../utils/format.js";

// React hook wrapper (for consistency with existing code)
export function useFormat() {
  const formatDuration = useCallback((minutes: number): string => {
    return _formatDuration(minutes);
  }, []);

  const formatPercent = useCallback((value: number): string => {
    return _formatPercent(value);
  }, []);

  const formatTimestamp = useCallback((date: Date | string): string => {
    return _formatTimestamp(date);
  }, []);

  const formatRelativeTime = useCallback((date: Date | string): string => {
    return _formatRelativeTime(date);
  }, []);

  const formatModelName = useCallback((model: string): string => {
    return _formatModelName(model);
  }, []);

  return {
    formatDuration,
    formatPercent,
    formatTimestamp,
    formatRelativeTime,
    formatModelName,
  };
}

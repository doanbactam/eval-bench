import { describe, test, expect } from "bun:test";
import {
  formatDuration,
  formatPercent,
  formatTimestamp,
  formatRelativeTime,
  formatModelName,
} from "./format.js";

describe("format utilities", () => {
  describe("formatDuration", () => {
    test("formats seconds for values under 1 minute", () => {
      expect(formatDuration(0.5)).toBe("30s");
      expect(formatDuration(0.1)).toBe("6s");
      expect(formatDuration(0.0167)).toBe("1s");
    });

    test("formats minutes for values under 1 hour", () => {
      expect(formatDuration(1)).toBe("1.0 min");
      expect(formatDuration(5.5)).toBe("5.5 min");
      expect(formatDuration(30)).toBe("30.0 min");
    });

    test("formats hours and minutes for values >= 1 hour", () => {
      expect(formatDuration(60)).toBe("1h 0m");
      expect(formatDuration(90)).toBe("1h 30m");
      expect(formatDuration(125)).toBe("2h 5m");
    });
  });

  describe("formatPercent", () => {
    test("formats percentage with rounding", () => {
      expect(formatPercent(84.4)).toBe("84%");
      expect(formatPercent(84.5)).toBe("85%");
      expect(formatPercent(100)).toBe("100%");
      expect(formatPercent(0)).toBe("0%");
    });
  });

  describe("formatTimestamp", () => {
    test("formats Date object", () => {
      const date = new Date("2024-01-15T10:30:00");
      const result = formatTimestamp(date);
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}\s*(AM|PM)?/i);
    });

    test("formats ISO string", () => {
      const result = formatTimestamp("2024-01-15T10:30:00");
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}\s*(AM|PM)?/i);
    });
  });

  describe("formatRelativeTime", () => {
    test("returns 'just now' for under 1 minute", () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe("just now");
    });

    test("returns minutes ago for under 1 hour", () => {
      const date = new Date(Date.now() - 30 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe("30m ago");
    });

    test("returns hours ago for under 24 hours", () => {
      const date = new Date(Date.now() - 5 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe("5h ago");
    });

    test("returns days ago for >= 24 hours", () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe("3d ago");
    });
  });

  describe("formatModelName", () => {
    test("shortens Claude model names", () => {
      expect(formatModelName("claude-sonnet-4-6")).toBe("sonnet 4.6");
      expect(formatModelName("claude-opus-4-5")).toBe("opus 4.5");
      expect(formatModelName("claude-haiku-4-6")).toBe("haiku 4.6");
    });

    test("formats GPT model names", () => {
      expect(formatModelName("gpt-4")).toBe("GPT-4");
      expect(formatModelName("gpt-3.5-turbo")).toBe("GPT-3.5-turbo");
    });

    test("returns unchanged for unknown formats", () => {
      expect(formatModelName("unknown-model")).toBe("unknown-model");
    });
  });
});

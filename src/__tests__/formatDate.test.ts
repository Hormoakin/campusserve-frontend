import { describe, it, expect } from "vitest";
import { formatDate, formatRelative } from "../utils/formatDate";

describe("formatDate", () => {
  it("formats ISO string to readable date", () => {
    const result = formatDate("2026-07-01T08:00:00.000Z");
    expect(result).toMatch(/01 Jul 2026/);
  });
});

describe("formatRelative", () => {
  it("returns a relative time string", () => {
    const recent = new Date(Date.now() - 60_000).toISOString();
    const result = formatRelative(recent);
    expect(result).toMatch(/ago/);
  });
});

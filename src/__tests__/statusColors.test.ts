import { describe, it, expect } from "vitest";
import { statusStyles, statusLabels, priorityStyles } from "../utils/statusColors";

describe("statusStyles", () => {
  it("has an entry for every status", () => {
    const statuses = ["pending","assigned","in_progress","completed","rejected","cancelled"];
    statuses.forEach(s => {
      expect(statusStyles[s as keyof typeof statusStyles]).toBeDefined();
    });
  });
});

describe("statusLabels", () => {
  it("returns In Progress for in_progress", () => {
    expect(statusLabels["in_progress"]).toBe("In Progress");
  });
  it("returns Completed for completed", () => {
    expect(statusLabels["completed"]).toBe("Completed");
  });
});

describe("priorityStyles", () => {
  it("has an entry for every priority", () => {
    ["low","medium","high","urgent"].forEach(p => {
      expect(priorityStyles[p as keyof typeof priorityStyles]).toBeDefined();
    });
  });
});

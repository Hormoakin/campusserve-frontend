import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { statusLabels } from "../utils/statusColors";
import type { RequestStatus } from "../types";

const StatusBadge = ({ status }: { status: RequestStatus }) => (
  <span>{statusLabels[status]}</span>
);

describe("StatusBadge", () => {
  const statuses: RequestStatus[] = [
    "pending","assigned","in_progress","completed","rejected","cancelled",
  ];
  statuses.forEach(s => {
    it(`renders label for status: ${s}`, () => {
      render(<StatusBadge status={s} />);
      expect(screen.getByText(statusLabels[s])).toBeInTheDocument();
    });
  });
});

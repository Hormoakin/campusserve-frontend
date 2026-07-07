import type { RequestStatus, RequestPriority } from "../types";
export const statusStyles: Record<RequestStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 border border-yellow-200",
  assigned:    "bg-blue-100   text-blue-800   border border-blue-200",
  in_progress: "bg-orange-100 text-orange-800 border border-orange-200",
  completed:   "bg-green-100  text-green-800  border border-green-200",
  rejected:    "bg-red-100    text-red-800    border border-red-200",
  cancelled:   "bg-gray-100   text-gray-600   border border-gray-200",
};
export const statusLabels: Record<RequestStatus, string> = {
  pending: "Pending", assigned: "Assigned", in_progress: "In Progress",
  completed: "Completed", rejected: "Rejected", cancelled: "Cancelled",
};
export const priorityStyles: Record<RequestPriority, string> = {
  low: "bg-green-100 text-green-800", medium: "bg-blue-100 text-blue-800",
  high: "bg-yellow-100 text-yellow-800", urgent: "bg-red-100 text-red-800",
};

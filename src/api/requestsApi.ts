import api from "./api";
import type { ServiceRequest, PaginatedResponse, RequestStats } from "../types";
export const requestsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<ServiceRequest>>("/requests/", { params }),
  get: (id: string) => api.get<ServiceRequest>(`/requests/${id}/`),
  create: (data: FormData) =>
    api.post<ServiceRequest>("/requests/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateStatus: (id: string, status: string, comment: string) =>
    api.post(`/requests/${id}/update_status/`, { status, comment }),
  assign: (id: string, officerId: string, notes?: string, expectedDate?: string) =>
    api.post(`/requests/${id}/assign/`, {
      officer_id: officerId, notes, expected_completion_date: expectedDate,
    }),
  stats: () => api.get<RequestStats>("/requests/stats/"),
  exportCsv: () => api.get("/requests/export_csv/", { responseType: "blob" }),
};

import api from "./api";
import type { Notification, PaginatedResponse } from "../types";
export const notificationsApi = {
  list: () => api.get<PaginatedResponse<Notification>>("/notifications/"),
  unreadCount: () => api.get<{ count: number }>("/notifications/unread_count/"),
  markAllRead: () => api.post("/notifications/mark_all_read/"),
  markRead: (id: string) => api.patch(`/notifications/${id}/`, { is_read: true }),
  delete: (id: string) => api.delete(`/notifications/${id}/`),
};

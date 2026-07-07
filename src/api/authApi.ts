import api from "./api";
import type { AuthTokens, User, UserStats } from "../types";
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>("/auth/login/", { email, password }),
  register: (data: {
    email: string; first_name: string; last_name: string;
    phone?: string; department?: string; role_id: number;
    password: string; confirm_password: string;
  }) => api.post("/auth/register/", data),
  me: () => api.get<User>("/users/me/"),
  maintenanceOfficers: () => api.get<User[]>("/users/maintenance_officers/"),
  userStats: () => api.get<UserStats>("/users/stats/"),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle_active/`),
  listUsers: (params?: Record<string, string | number>) =>
    api.get<{ results: User[]; count: number }>("/users/", { params }),
  categories: () => api.get("/categories/"),
};

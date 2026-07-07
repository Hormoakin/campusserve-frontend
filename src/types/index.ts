export interface Role {
  id: number;
  name: "student" | "staff" | "maintenance_officer" | "admin";
  description: string;
}
export interface User {
  id: string; email: string; first_name: string; last_name: string;
  full_name: string; phone: string; role: Role; department: string;
  is_active: boolean; date_joined: string;
}
export interface RequestCategory {
  id: number; name: string; description: string; icon: string; is_active: boolean;
}
export type RequestStatus = "pending"|"assigned"|"in_progress"|"completed"|"rejected"|"cancelled";
export type RequestPriority = "low"|"medium"|"high"|"urgent";
export interface StatusLog {
  id: string; old_status: RequestStatus; new_status: RequestStatus;
  comment: string; updated_by: User; created_at: string;
}
export interface Assignment {
  id: string; officer: User; assigned_by: User; assigned_at: string;
  notes: string; expected_completion_date: string | null;
}
export interface ServiceRequest {
  id: string; reference_number: string; title: string; description: string;
  category: RequestCategory; requester: User; location: string;
  building: string; room_number: string; priority: RequestPriority;
  status: RequestStatus; evidence_image: string | null; admin_notes: string;
  assignment: Assignment | null; status_logs: StatusLog[];
  created_at: string; updated_at: string;
}
export interface PaginatedResponse<T> {
  count: number; next: string | null; previous: string | null; results: T[];
}
export interface Notification {
  id: string; title: string; message: string;
  notification_type: "info"|"success"|"warning"|"error";
  is_read: boolean; reference_id: string | null; created_at: string;
}
export interface AuthTokens { access: string; refresh: string; user: User; }
export interface RequestStats {
  total: number; pending: number; assigned: number; in_progress: number;
  completed: number; rejected: number;
  by_category: Array<{ category__name: string; count: number }>;
  by_priority: Array<{ priority: string; count: number }>;
}
export interface UserStats {
  total: number; students: number; staff: number;
  officers: number; admins: number; active: number; inactive: number;
}

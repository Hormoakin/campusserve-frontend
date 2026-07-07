import { useState } from "react";
import { Bell, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../api/notificationsApi";
import { useAuth } from "../../context/AuthContext";
import { formatRelative } from "../../utils/formatDate";
import type { Notification } from "../../types";
export default function Navbar() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: countData } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationsApi.unreadCount().then(r => r.data),
    refetchInterval: 30_000,
  });
  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then(r => r.data),
    enabled: open,
  });
  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const notifications: Notification[] = notifData?.results ?? [];
  const unread = countData?.count ?? 0;
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 relative z-10">
      <div />
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setOpen(o => !o)}
            className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-sm text-gray-800">
                  Notifications {unread > 0 && <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                </span>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={() => markAllRead.mutate()} className="text-xs text-secondary hover:underline flex items-center gap-1">
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-blue-50/40" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? "bg-gray-300" : "bg-blue-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelative(n.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.first_name}</span>
        </div>
      </div>
    </header>
  );
}

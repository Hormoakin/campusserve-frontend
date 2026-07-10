import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { requestsApi } from "../../api/requestsApi";
import { useAuth } from "../../context/AuthContext";
import { statusStyles, statusLabels } from "../../utils/statusColors";
import { formatRelative } from "../../utils/formatDate";
import { ClipboardList, Clock, Loader2, CheckCircle } from "lucide-react";
import type { RequestStatus } from "../../types";

export default function OfficerDashboard() {
  const { user } = useAuth();
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => requestsApi.stats().then(r => r.data) });
  const { data: recent } = useQuery({
    queryKey: ["requests","officer-recent"],
    queryFn: () => requestsApi.list({ page: 1, page_size: 5, status: "assigned" }).then(r => r.data),
  });

  const cards = [
    { label: "Assigned to Me", value: stats?.assigned ?? 0, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "In Progress", value: stats?.in_progress ?? 0, icon: Loader2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Pending (Unassigned)", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.first_name}!</h1>
        <p className="text-gray-500 text-sm mt-1">Maintenance Officer Dashboard</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recently Assigned to You</h2>
          <Link to="/officer/requests" className="text-sm text-secondary hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent?.results.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No assigned requests yet.</div>
          ) : (
            recent?.results.map(req => (
              <div key={req.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{req.reference_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status as RequestStatus]}`}>
                      {statusLabels[req.status as RequestStatus]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{req.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{req.location} · {formatRelative(req.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { requestsApi } from "../../api/requestsApi";
import { useAuth } from "../../context/AuthContext";
import { statusStyles, statusLabels } from "../../utils/statusColors";
import { formatRelative } from "../../utils/formatDate";
import { PlusCircle, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { RequestStatus } from "../../types";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["stats"], queryFn: () => requestsApi.stats().then(r => r.data) });
  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["requests", { page: 1, page_size: 5 }],
    queryFn: () => requestsApi.list({ page: 1, page_size: 5 }).then(r => r.data),
  });

  const statCards = [
    { label: "Total Submitted", value: stats?.total ?? 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "In Progress", value: (stats?.assigned ?? 0) + (stats?.in_progress ?? 0), icon: Loader2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.first_name}!</h1>
          <p className="text-gray-500 text-sm mt-1">Here's an overview of your maintenance requests.</p>
        </div>
        <Link to="/student/new-request" className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <PlusCircle size={16} />New Request
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{statsLoading ? "..." : card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Requests</h2>
          <Link to="/student/requests" className="text-sm text-secondary hover:underline font-medium">View all</Link>
        </div>
        {recentLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : recent?.results.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No requests yet.</p>
            <Link to="/student/new-request" className="text-secondary text-sm hover:underline mt-1 inline-block">Submit your first request →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent?.results.map(req => (
              <div key={req.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{req.reference_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status as RequestStatus]}`}>
                      {statusLabels[req.status as RequestStatus]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{req.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{req.category.name} · {formatRelative(req.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

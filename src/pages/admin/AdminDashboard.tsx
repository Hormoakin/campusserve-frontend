import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { requestsApi } from "../../api/requestsApi";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { statusStyles, statusLabels } from "../../utils/statusColors";
import { formatRelative } from "../../utils/formatDate";
import { FileText, Clock, Loader2, CheckCircle, XCircle, Users, AlertCircle } from "lucide-react";
import type { RequestStatus } from "../../types";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => requestsApi.stats().then(r => r.data) });
  const { data: userStats } = useQuery({ queryKey: ["userStats"], queryFn: () => authApi.userStats().then(r => r.data) });
  const { data: recent } = useQuery({
    queryKey: ["requests","admin-recent"],
    queryFn: () => requestsApi.list({ page: 1, page_size: 6, status: "pending" }).then(r => r.data),
  });

  const requestCards = [
    { label: "Total", value: stats?.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: stats?.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "In Progress", value: stats?.in_progress, icon: Loader2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed", value: stats?.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Rejected", value: stats?.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Total Users", value: userStats?.total, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.first_name}. Here's your system overview.</p>
        </div>
        <Link to="/admin/requests" className="bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">View All Requests</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {requestCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value ?? "..."}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Pending — Needs Assignment</h2>
            <Link to="/admin/requests" className="text-sm text-secondary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent?.results.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No pending requests 🎉</div>
            ) : (
              recent?.results.map(req => (
                <Link key={req.id} to={`/admin/requests/${req.id}`}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{req.title}</p>
                    <p className="text-xs text-gray-400">{req.reference_number} · {formatRelative(req.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusStyles[req.status as RequestStatus]}`}>
                    {statusLabels[req.status as RequestStatus]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Requests by Category</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {stats?.by_category?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
            ) : (
              stats?.by_category?.slice(0, 7).map(item => {
                const max = stats.by_category[0]?.count ?? 1;
                const pct = Math.round((item.count / max) * 100);
                return (
                  <div key={item.category__name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.category__name}</span>
                      <span className="font-medium text-gray-800">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

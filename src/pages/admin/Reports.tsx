import { useQuery } from "@tanstack/react-query";
import { requestsApi } from "../../api/requestsApi";
import { authApi } from "../../api/authApi";
import { Download, FileText, Users, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Reports() {
  const [exporting, setExporting] = useState(false);
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => requestsApi.stats().then(r => r.data) });
  const { data: userStats } = useQuery({ queryKey: ["userStats"], queryFn: () => authApi.userStats().then(r => r.data) });

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await requestsApi.exportCsv();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `campusserve_report_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported successfully!");
    } catch { toast.error("Export failed."); }
    finally { setExporting(false); }
  };

  const completionRate = stats?.total ? Math.round(((stats.completed ?? 0) / stats.total) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">System analytics and data export</p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
          <Download size={15} />{exporting ? "Exporting..." : "Export CSV Report"}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Requests", value: stats?.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: stats?.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Total Users", value: userStats?.total, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(card => (
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
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Requests by Status</h3>
          <div className="space-y-3">
            {[
              { label: "Pending", value: stats?.pending, color: "bg-yellow-400" },
              { label: "Assigned", value: stats?.assigned, color: "bg-blue-400" },
              { label: "In Progress", value: stats?.in_progress, color: "bg-orange-400" },
              { label: "Completed", value: stats?.completed, color: "bg-green-400" },
              { label: "Rejected", value: stats?.rejected, color: "bg-red-400" },
            ].map(item => {
              const pct = stats?.total ? Math.round(((item.value ?? 0) / stats.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-800">{item.value ?? 0} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Requests by Category</h3>
          <div className="space-y-3">
            {stats?.by_category?.map(item => {
              const max = stats.by_category[0]?.count ?? 1;
              const pct = Math.round((item.count / max) * 100);
              return (
                <div key={item.category__name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.category__name}</span>
                    <span className="font-medium text-gray-800">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

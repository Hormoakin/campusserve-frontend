import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { requestsApi } from "../../api/requestsApi";
import { statusStyles, statusLabels } from "../../utils/statusColors";
import { formatDate } from "../../utils/formatDate";
import { Search, Download, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { RequestStatus, RequestPriority } from "../../types";

const priorityStyles: Record<RequestPriority, string> = {
  low: "bg-green-100 text-green-700", medium: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-700", urgent: "bg-red-100 text-red-700",
};

export default function AllRequests() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["all-requests", { search, status, priority, page }],
    queryFn: () => requestsApi.list({
      ...(search && { search }), ...(status && { status }),
      ...(priority && { priority }), page, page_size: 10,
    }).then(r => r.data),
  });

  const totalPages = data ? Math.ceil(data.count / 10) : 1;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await requestsApi.exportCsv();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `campusserve_requests_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully!");
    } catch { toast.error("Export failed."); }
    finally { setExporting(false); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.count ?? 0} total request{data?.count !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
          <Download size={15} />{exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, reference, location..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Reference","Title","Category","Requester","Priority","Status","Submitted","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : data?.results.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <AlertCircle size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No requests found</p>
                </td></tr>
              ) : (
                data?.results.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{req.reference_number}</td>
                    <td className="px-4 py-3 max-w-48"><p className="font-medium text-gray-800 truncate">{req.title}</p></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{req.category.name}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{req.requester.full_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[req.priority as RequestPriority]}`}>{req.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status as RequestStatus]}`}>
                        {statusLabels[req.status as RequestStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{formatDate(req.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/requests/${req.id}`} className="text-secondary hover:underline text-xs font-medium">Manage →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Page {page} of {totalPages} ({data?.count} total)</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-white transition-colors">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-white transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

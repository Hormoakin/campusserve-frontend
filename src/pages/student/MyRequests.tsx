import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { requestsApi } from "../../api/requestsApi";
import { statusStyles, statusLabels } from "../../utils/statusColors";
import { formatDate, formatRelative } from "../../utils/formatDate";
import { Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { RequestStatus, RequestPriority } from "../../types";

const priorityStyles: Record<RequestPriority, string> = {
  low: "bg-green-100 text-green-700", medium: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-700", urgent: "bg-red-100 text-red-700",
};

export default function MyRequests() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["requests", { search, status, priority, page }],
    queryFn: () => requestsApi.list({
      ...(search && { search }), ...(status && { status }),
      ...(priority && { priority }), page, page_size: 8,
    }).then(r => r.data),
  });

  const totalPages = data ? Math.ceil(data.count / 8) : 1;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.count ?? 0} total request{data?.count !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/student/new-request" className="bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">+ New Request</Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search requests..."
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
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : data?.results.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No requests found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.results.map(req => (
              <div key={req.id}>
                <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{req.reference_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status as RequestStatus]}`}>
                        {statusLabels[req.status as RequestStatus]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[req.priority as RequestPriority]}`}>
                        {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{req.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{req.category.name} · {req.location} · {formatRelative(req.created_at)}</p>
                  </div>
                  <div className="text-gray-400 flex-shrink-0">
                    {expanded === req.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                {expanded === req.id && (
                  <div className="px-6 pb-5 bg-gray-50 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request Details</h4>
                        <p className="text-sm text-gray-700 mb-4">{req.description}</p>
                        <div className="space-y-1.5 text-sm">
                          {[["Location", req.location], ["Building", req.building], ["Room", req.room_number], ["Submitted", formatDate(req.created_at)], ["Assigned to", req.assignment?.officer.full_name]].filter(([,v]) => v).map(([k,v]) => (
                            <div key={k as string} className="flex gap-2">
                              <span className="text-gray-400 w-24 flex-shrink-0">{k as string}</span>
                              <span className="text-gray-700">{v as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Activity Log</h4>
                        {req.status_logs.length === 0 ? (
                          <p className="text-sm text-gray-400">No activity yet.</p>
                        ) : (
                          <div className="relative pl-5">
                            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gray-200" />
                            {req.status_logs.map(log => (
                              <div key={log.id} className="relative mb-4">
                                <div className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
                                <p className="text-xs font-semibold text-gray-700">
                                  {log.old_status ? `${log.old_status.replace("_"," ")} → ${log.new_status.replace("_"," ")}` : `Submitted as ${log.new_status}`}
                                </p>
                                {log.comment && <p className="text-xs text-gray-500 mt-0.5">{log.comment}</p>}
                                <p className="text-xs text-gray-400 mt-0.5">{log.updated_by.full_name} · {formatRelative(log.created_at)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
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

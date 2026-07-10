import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../../api/requestsApi";
import { statusStyles, statusLabels } from "../../utils/statusColors";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import type { RequestStatus } from "../../types";

export default function AssignedRequests() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [statusSel, setStatusSel] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["officer-requests"],
    queryFn: () => requestsApi.list({ page_size: 50 }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, cmt }: { id: string; status: string; cmt: string }) =>
      requestsApi.updateStatus(id, status, cmt),
    onSuccess: () => {
      toast.success("Status updated successfully!");
      qc.invalidateQueries({ queryKey: ["officer-requests"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || "Failed to update status."),
  });

  const getTransitions = (status: string) => {
    if (status === "assigned") return [{ value: "in_progress", label: "Start Work (In Progress)" }];
    if (status === "in_progress") return [{ value: "completed", label: "Mark as Completed" }];
    return [];
  };

  const requests = data?.results ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assigned Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{requests.length} request{requests.length !== 1 ? "s" : ""} in your queue</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No requests assigned yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map(req => {
              const transitions = getTransitions(req.status);
              return (
                <div key={req.id}>
                  <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{req.reference_number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status as RequestStatus]}`}>
                          {statusLabels[req.status as RequestStatus]}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{req.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{req.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{req.category.name} · {req.location}</p>
                    </div>
                    {expanded === req.id ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </div>
                  {expanded === req.id && (
                    <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-6 pt-4">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Details</h4>
                          <p className="text-sm text-gray-700 mb-4">{req.description}</p>
                          <div className="space-y-1.5 text-sm">
                            {[["Submitted by", req.requester.full_name], ["Location", req.location], ["Building", req.building], ["Room", req.room_number], ["Date", formatDate(req.created_at)]].filter(([,v]) => v).map(([k,v]) => (
                              <div key={k as string} className="flex gap-2">
                                <span className="text-gray-400 w-28 flex-shrink-0">{k as string}</span>
                                <span className="text-gray-700">{v as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {transitions.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Update Status</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New status</label>
                                <select value={statusSel[req.id] ?? ""} onChange={e => setStatusSel(s => ({ ...s, [req.id]: e.target.value }))}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
                                  <option value="">Select new status...</option>
                                  {transitions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
                                <textarea rows={3} value={comment[req.id] ?? ""} onChange={e => setComment(c => ({ ...c, [req.id]: e.target.value }))}
                                  placeholder="Add a note about the work done..."
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary" />
                              </div>
                              <button disabled={!statusSel[req.id] || updateStatus.isPending}
                                onClick={() => updateStatus.mutate({ id: req.id, status: statusSel[req.id], cmt: comment[req.id] ?? "" })}
                                className="w-full bg-primary hover:bg-primary-light text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {updateStatus.isPending ? "Updating..." : "Update Status"}
                              </button>
                            </div>
                          </div>
                        )}
                        {transitions.length === 0 && (
                          <div className="flex items-center justify-center text-sm text-gray-400 italic">
                            This request is {req.status.replace("_"," ")} — no further updates required.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

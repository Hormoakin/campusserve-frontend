import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../../api/requestsApi";
import { authApi } from "../../api/authApi";
import { statusStyles, statusLabels } from "../../utils/statusColors";
import { formatDate, formatRelative } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import type { RequestStatus, RequestPriority } from "../../types";

const priorityStyles: Record<RequestPriority, string> = {
  low: "bg-green-100 text-green-700", medium: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-700", urgent: "bg-red-100 text-red-700",
};

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [officerId, setOfficerId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [expDate, setExpDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");

  const { data: req, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => requestsApi.get(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: officers } = useQuery({
    queryKey: ["officers"],
    queryFn: () => authApi.maintenanceOfficers().then(r => r.data),
  });

  const assignMutation = useMutation({
    mutationFn: () => requestsApi.assign(id!, officerId, assignNotes, expDate),
    onSuccess: () => {
      toast.success("Request assigned successfully!");
      qc.invalidateQueries({ queryKey: ["request", id] });
      qc.invalidateQueries({ queryKey: ["all-requests"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || "Assignment failed."),
  });

  const statusMutation = useMutation({
    mutationFn: () => requestsApi.updateStatus(id!, newStatus, statusComment),
    onSuccess: () => {
      toast.success("Status updated!");
      qc.invalidateQueries({ queryKey: ["request", id] });
      qc.invalidateQueries({ queryKey: ["all-requests"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      setNewStatus(""); setStatusComment("");
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || "Status update failed."),
  });

  const adminTransitions: Record<string, string[]> = {
    pending: ["rejected"], assigned: ["in_progress","rejected"], in_progress: ["completed","rejected"],
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary";

  if (isLoading) return <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>;
  if (!req) return <div className="p-6 text-center text-gray-400 text-sm">Request not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/admin/requests" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-5 transition-colors">
        <ArrowLeft size={15} />Back to all requests
      </Link>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-sm text-gray-400">{req.reference_number}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status as RequestStatus]}`}>{statusLabels[req.status as RequestStatus]}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[req.priority as RequestPriority]}`}>{req.priority} priority</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">{req.title}</h1>
          <p className="text-sm text-gray-400 mt-1">Submitted by {req.requester.full_name} · {formatRelative(req.created_at)}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
              {[["Category", req.category.name], ["Location", req.location], ["Building", req.building], ["Room", req.room_number], ["Requester", req.requester.full_name], ["Dept", req.requester.department], ["Submitted", formatDate(req.created_at)], ["Updated", formatDate(req.updated_at)]].filter(([,v]) => v).map(([k,v]) => (
                <div key={k as string} className="flex gap-2">
                  <span className="text-gray-400 w-24 flex-shrink-0">{k as string}</span>
                  <span className="text-gray-700">{v as string}</span>
                </div>
              ))}
            </div>
            {req.assignment && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assignment</p>
                <p className="text-sm text-gray-700">Assigned to <span className="font-medium">{req.assignment.officer.full_name}</span> by {req.assignment.assigned_by.full_name}</p>
                {req.assignment.notes && <p className="text-sm text-gray-500 mt-1">{req.assignment.notes}</p>}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity Log</h3>
            {req.status_logs.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              <div className="relative pl-5">
                <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gray-200" />
                {req.status_logs.map(log => (
                  <div key={log.id} className="relative mb-5">
                    <div className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
                    <p className="text-sm font-semibold text-gray-700">
                      {log.old_status ? `${log.old_status.replace("_"," ")} → ${log.new_status.replace("_"," ")}` : `Submitted (${log.new_status})`}
                    </p>
                    {log.comment && <p className="text-sm text-gray-500 mt-0.5">{log.comment}</p>}
                    <p className="text-xs text-gray-400 mt-1">{log.updated_by.full_name} · {formatRelative(log.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {!["completed","rejected","cancelled"].includes(req.status) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">{req.assignment ? "Reassign Officer" : "Assign Officer"}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Maintenance Officer *</label>
                  <select value={officerId} onChange={e => setOfficerId(e.target.value)} className={inputCls}>
                    <option value="">Select officer...</option>
                    {officers?.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Expected completion</label>
                  <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes for officer</label>
                  <textarea rows={2} value={assignNotes} onChange={e => setAssignNotes(e.target.value)} placeholder="Special instructions..." className={inputCls} />
                </div>
                <button disabled={!officerId || assignMutation.isPending} onClick={() => assignMutation.mutate()}
                  className="w-full bg-primary hover:bg-primary-light text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {assignMutation.isPending ? "Assigning..." : "Assign Officer"}
                </button>
              </div>
            </div>
          )}
          {adminTransitions[req.status] && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">New status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={inputCls}>
                    <option value="">Select status...</option>
                    {adminTransitions[req.status].map(s => <option key={s} value={s}>{statusLabels[s as RequestStatus]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Comment</label>
                  <textarea rows={2} value={statusComment} onChange={e => setStatusComment(e.target.value)} placeholder="Reason for status change..." className={inputCls} />
                </div>
                <button disabled={!newStatus || statusMutation.isPending} onClick={() => statusMutation.mutate()}
                  className="w-full bg-secondary hover:bg-secondary-dark text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {statusMutation.isPending ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

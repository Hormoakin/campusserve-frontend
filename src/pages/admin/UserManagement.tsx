import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/authApi";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { Search, UserCheck, UserX } from "lucide-react";

const roleColors: Record<string, string> = {
  student: "bg-blue-100 text-blue-700",
  staff: "bg-purple-100 text-purple-700",
  maintenance_officer: "bg-orange-100 text-orange-700",
  admin: "bg-red-100 text-red-700",
};

export default function UserManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["users", { search, role, page }],
    queryFn: () =>
      authApi.listUsers({
        ...(search && { search }),
        ...(role && { role__name: role }),
        page, page_size: 10,
      }).then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => authApi.userStats().then(r => r.data),
  });

  const toggleActive = useMutation({
    mutationFn: (id: string) => authApi.toggleActive(id),
    onSuccess: () => {
      toast.success("User status updated.");
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["userStats"] });
    },
    onError: () => toast.error("Failed to update user."),
  });

  const users = (data as any)?.results ?? [];
  const count = (data as any)?.count ?? 0;
  const totalPages = Math.ceil(count / 10) || 1;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">{count} total users</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Students", stats?.students, "bg-blue-50 text-blue-700"],
          ["Staff", stats?.staff, "bg-purple-50 text-purple-700"],
          ["Officers", stats?.officers, "bg-orange-50 text-orange-700"],
          ["Admins", stats?.admins, "bg-red-50 text-red-700"],
        ].map(([label, val, cls]) => (
          <div key={label as string} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className={`text-2xl font-bold ${(cls as string).split(" ")[1]}`}>{val ?? "..."}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label as string}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="maintenance_officer">Maintenance Officer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Name","Email","Role","Department","Joined","Status","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-400 text-sm">No users found.</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role?.name] ?? "bg-gray-100 text-gray-600"}`}>
                        {u.role?.name?.replace("_", " ") ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.department || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(u.date_joined)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive.mutate(u.id)} disabled={toggleActive.isPending}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                        {u.is_active ? <><UserX size={12} />Deactivate</> : <><UserCheck size={12} />Activate</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

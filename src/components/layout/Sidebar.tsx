import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, FileText, PlusCircle, Users, BarChart2, ClipboardList, LogOut } from "lucide-react";
const studentLinks = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/requests", label: "My Requests", icon: FileText },
  { to: "/student/new-request", label: "New Request", icon: PlusCircle },
];
const officerLinks = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/officer/requests", label: "Assigned Requests", icon: ClipboardList },
];
const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/requests", label: "All Requests", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: BarChart2 },
];
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.name;
  const links = role === "admin" ? adminLinks : role === "maintenance_officer" ? officerLinks : studentLinks;
  const roleLabel = role === "admin" ? "Administrator" : role === "maintenance_officer" ? "Maintenance Officer" : role === "staff" ? "Staff" : "Student";
  return (
    <aside className="w-64 bg-primary flex flex-col h-screen flex-shrink-0">
      <div className="px-6 py-5 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight">CampusServe</h2>
        <p className="text-white/50 text-xs mt-0.5">Smart Campus Maintenance</p>
      </div>
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-white/50 text-xs truncate">{roleLabel}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-white/20 text-white font-medium" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors w-full">
          <LogOut size={18} />Sign out
        </button>
      </div>
    </aside>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import NewRequest from "./pages/student/NewRequest";
import MyRequests from "./pages/student/MyRequests";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import AssignedRequests from "./pages/officer/AssignedRequests";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllRequests from "./pages/admin/AllRequests";
import RequestDetail from "./pages/admin/RequestDetail";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="text-primary font-medium">Loading...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role?.name)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();
  const role = user?.role?.name;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "maintenance_officer") return <Navigate to="/officer/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route element={<ProtectedRoute roles={["student","staff"]}><Layout /></ProtectedRoute>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/requests" element={<MyRequests />} />
              <Route path="/student/new-request" element={<NewRequest />} />
            </Route>
            <Route element={<ProtectedRoute roles={["maintenance_officer"]}><Layout /></ProtectedRoute>}>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/officer/requests" element={<AssignedRequests />} />
            </Route>
            <Route element={<ProtectedRoute roles={["admin"]}><Layout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/requests" element={<AllRequests />} />
              <Route path="/admin/requests/:id" element={<RequestDetail />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

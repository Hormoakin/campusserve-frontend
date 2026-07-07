import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
const schema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  department: z.string().optional(),
  role_id: z.string().min(1, "Please select a role"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine(d => d.password === d.confirm_password, { message: "Passwords do not match", path: ["confirm_password"] });
type FormData = z.infer<typeof schema>;
const ROLES = [{ id: 1, label: "Student" }, { id: 2, label: "Staff" }];
export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({ ...data, role_id: Number(data.role_id) });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.email?.[0] || err?.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(msg);
    }
  };
  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${hasError ? "border-red-400 bg-red-50" : "border-gray-300"}`;
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="mb-6"><h1 className="text-2xl font-bold text-primary">CampusServe</h1><p className="text-gray-500 text-sm mt-1">Create your account</p></div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First name *</label>
              <input {...register("first_name")} placeholder="Ahmed" className={inputClass(!!errors.first_name)} />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name *</label>
              <input {...register("last_name")} placeholder="Salman" className={inputClass(!!errors.last_name)} />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address *</label>
            <input {...register("email")} type="email" placeholder="you@university.edu" className={inputClass(!!errors.email)} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input {...register("phone")} placeholder="+234 800 000 0000" className={inputClass(false)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <input {...register("department")} placeholder="e.g. Engineering" className={inputClass(false)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Register as *</label>
            <select {...register("role_id")} className={inputClass(!!errors.role_id)}>
              <option value="">Select your role...</option>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Maintenance Officer and Admin accounts are created by the system administrator.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
            <input {...register("password")} type="password" placeholder="Min. 8 characters" className={inputClass(!!errors.password)} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password *</label>
            <input {...register("confirm_password")} type="password" placeholder="Re-enter your password" className={inputClass(!!errors.confirm_password)} />
            {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-light text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</> : <><UserPlus size={16} />Create account</>}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">Already have an account?{" "}<Link to="/login" className="text-secondary font-medium hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}

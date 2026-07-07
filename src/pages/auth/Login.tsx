import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock } from "lucide-react";
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid email or password. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-primary flex">
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-16">
        <h1 className="text-5xl font-bold text-white mb-4">CampusServe</h1>
        <p className="text-white/70 text-xl mb-8">Smart Campus Maintenance,<br />One Click Away.</p>
        {["Submit maintenance requests in seconds","Track status in real time","Get notified when issues are resolved"].map(item => (
          <div key={item} className="flex items-center gap-3 text-white/80 mb-3">
            <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold text-primary">CampusServe</h1>
            <p className="text-gray-500 text-sm">Smart campus maintenance</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your university credentials to continue</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("email")} type="email" placeholder="you@university.edu"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register("password")} type="password" placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-light text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : <><LogIn size={16} />Sign in</>}
            </button>
          </form>
          <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">OR</span><div className="flex-1 h-px bg-gray-200" /></div>
          <p className="text-center text-sm text-gray-600">Don't have an account?{" "}<Link to="/register" className="text-secondary font-medium hover:underline">Register here</Link></p>
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-2 font-medium">AVAILABLE ROLES</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Student / Staff","Maintenance Officer","Administrator"].map(role => (
                <span key={role} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{role}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

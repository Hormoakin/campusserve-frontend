import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/authApi";
import { requestsApi } from "../../api/requestsApi";
import toast from "react-hot-toast";
import { Send, Upload } from "lucide-react";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide more detail (min 20 characters)"),
  category_id: z.string().min(1, "Please select a category"),
  location: z.string().min(3, "Please specify the location"),
  building: z.string().optional(),
  room_number: z.string().optional(),
  priority: z.enum(["low","medium","high","urgent"]),
  evidence_image: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewRequest() {
  const navigate = useNavigate();
  const { data: catData } = useQuery({ queryKey: ["categories"], queryFn: () => authApi.categories().then(r => r.data) });
  const categories = catData?.results ?? catData ?? [];
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema), defaultValues: { priority: "medium" },
  });
  const imageFile = watch("evidence_image");
  const hasImage = imageFile && imageFile[0];

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const form = new FormData();
      form.append("title", data.title);
      form.append("description", data.description);
      form.append("category_id", data.category_id);
      form.append("location", data.location);
      form.append("priority", data.priority);
      if (data.building) form.append("building", data.building);
      if (data.room_number) form.append("room_number", data.room_number);
      if (data.evidence_image?.[0]) form.append("evidence_image", data.evidence_image[0]);
      return requestsApi.create(form);
    },
    onSuccess: res => { toast.success(`Request ${res.data.reference_number} submitted successfully!`); navigate("/student/requests"); },
    onError: () => toast.error("Failed to submit. Please check your inputs and try again."),
  });

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${hasError ? "border-red-400 bg-red-50" : "border-gray-300"}`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Submit Maintenance Request</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below. We'll assign a maintenance officer shortly.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Request title *</label>
            <input {...register("title")} placeholder="e.g. Broken AC in Lab 3, Block C" className={inputClass(!!errors.title)} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select {...register("category_id")} className={inputClass(!!errors.category_id)}>
                <option value="">Select category...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority *</label>
              <select {...register("priority")} className={inputClass(false)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea {...register("description")} rows={4}
              placeholder="Describe the issue in detail — what happened, when it started, any safety concerns..."
              className={inputClass(!!errors.description)} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location / General area *</label>
            <input {...register("location")} placeholder="e.g. Engineering Block A, Student Hostel" className={inputClass(!!errors.location)} />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Building</label>
              <input {...register("building")} placeholder="e.g. Block C" className={inputClass(false)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Room / Office no.</label>
              <input {...register("room_number")} placeholder="e.g. Lab 201" className={inputClass(false)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Evidence photo <span className="text-gray-400 font-normal">(optional)</span></label>
            <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-secondary hover:bg-secondary/5 ${hasImage ? "border-secondary bg-secondary/5" : "border-gray-300 bg-gray-50"}`}>
              <Upload size={20} className={hasImage ? "text-secondary" : "text-gray-400"} />
              <p className="text-xs mt-2 text-gray-500">{hasImage ? `✓ ${imageFile[0].name}` : "Click to upload PNG or JPG (max 5 MB)"}</p>
              <input {...register("evidence_image")} type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {mutation.isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : <><Send size={15} />Submit Request</>}
            </button>
            <button type="button" onClick={() => navigate("/student/requests")}
              className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

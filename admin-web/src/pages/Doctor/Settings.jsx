import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, LoaderCircle, Lock, Sliders, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authApi } from "@/api/authApi";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "Your new password must contain at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

const inputClassName = "w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 aria-invalid:border-rose-400 aria-invalid:ring-rose-100";

export default function DoctorSettings() {
  const [activeTab, setActiveTab] = useState("security");
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function handlePasswordSave({ currentPassword, newPassword }) {
    setPasswordMessage({ type: "", text: "" });

    try {
      await authApi.changePassword({ oldPassword: currentPassword, newPassword });
      reset();
      setPasswordMessage({ type: "success", text: "Your password has been updated." });
    } catch (error) {
      setPasswordMessage({ type: "error", text: getErrorMessage(error, "We could not update your password.") });
    }
  }

  const tabs = [
    { id: "general", label: "General Preferences", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Password", icon: Lock },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
        <p className="mt-1 text-xs text-slate-500">Manage your account security and future workspace preferences.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${activeTab === id ? "border border-blue-100 bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        {activeTab === "general" && (
          <section>
            <h2 className="text-sm font-black text-slate-900">General Preferences</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Language and workspace preferences are not connected yet. They will be added in a later phase.</p>
          </section>
        )}

        {activeTab === "notifications" && (
          <section>
            <h2 className="text-sm font-black text-slate-900">Notifications</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Notification preferences are not connected yet. They will be added in a later phase.</p>
          </section>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSubmit(handlePasswordSave)} className="space-y-5" noValidate>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck size={18} className="text-blue-600" />
              <h2 className="text-sm font-black text-slate-900">Change Password</h2>
            </div>

            <p className="text-xs leading-5 text-slate-500">Use at least eight characters for your new password.</p>

            <div className="max-w-md space-y-4">
              <label className="block text-xs font-bold text-slate-600">
                Current password
                <input type="password" autoComplete="current-password" aria-invalid={Boolean(errors.currentPassword)} className={`mt-1 ${inputClassName}`} {...register("currentPassword", { onChange: () => setPasswordMessage({ type: "", text: "" }) })} />
                {errors.currentPassword?.message && <span className="mt-1 block text-xs font-medium text-rose-600">{errors.currentPassword.message}</span>}
              </label>

              <label className="block text-xs font-bold text-slate-600">
                New password
                <input type="password" autoComplete="new-password" aria-invalid={Boolean(errors.newPassword)} className={`mt-1 ${inputClassName}`} {...register("newPassword", { onChange: () => setPasswordMessage({ type: "", text: "" }) })} />
                {errors.newPassword?.message && <span className="mt-1 block text-xs font-medium text-rose-600">{errors.newPassword.message}</span>}
              </label>

              <label className="block text-xs font-bold text-slate-600">
                Confirm new password
                <input type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} className={`mt-1 ${inputClassName}`} {...register("confirmPassword", { onChange: () => setPasswordMessage({ type: "", text: "" }) })} />
                {errors.confirmPassword?.message && <span className="mt-1 block text-xs font-medium text-rose-600">{errors.confirmPassword.message}</span>}
              </label>
            </div>

            {passwordMessage.text && (
              <p className={`rounded-xl border px-4 py-3 text-xs font-medium ${passwordMessage.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`} role={passwordMessage.type === "error" ? "alert" : "status"}>
                {passwordMessage.text}
              </p>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

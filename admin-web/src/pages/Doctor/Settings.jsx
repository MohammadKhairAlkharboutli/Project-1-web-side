import { zodResolver } from "@hookform/resolvers/zod";
import { Globe2, LoaderCircle, Lock, Sliders, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authApi } from "@/api/authApi";
import { useDoctorLocale } from "@/context/DoctorLocaleContext";

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
  const { locale, setLocale } = useDoctorLocale();
  const isArabic = locale === "ar";
  const copy = isArabic ? {
    title: "الإعدادات", subtitle: "إدارة أمان حسابك وتفضيلات مساحة العمل.", general: "التفضيلات العامة", security: "الأمان وكلمة المرور",
    language: "لغة التطبيق", languageHint: "اختر اللغة التي تريد استخدامها في بوابة الطبيب.", english: "English", arabic: "العربية",
    password: "تغيير كلمة المرور", passwordHint: "استخدم ثمانية أحرف على الأقل لكلمة المرور الجديدة.", current: "كلمة المرور الحالية", next: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور الجديدة", update: "تحديث كلمة المرور",
  } : {
    title: "System Settings", subtitle: "Manage your account security and workspace preferences.", general: "General Preferences", security: "Security & Password",
    language: "Application language", languageHint: "Choose the language used across the doctor portal.", english: "English", arabic: "العربية",
    password: "Change Password", passwordHint: "Use at least eight characters for your new password.", current: "Current password", next: "New password", confirm: "Confirm new password", update: "Update password",
  };
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
    { id: "general", label: copy.general, icon: Sliders },
    { id: "security", label: copy.security, icon: Lock },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{copy.title}</h1>
        <p className="mt-1 text-xs text-slate-500">{copy.subtitle}</p>
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
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3"><Globe2 size={18} className="text-blue-600" /><h2 className="text-sm font-black text-slate-900">{copy.language}</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{copy.languageHint}</p>
            <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
              {[{ value: "en", label: copy.english, detail: "Left to right" }, { value: "ar", label: copy.arabic, detail: "من اليمين إلى اليسار" }].map((option) => <button key={option.value} type="button" onClick={() => setLocale(option.value)} className={`rounded-2xl border p-4 text-start transition ${locale === option.value ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-100" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}><span className="block font-black">{option.label}</span><span className="mt-1 block text-xs text-slate-500" dir={option.value === "ar" ? "rtl" : "ltr"}>{option.detail}</span></button>)}
            </div>
          </section>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSubmit(handlePasswordSave)} className="space-y-5" noValidate>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck size={18} className="text-blue-600" />
              <h2 className="text-sm font-black text-slate-900">{copy.password}</h2>
            </div>

            <p className="text-xs leading-5 text-slate-500">{copy.passwordHint}</p>

            <div className="max-w-md space-y-4">
              <label className="block text-xs font-bold text-slate-600">
                {copy.current}
                <input type="password" autoComplete="current-password" aria-invalid={Boolean(errors.currentPassword)} className={`mt-1 ${inputClassName}`} {...register("currentPassword", { onChange: () => setPasswordMessage({ type: "", text: "" }) })} />
                {errors.currentPassword?.message && <span className="mt-1 block text-xs font-medium text-rose-600">{errors.currentPassword.message}</span>}
              </label>

              <label className="block text-xs font-bold text-slate-600">
                {copy.next}
                <input type="password" autoComplete="new-password" aria-invalid={Boolean(errors.newPassword)} className={`mt-1 ${inputClassName}`} {...register("newPassword", { onChange: () => setPasswordMessage({ type: "", text: "" }) })} />
                {errors.newPassword?.message && <span className="mt-1 block text-xs font-medium text-rose-600">{errors.newPassword.message}</span>}
              </label>

              <label className="block text-xs font-bold text-slate-600">
                {copy.confirm}
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
                {copy.update}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

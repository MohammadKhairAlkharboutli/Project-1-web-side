import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AlertCircle, CheckCircle2, Sliders } from "lucide-react";

import {
  formatCurrency,
  formatDoctorStatus,
  formatEnumLabel,
  formatLanguagesSpoken,
} from "../Admin/Doctors/doctorUtils";
import { getCurrentDoctor } from "./doctorPortalData";

const requiredProfileFields = [
  { name: "fatherName", label: "father's name" },
  { name: "phone", label: "phone number" },
  { name: "address", label: "address" },
  { name: "birthDate", label: "birth date" },
  { name: "gender", label: "gender" },
  { name: "specialization", label: "medical specialty" },
  { name: "licenseNumber", label: "license number" },
  { name: "experienceYears", label: "years of experience" },
];

const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 aria-invalid:border-rose-400 aria-invalid:ring-rose-100";

function asDateInputValue(value) {
  return value ? String(value).split("T")[0] : "";
}

function buildProfileDefaults(doctor) {
  return {
    fatherName: doctor?.user?.fatherName || "",
    phone: doctor?.user?.phone || "",
    address: doctor?.user?.address || "",
    gender: doctor?.user?.gender || "",
    birthDate: asDateInputValue(doctor?.user?.birthDate),
    specialization: doctor?.specialization || "",
    subSpecialization: doctor?.subSpecialization || "",
    licenseNumber: doctor?.licenseNumber || "",
    experienceYears: doctor?.experienceYears ?? "",
    initialVisitFee: doctor?.initialVisitFee ?? "",
    returnVisitFee: doctor?.returnVisitFee ?? "",
    bio: doctor?.bio || "",
    languagesSpoken: Array.isArray(doctor?.languagesSpoken)
      ? doctor.languagesSpoken.join(", ")
      : doctor?.languagesSpoken || "",
  };
}

function getCompletionStatus(values) {
  const missingFields = requiredProfileFields.filter(({ name }) => {
    const value = values?.[name];
    return value === undefined || value === null || String(value).trim() === "";
  });
  const completionPercentage =
    ((requiredProfileFields.length - missingFields.length) / requiredProfileFields.length) * 100;

  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields,
  };
}

function FieldError({ error }) {
  return error ? <p className="mt-1.5 text-xs font-medium text-rose-600">{error.message}</p> : null;
}

function DoctorViewProfile({ doctor, onEditClick, completionStatus }) {
  const fullName = doctor?.user?.full_name || "Doctor Name";

  return (
    <div className="space-y-8">
      {!completionStatus.isComplete && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">Profile incomplete</h4>
              <p className="mt-0.5 text-xs text-amber-700">
                Complete the required personal and professional details ({Math.round(completionStatus.completionPercentage)}% completed).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onEditClick}
            className="shrink-0 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-amber-700"
          >
            Complete profile
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onEditClick}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-95"
        >
          <Sliders size={14} />
          <span>Edit profile</span>
        </button>
      </div>

      <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-8 shadow-xs lg:flex-row lg:items-center">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-br from-[#1e61dc] to-[#3b9df5]" />
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <div className="h-28 w-28 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-1 shadow-md sm:h-32 sm:w-32">
              <img
                src={doctor?.user?.avatarUrl || doctor?.photo || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
                alt={fullName}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold tracking-wide text-[#1e61dc]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1e61dc]" />
              {doctor?.specialization || "Specialist Practitioner"}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{fullName}</h1>
            <p className="text-sm font-medium text-slate-500">
              {doctor?.subSpecialization || "Clinical Operations & Patient Services"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <ProfileMetric label="Rating" value={`★ ${doctor?.averageRating?.toFixed(1) || "0.0"}`} />
          <ProfileMetric label="Clinics" value={`${doctor?.clinics_count || 0} Units`} />
          <ProfileMetric label="Status" value={formatDoctorStatus(doctor?.status)} success />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileSection title="Professional biography" subtitle="Overview">
            <p className="rounded-2xl border border-blue-50 bg-blue-50/30 p-5 text-sm leading-relaxed text-slate-600">
              {doctor?.bio || "No professional biography registered in the system database."}
            </p>
          </ProfileSection>

          <ProfileSection title="Identity & credentials" subtitle="Metadata">
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <ProfileDetail label="Email address" value={doctor?.user?.email} />
              <ProfileDetail label="Phone number" value={doctor?.user?.phone} />
              <ProfileDetail label="Father's name" value={doctor?.user?.fatherName} />
              <ProfileDetail label="License ID" value={doctor?.licenseNumber} />
              <ProfileDetail label="Gender" value={formatEnumLabel(doctor?.user?.gender)} />
              <ProfileDetail label="Age" value={doctor?.user?.age ? `${doctor.user.age} years` : null} />
              <ProfileDetail label="Languages" value={formatLanguagesSpoken(doctor?.languagesSpoken)} />
            </div>
          </ProfileSection>
        </div>

        <div className="space-y-6">
          <ProfileSection title="Consultation tariffs" subtitle="Pricing">
            <div className="space-y-3">
              <Tariff label="Initial visit" value={formatCurrency(doctor?.initialVisitFee)} primary />
              <Tariff label="Return visit" value={formatCurrency(doctor?.returnVisitFee)} />
            </div>
          </ProfileSection>
          <ProfileSection title="Contact address" subtitle="Address">
            <div className="flex items-start gap-3 rounded-xl border border-blue-50 bg-blue-50/30 p-4">
              <span className="mt-0.5 text-base">📍</span>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-800">Primary address</span>
                <p className="text-xs font-medium leading-relaxed text-slate-500">
                  {doctor?.user?.address || "No contact address registered."}
                </p>
              </div>
            </div>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}

function ProfileMetric({ label, value, success = false }) {
  return (
    <div className={`min-w-[100px] rounded-xl border px-5 py-3 text-center ${success ? "border-emerald-200/60 bg-emerald-50" : "border-blue-100 bg-blue-50/50"}`}>
      <span className={`block text-[11px] font-bold uppercase tracking-wider ${success ? "text-emerald-600" : "text-blue-500"}`}>{label}</span>
      <span className={`mt-0.5 block text-sm font-black ${success ? "text-emerald-700" : "text-[#1e61dc]"}`}>{value}</span>
    </div>
  );
}

function ProfileSection({ title, subtitle, children }) {
  return (
    <section className="space-y-4 rounded-[28px] border border-slate-200/70 bg-white p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#1e61dc]">{title}</h3>
        <span className="text-xs font-mono text-slate-400">{subtitle}</span>
      </div>
      {children}
    </section>
  );
}

function ProfileDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="font-bold text-slate-400">{label}</span>
      <span className="max-w-[160px] truncate font-bold text-slate-800">{value || "N/A"}</span>
    </div>
  );
}

function Tariff({ label, value, primary = false }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${primary ? "border-blue-100 bg-blue-50/50" : "border-slate-100 bg-slate-50"}`}>
      <div>
        <span className={`block text-[11px] font-bold uppercase tracking-wide ${primary ? "text-blue-500" : "text-slate-400"}`}>{label}</span>
        <span className={`mt-0.5 block text-base font-black ${primary ? "text-[#1e61dc]" : "text-slate-800"}`}>{value}</span>
      </div>
      <span className="text-lg">{primary ? "💳" : "🔄"}</span>
    </div>
  );
}

function DoctorEditProfile({ initialData, onSaveSuccess, onCancel }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: buildProfileDefaults(initialData),
    mode: "onTouched",
  });
  const values = useWatch({ control });
  const completionStatus = getCompletionStatus(values);

  function saveProfile(data) {
    const savedProfile = {
      ...initialData,
      specialization: data.specialization.trim(),
      subSpecialization: data.subSpecialization.trim(),
      licenseNumber: data.licenseNumber.trim(),
      experienceYears: Number(data.experienceYears),
      initialVisitFee: data.initialVisitFee === "" ? null : Number(data.initialVisitFee),
      returnVisitFee: data.returnVisitFee === "" ? null : Number(data.returnVisitFee),
      bio: data.bio.trim(),
      languagesSpoken: data.languagesSpoken
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean),
      user: {
        ...initialData.user,
        fatherName: data.fatherName.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        gender: data.gender,
        birthDate: data.birthDate,
      },
    };

    onSaveSuccess(savedProfile);
  }

  return (
    <form onSubmit={handleSubmit(saveProfile)} noValidate className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900">Complete profile</h1>
          <p className="mt-1 text-xs text-slate-500">Fill in your personal, contact, and professional information.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55">
            {isSubmitting && <Sliders className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>

      <CompletionProgress completionStatus={completionStatus} />

      <ProfileFormSection title="Personal & contact information" description="Required to complete your account profile.">
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <FormField label="Father's name" error={errors.fatherName}>
            <input {...register("fatherName", { required: "Father's name is required" })} aria-invalid={Boolean(errors.fatherName)} className={fieldClassName} />
          </FormField>
          <FormField label="Phone number" error={errors.phone}>
            <input {...register("phone", { required: "Phone number is required", pattern: { value: /^\+?[0-9\s-]{7,20}$/, message: "Enter a valid phone number" } })} inputMode="tel" aria-invalid={Boolean(errors.phone)} className={fieldClassName} />
          </FormField>
          <FormField label="Gender" error={errors.gender}>
            <select {...register("gender", { required: "Gender is required" })} aria-invalid={Boolean(errors.gender)} className={fieldClassName}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </FormField>
          <FormField label="Birth date" error={errors.birthDate}>
            <input {...register("birthDate", { required: "Birth date is required" })} type="date" aria-invalid={Boolean(errors.birthDate)} className={fieldClassName} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Address" error={errors.address}>
              <textarea {...register("address", { required: "Address is required" })} rows="3" aria-invalid={Boolean(errors.address)} className={fieldClassName} />
            </FormField>
          </div>
        </div>
      </ProfileFormSection>

      <ProfileFormSection title="Professional information" description="Required credentials and optional practice details.">
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <FormField label="Medical specialty" error={errors.specialization}>
            <input {...register("specialization", { required: "Medical specialty is required" })} aria-invalid={Boolean(errors.specialization)} className={fieldClassName} />
          </FormField>
          <FormField label="Sub-specialty" error={errors.subSpecialization}>
            <input {...register("subSpecialization")} aria-invalid={Boolean(errors.subSpecialization)} className={fieldClassName} />
          </FormField>
          <FormField label="Syndicate license number" error={errors.licenseNumber}>
            <input {...register("licenseNumber", { required: "License number is required" })} aria-invalid={Boolean(errors.licenseNumber)} className={fieldClassName} />
          </FormField>
          <FormField label="Experience years" error={errors.experienceYears}>
            <input {...register("experienceYears", { required: "Experience years are required", min: { value: 0, message: "Experience cannot be negative" } })} type="number" min="0" inputMode="numeric" aria-invalid={Boolean(errors.experienceYears)} className={fieldClassName} />
          </FormField>
          <FormField label="Initial visit fee" error={errors.initialVisitFee}>
            <input {...register("initialVisitFee", { min: { value: 0, message: "Fee cannot be negative" } })} type="number" min="0" inputMode="decimal" aria-invalid={Boolean(errors.initialVisitFee)} className={fieldClassName} />
          </FormField>
          <FormField label="Return visit fee" error={errors.returnVisitFee}>
            <input {...register("returnVisitFee", { min: { value: 0, message: "Fee cannot be negative" } })} type="number" min="0" inputMode="decimal" aria-invalid={Boolean(errors.returnVisitFee)} className={fieldClassName} />
          </FormField>
        </div>
        <div className="mt-4 space-y-4 text-xs">
          <FormField label="Languages spoken" error={errors.languagesSpoken}>
            <input {...register("languagesSpoken")} placeholder="e.g. Arabic, English" aria-invalid={Boolean(errors.languagesSpoken)} className={fieldClassName} />
          </FormField>
          <FormField label="Professional biography" error={errors.bio}>
            <textarea {...register("bio")} rows="4" aria-invalid={Boolean(errors.bio)} className={fieldClassName} />
          </FormField>
        </div>
      </ProfileFormSection>
    </form>
  );
}

function CompletionProgress({ completionStatus }) {
  const missingLabels = completionStatus.missingFields.map(({ label }) => label).join(", ");

  return (
    <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Profile completion</span>
        <span className="text-xs font-black text-blue-700">{Math.round(completionStatus.completionPercentage)}% completed</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] transition-all duration-300" style={{ width: `${completionStatus.completionPercentage}%` }} />
      </div>
      {completionStatus.isComplete ? (
        <p className="flex items-center gap-2 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> All required profile details are complete.</p>
      ) : (
        <p className="text-xs font-medium text-amber-700">Missing required fields: <span className="font-bold">{missingLabels}</span></p>
      )}
    </div>
  );
}

function ProfileFormSection({ title, description, children }) {
  return (
    <section className="space-y-5 rounded-[28px] border border-slate-200/70 bg-white p-8 shadow-xs">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1e61dc]"><Sliders size={16} /> {title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block font-bold text-slate-600">{label}</label>
      {children}
      <FieldError error={error} />
    </div>
  );
}

export default function DoctorProfileContainer() {
  const [doctorData, setDoctorData] = useState(() => ({
    ...getCurrentDoctor(),
    user: { ...getCurrentDoctor()?.user },
  }));
  const [isEditing, setIsEditing] = useState(false);
  const completionStatus = getCompletionStatus(buildProfileDefaults(doctorData));

  return (
    <div className="min-h-full w-full bg-[#f4f7fb] p-6 font-sans text-slate-900 antialiased sm:p-10 lg:p-12" dir="ltr">
      <div className="mx-auto max-w-[1400px]">
        {isEditing ? (
          <DoctorEditProfile
            initialData={doctorData}
            onSaveSuccess={(updatedProfile) => {
              setDoctorData(updatedProfile);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <DoctorViewProfile doctor={doctorData} completionStatus={completionStatus} onEditClick={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  );
}

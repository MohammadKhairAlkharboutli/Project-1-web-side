import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AlertCircle, Camera, CheckCircle2, LoaderCircle, Sliders, Trash2 } from "lucide-react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

import {
  formatCurrency,
  formatDoctorStatus,
  formatEnumLabel,
  formatLanguagesSpoken,
} from "../Admin/Doctors/doctorUtils";
import { doctorsApi } from "@/api/doctorsApi";
import { doctorClinicsApi } from "@/api/doctorClinicsApi";
import { lookupsApi } from "@/api/lookupsApi";
import { DoctorProfileCompletionContext } from "@/context/DoctorProfileCompletionContext";
import { DoctorClinicAssignmentContext } from "@/context/DoctorClinicAssignmentContext";
import { getLookupDisplayName, useDoctorLocale } from "@/context/DoctorLocaleContext";

const requiredProfileFields = [
  { name: "birthDate", label: "birth date" },
  { name: "gender", label: "gender" },
  { name: "specialization", label: "medical specialty" },
  { name: "subSpecialization", label: "medical sub-specialty" },
  { name: "licenseNumber", label: "license number" },
];

const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 aria-invalid:border-rose-400 aria-invalid:ring-rose-100";

function asDateInputValue(value) {
  return value ? String(value).split("T")[0] : "";
}

function getAdultBirthDateLimit() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().slice(0, 10);
}

function formatRating(value) {
  const rating = Number(value);
  return Number.isFinite(rating) ? rating.toFixed(1) : "0.0";
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

function findLookupByStoredValue(lookups, value) {
  return lookups.find((lookup) => lookup.value === value || lookup.labelEn === value || lookup.labelAr === value);
}

function getLookupLabel(lookup, locale) {
  return getLookupDisplayName(lookup, locale) || formatEnumLabel(lookup?.value);
}

function normalizeDoctorProfile(profile, assignedClinic = null) {
  const user = profile?.user || {};
  const fullName = user.full_name || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ");

  return {
    ...profile,
    assignedClinic,
    user: {
      ...user,
      full_name: fullName || "Doctor",
    },
  };
}

function buildProfileDefaults(doctor) {
  return {
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

function DoctorViewProfile({
  doctor,
  avatarUrl,
  onAvatarSelect,
  onAvatarRemove,
  avatarError,
  isUploadingAvatar,
  isRemovingAvatar,
  onEditClick,
  completionStatus,
}) {
  const { locale } = useDoctorLocale();
  const fileInputRef = useRef(null);
  const [profileLookups, setProfileLookups] = useState([]);
  useEffect(() => {
    let active = true;
    Promise.all([
      lookupsApi.getActiveLookups({ category: "MEDICAL_SPECIALTY" }),
      lookupsApi.getActiveLookups({ category: "MEDICAL_SUB_SPECIALTY" }),
    ]).then((results) => { if (active) setProfileLookups(results.flat()); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const specializationLookup = findLookupByStoredValue(profileLookups, doctor?.specialization);
  const subSpecializationLookup = findLookupByStoredValue(profileLookups, doctor?.subSpecialization);
  const fullName = doctor?.user?.full_name || "Doctor Name";
  const initials = fullName
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-1 text-3xl font-black text-white shadow-md sm:h-32 sm:w-32">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full rounded-xl object-cover" />
              ) : (
                initials || "D"
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={onAvatarSelect}
            />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold tracking-wide text-[#1e61dc]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1e61dc]" />
              {doctor?.specialization ? getLookupLabel(specializationLookup || { value: doctor.specialization }, locale) : "Specialist Practitioner"}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{fullName}</h1>
            <p className="text-sm font-medium text-slate-500">
              {doctor?.subSpecialization ? getLookupLabel(subSpecializationLookup || { value: doctor.subSpecialization }, locale) : "Clinical Operations & Patient Services"}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar || isRemovingAvatar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingAvatar ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                {doctor?.user?.avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              {doctor?.user?.avatarUrl ? (
                <button
                  type="button"
                  onClick={onAvatarRemove}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRemovingAvatar ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Remove photo
                </button>
              ) : null}
            </div>
            {avatarError ? <p className="text-xs font-medium text-rose-600" role="alert">{avatarError}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <ProfileMetric label="Rating" value={`★ ${formatRating(doctor?.averageRating)}`} />
          <ProfileMetric label="Clinic" value={doctor?.assignedClinic?.name || "Not assigned"} />
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

          <ProfileSection title="Account & credentials" subtitle="Metadata">
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <ProfileDetail label="Email address" value={doctor?.user?.email} />
              <ProfileDetail label="License ID" value={doctor?.licenseNumber} />
              <ProfileDetail label="Gender" value={formatEnumLabel(doctor?.user?.gender)} />
              <ProfileDetail label="Birth date" value={formatDate(doctor?.user?.birthDate)} />
              <ProfileDetail label="Experience" value={doctor?.experienceYears === null || doctor?.experienceYears === undefined ? null : `${doctor.experienceYears} years`} />
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
          <ProfileSection title="Clinic assignment" subtitle="Workplace">
            <div className="flex items-start gap-3 rounded-xl border border-blue-50 bg-blue-50/30 p-4">
              <span className="mt-0.5 text-base">📍</span>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-800">Assigned clinic</span>
                <p className="text-xs font-medium leading-relaxed text-slate-500">
                  {doctor?.assignedClinic?.name || "No clinic is assigned yet."}
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

function ProfilePhotoField({
  doctor,
  avatarUrl,
  onAvatarSelect,
  onAvatarRemove,
  avatarError,
  isUploadingAvatar,
  isRemovingAvatar,
}) {
  const fileInputRef = useRef(null);
  const fullName = doctor?.user?.full_name || "Doctor";
  const initials = fullName
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "D";
  const hasAvatar = Boolean(doctor?.user?.avatarUrl);

  return (
    <ProfileFormSection
      title="Profile photo"
      description="Optional. Use a clear professional photo so patients can recognize you."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-1 text-xl font-black text-white shadow-md">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="h-full w-full rounded-xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={onAvatarSelect}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar || isRemovingAvatar}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingAvatar ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              {hasAvatar ? "Change photo" : "Upload photo"}
            </button>
            {hasAvatar ? (
              <button
                type="button"
                onClick={onAvatarRemove}
                disabled={isUploadingAvatar || isRemovingAvatar}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRemovingAvatar ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Remove photo
              </button>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">JPG or PNG, up to 5 MB.</p>
          {avatarError ? <p className="text-xs font-medium text-rose-600" role="alert">{avatarError}</p> : null}
        </div>
      </div>
    </ProfileFormSection>
  );
}

function DoctorEditProfile({
  initialData,
  avatarUrl,
  onAvatarSelect,
  onAvatarRemove,
  avatarError,
  isUploadingAvatar,
  isRemovingAvatar,
  onSaveSuccess,
  onCancel,
}) {
  const { locale } = useDoctorLocale();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: buildProfileDefaults(initialData),
    mode: "onTouched",
  });
  const values = useWatch({ control });
  const specialization = values?.specialization || "";
  const subSpecialization = values?.subSpecialization || "";
  const completionStatus = getCompletionStatus(values);
  const [saveError, setSaveError] = useState("");
  const [lookupState, setLookupState] = useState({ status: "loading", specialties: [], subSpecialties: [], error: "" });

  const loadLookups = useCallback(async () => {
    setLookupState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const [specialties, subSpecialties] = await Promise.all([
        lookupsApi.getActiveLookups({ category: "MEDICAL_SPECIALTY" }),
        lookupsApi.getActiveLookups({ category: "MEDICAL_SUB_SPECIALTY" }),
      ]);
      setLookupState({
        status: "ready",
        specialties: Array.isArray(specialties) ? specialties : [],
        subSpecialties: Array.isArray(subSpecialties) ? subSpecialties : [],
        error: "",
      });
    } catch (error) {
      setLookupState({ status: "error", specialties: [], subSpecialties: [], error: getErrorMessage(error, "Unable to load specialty options.") });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadLookups, 0);
    return () => window.clearTimeout(timer);
  }, [loadLookups]);

  const selectedSpecialty = findLookupByStoredValue(lookupState.specialties, specialization);
  const availableSubSpecialties = selectedSpecialty
    ? lookupState.subSpecialties.filter((lookup) => Number(lookup.parentId) === Number(selectedSpecialty.id))
    : [];
  const selectedSubSpecialty = findLookupByStoredValue(availableSubSpecialties, subSpecialization);

  useEffect(() => {
    if (selectedSpecialty && specialization !== selectedSpecialty.value) {
      setValue("specialization", selectedSpecialty.value, { shouldValidate: true });
    }
  }, [selectedSpecialty, setValue, specialization]);

  useEffect(() => {
    if (selectedSubSpecialty && subSpecialization !== selectedSubSpecialty.value) {
      setValue("subSpecialization", selectedSubSpecialty.value, { shouldValidate: true });
    }
  }, [selectedSubSpecialty, setValue, subSpecialization]);

  async function saveProfile(data) {
    setSaveError("");

    try {
      const result = await doctorsApi.updateOwnProfile({
        gender: data.gender,
        birthDate: data.birthDate,
        specialization: data.specialization.trim(),
        subSpecialization: data.subSpecialization.trim(),
        licenseNumber: data.licenseNumber.trim(),
        experienceYears: data.experienceYears === "" ? undefined : Number(data.experienceYears),
        initialVisitFee: data.initialVisitFee === "" ? undefined : String(data.initialVisitFee),
        returnVisitFee: data.returnVisitFee === "" ? undefined : String(data.returnVisitFee),
        bio: data.bio.trim(),
        languagesSpoken: data.languagesSpoken
          .split(",")
          .map((language) => language.trim())
          .filter(Boolean),
      });

      await onSaveSuccess(normalizeDoctorProfile(result.profile), result.completionStatus);
    } catch (error) {
      setSaveError(getErrorMessage(error, "We could not save your profile."));
    }
  }

  return (
    <form onSubmit={handleSubmit(saveProfile)} noValidate className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900">Complete profile</h1>
          <p className="mt-1 text-xs text-slate-500">Fill in your personal and professional information.</p>
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

      {saveError && <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">{saveError}</p>}

      <ProfilePhotoField
        doctor={initialData}
        avatarUrl={avatarUrl}
        onAvatarSelect={onAvatarSelect}
        onAvatarRemove={onAvatarRemove}
        avatarError={avatarError}
        isUploadingAvatar={isUploadingAvatar}
        isRemovingAvatar={isRemovingAvatar}
      />

      <ProfileFormSection title="Personal information" description="Required to complete your account profile.">
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <FormField label="Gender" error={errors.gender}>
            <select {...register("gender", { required: "Gender is required" })} aria-invalid={Boolean(errors.gender)} className={fieldClassName}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </FormField>
          <FormField label="Birth date" error={errors.birthDate}>
            <input {...register("birthDate", { required: "Birth date is required", validate: (value) => value <= getAdultBirthDateLimit() || "A doctor must be at least 18 years old" })} type="date" max={getAdultBirthDateLimit()} aria-invalid={Boolean(errors.birthDate)} className={fieldClassName} />
          </FormField>
        </div>
      </ProfileFormSection>

      <ProfileFormSection title="Professional information" description="Required credentials and optional practice details.">
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <FormField label="Medical specialty" error={errors.specialization}>
            <select {...register("specialization", { required: "Medical specialty is required", onChange: () => setValue("subSpecialization", "", { shouldValidate: true }) })} disabled={lookupState.status !== "ready"} aria-invalid={Boolean(errors.specialization)} className={fieldClassName}>
              <option value="">{lookupState.status === "loading" ? "Loading specialties…" : "Select medical specialty"}</option>
              {!selectedSpecialty && specialization ? <option value={specialization} disabled>{formatEnumLabel(specialization)} (not currently available)</option> : null}
              {lookupState.specialties.map((lookup) => <option key={lookup.id} value={lookup.value}>{getLookupLabel(lookup, locale)}</option>)}
            </select>
          </FormField>
          <FormField label="Sub-specialty" error={errors.subSpecialization}>
            <select {...register("subSpecialization", { required: "Sub-specialty is required" })} disabled={lookupState.status !== "ready" || !selectedSpecialty} aria-invalid={Boolean(errors.subSpecialization)} className={fieldClassName}>
              <option value="">{lookupState.status === "loading" ? "Loading sub-specialties…" : selectedSpecialty ? "Select sub-specialty" : "Select a specialty first"}</option>
              {!selectedSubSpecialty && subSpecialization ? <option value={subSpecialization} disabled>{formatEnumLabel(subSpecialization)} (not currently available)</option> : null}
              {availableSubSpecialties.map((lookup) => <option key={lookup.id} value={lookup.value}>{getLookupLabel(lookup, locale)}</option>)}
            </select>
          </FormField>
          <FormField label="Syndicate license number" error={errors.licenseNumber}>
            <input {...register("licenseNumber", { required: "License number is required" })} aria-invalid={Boolean(errors.licenseNumber)} className={fieldClassName} />
          </FormField>
          <FormField label="Experience years (optional)" error={errors.experienceYears}>
            <input {...register("experienceYears", { min: { value: 0, message: "Experience cannot be negative" } })} type="number" min="0" inputMode="numeric" aria-invalid={Boolean(errors.experienceYears)} className={fieldClassName} />
          </FormField>
          <FormField label="Initial visit fee" error={errors.initialVisitFee}>
            <input {...register("initialVisitFee", { min: { value: 0, message: "Fee cannot be negative" } })} type="number" min="0" inputMode="decimal" aria-invalid={Boolean(errors.initialVisitFee)} className={fieldClassName} />
          </FormField>
          <FormField label="Return visit fee" error={errors.returnVisitFee}>
            <input {...register("returnVisitFee", { min: { value: 0, message: "Fee cannot be negative" } })} type="number" min="0" inputMode="decimal" aria-invalid={Boolean(errors.returnVisitFee)} className={fieldClassName} />
          </FormField>
        </div>
        <div className="mt-4 space-y-4 text-xs">
          {lookupState.status === "error" ? <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700"><p className="text-xs font-medium">{lookupState.error}</p><button type="button" onClick={loadLookups} className="text-xs font-bold underline">Retry</button></div> : null}
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
  const { direction } = useDoctorLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    refreshDoctorShell,
    avatarUrl,
    uploadAvatar,
    removeAvatar,
  } = useOutletContext();
  const completionContext = useContext(DoctorProfileCompletionContext);
  const clinicAssignmentContext = useContext(DoctorClinicAssignmentContext);
  const completionRequired = Boolean(location.state?.completionRequired);
  const [doctorData, setDoctorData] = useState(null);
  const [doctorCompletionStatus, setDoctorCompletionStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(completionRequired);
  const [loadState, setLoadState] = useState({ status: "loading", error: "" });
  const [avatarError, setAvatarError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const result = await doctorsApi.getOwnProfile();
        let assignedClinic = null;

        try {
          const clinics = await doctorClinicsApi.getClinicsForDoctor(result.profile.id);
          assignedClinic = clinics[0] || null;
        } catch {
          // Clinic data is supplementary; the doctor can still manage their profile.
        }

        if (isMounted) {
          setDoctorData(normalizeDoctorProfile(result.profile, assignedClinic));
          setDoctorCompletionStatus(result.completionStatus);
          setLoadState({ status: "ready", error: "" });
        }
      } catch (error) {
        if (isMounted) {
          setLoadState({
            status: "error",
            error: getErrorMessage(error, "We could not load your profile."),
          });
        }
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAvatarSelect(event) {
    const [file] = event.target.files ?? [];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setAvatarError("Choose a JPG or PNG image for your profile photo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Choose an image smaller than 5 MB.");
      return;
    }

    setAvatarError("");
    setIsUploadingAvatar(true);

    try {
      const updatedUser = await uploadAvatar(file);
      setDoctorData((current) => current
        ? { ...current, user: { ...current.user, avatarUrl: updatedUser.avatarUrl ?? current.user?.avatarUrl } }
        : current);
    } catch (error) {
      setAvatarError(getErrorMessage(error, "We could not update your profile photo."));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarError("");
    setIsRemovingAvatar(true);

    try {
      await removeAvatar();
      setDoctorData((current) => current
        ? { ...current, user: { ...current.user, avatarUrl: null } }
        : current);
    } catch (error) {
      setAvatarError(getErrorMessage(error, "We could not remove your profile photo."));
    } finally {
      setIsRemovingAvatar(false);
    }
  }

  if (loadState.status === "loading") {
    return <div className="flex min-h-full items-center justify-center p-8 text-sm font-medium text-slate-500">Loading your profile…</div>;
  }

  if (loadState.status === "error") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
        {loadState.error}
      </div>
    );
  }

  const completionStatus = doctorCompletionStatus || {
    isComplete: false,
    completionPercentage: 0,
    missingFields: [],
  };

  return (
    <div className="min-h-full w-full bg-[#f4f7fb] p-6 font-sans text-slate-900 antialiased sm:p-10 lg:p-12" dir={direction}>
      <div className="mx-auto max-w-[1400px]">
        {clinicAssignmentContext?.isClinicAssigned === false && (
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-amber-900">Clinic assignment required</p>
              <p className="mt-1 text-xs leading-5 text-amber-800">You must be assigned to a clinic by an administrator before you can use the application.</p>
            </div>
            <button type="button" onClick={clinicAssignmentContext.refreshClinicAssignment} className="shrink-0 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700">
              Check again
            </button>
          </div>
        )}
        {isEditing ? (
          <DoctorEditProfile
            initialData={doctorData}
            avatarUrl={avatarUrl}
            onAvatarSelect={handleAvatarSelect}
            onAvatarRemove={handleAvatarRemove}
            avatarError={avatarError}
            isUploadingAvatar={isUploadingAvatar}
            isRemovingAvatar={isRemovingAvatar}
            onSaveSuccess={async (updatedProfile, serverCompletionStatus) => {
              setDoctorData((currentProfile) => ({
                ...updatedProfile,
                assignedClinic: currentProfile?.assignedClinic || null,
              }));
              setDoctorCompletionStatus(serverCompletionStatus);
              await refreshDoctorShell?.();
              const isComplete = await completionContext?.refreshProfileCompletion?.();
              if (completionRequired && isComplete && serverCompletionStatus?.isComplete) {
                navigate("/doctor", { replace: true });
                return;
              }
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <DoctorViewProfile
            doctor={doctorData}
            avatarUrl={avatarUrl}
            onAvatarSelect={handleAvatarSelect}
            onAvatarRemove={handleAvatarRemove}
            avatarError={avatarError}
            isUploadingAvatar={isUploadingAvatar}
            isRemovingAvatar={isRemovingAvatar}
            completionStatus={completionStatus}
            onEditClick={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
}

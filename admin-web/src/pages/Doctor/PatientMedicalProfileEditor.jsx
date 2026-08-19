import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle2, FileUp, LoaderCircle, Plus, Save, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { doctorClinicalApi } from "@/api/doctorWorkflowApi";
import { lookupsApi } from "@/api/lookupsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";
import { getLookupDisplayName, useDoctorLocale } from "@/context/DoctorLocaleContext";

const lookupCategories = [
  "BLOOD_TYPE",
  "ALLERGY",
  "CHRONIC_CONDITIONS",
  "CHRONIC_CONDITION",
  "COMMON_SURGERIES",
  "LIFESTYLE_HABITS",
  "DISABILITY_TYPES",
];

const profileSchema = z.object({
  bloodType: z.string(),
  pregnancyStatus: z.string(),
  disabilityInfo: z.string(),
  currentSymptoms: z.string(),
  allergies: z.array(z.string()),
  chronicConditions: z.array(z.string()),
  pastSurgeries: z.array(z.string()),
  familyHistory: z.array(z.string()),
  currentMedications: z.array(z.string()),
  lifestyleHabits: z.array(z.string()),
  vaccinationStatus: z.array(z.string()),
  changeReason: z.string().trim().min(3, "Explain why this clinical profile is being updated."),
});

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function toArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
}

function lookupLabel(lookup, locale) {
  return getLookupDisplayName(lookup, locale) || String(lookup?.value || "").replaceAll("_", " ");
}

function formatValue(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normaliseList(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function isFemale(gender) {
  return String(gender || "").toLowerCase() === "female";
}

function getStoredBloodType(profile) {
  const bloodType = profile?.bloodType
    ?? profile?.blood_type
    ?? profile?.bloodGroup
    ?? profile?.blood_group
    ?? profile?.blood?.type
    ?? profile?.medicalProfile?.bloodType
    ?? profile?.medicalProfile?.blood_type
    ?? profile?.medical_profile?.bloodType
    ?? profile?.medical_profile?.blood_type
    ?? profile?.data?.bloodType
    ?? profile?.data?.blood_type;

  return typeof bloodType === "string" ? bloodType.trim() : "";
}

function buildDefaults(profile) {
  return {
    bloodType: getStoredBloodType(profile),
    pregnancyStatus: profile?.pregnancyStatus || "",
    disabilityInfo: profile?.disabilityInfo || "",
    currentSymptoms: profile?.currentSymptoms || "",
    allergies: toArray(profile?.allergies),
    chronicConditions: toArray(profile?.chronicConditions),
    pastSurgeries: toArray(profile?.pastSurgeries),
    familyHistory: toArray(profile?.familyHistory),
    currentMedications: toArray(profile?.currentMedications),
    lifestyleHabits: toArray(profile?.lifestyleHabits),
    vaccinationStatus: toArray(profile?.vaccinationStatus),
    changeReason: "",
  };
}

function Field({ label, hint, error, children }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}</span>{hint ? <span className="text-xs font-normal leading-5 text-slate-500">{hint}</span> : null}{children}{error ? <span className="text-xs font-medium text-rose-600">{error.message}</span> : null}</label>;
}

function ManagedListField({ label, hint, name, control, setValue, suggestions = [], disabled = false, locale }) {
  const values = useWatch({ control, name }) || [];
  const [customValue, setCustomValue] = useState("");

  function addValue(value) {
    const trimmed = value.trim();
    if (!trimmed || values.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return;
    setValue(name, [...values, trimmed], { shouldDirty: true, shouldValidate: true });
  }

  function removeValue(value) {
    setValue(name, values.filter((item) => item !== value), { shouldDirty: true, shouldValidate: true });
  }

  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div><p className="text-sm font-semibold text-slate-800">{label}</p>{hint ? <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p> : null}</div><div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><select value="" disabled={disabled || !suggestions.length} onChange={(event) => addValue(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"><option value="">{suggestions.length ? "Choose a common value" : "No lookup values available"}</option>{suggestions.map((lookup) => <option key={lookup.id} value={lookup.value}>{lookupLabel(lookup, locale)}</option>)}</select><div className="flex gap-2"><Input value={customValue} disabled={disabled} onChange={(event) => setCustomValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addValue(customValue); setCustomValue(""); } }} placeholder="Add custom value" /><Button type="button" variant="outline" size="icon" disabled={disabled || !customValue.trim()} onClick={() => { addValue(customValue); setCustomValue(""); }} aria-label={`Add custom ${label.toLowerCase()}`}><Plus className="h-4 w-4" /></Button></div></div>{values.length ? <div className="mt-3 flex flex-wrap gap-2">{values.map((value) => <span key={value} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">{formatValue(value)}<button type="button" onClick={() => removeValue(value)} className="rounded-full p-0.5 text-blue-700 hover:bg-blue-100" aria-label={`Remove ${formatValue(value)}`}><X className="h-3 w-3" /></button></span>)}</div> : <p className="mt-3 text-xs text-slate-500">No values recorded.</p>}</div>;
}

export default function PatientMedicalProfileEditor({ appointmentId, patientName, patientGender, profile, onAttachmentsUploaded, onCancel, onSaved }) {
  const { locale, text } = useDoctorLocale();
  const { register, handleSubmit, control, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: buildDefaults(profile),
    mode: "onTouched",
  });
  const [lookupState, setLookupState] = useState({ status: "loading", records: {}, error: "" });
  const [saveError, setSaveError] = useState("");
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [attachmentState, setAttachmentState] = useState({ status: "idle", message: "" });
  const attachmentInputRef = useRef(null);
  const femalePatient = isFemale(patientGender);
  const bloodType = useWatch({ control, name: "bloodType" });
  const bloodTypeField = register("bloodType");

  useEffect(() => {
    reset(buildDefaults(profile));
  }, [profile, reset]);

  const loadLookups = useCallback(async () => {
    setLookupState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const results = await Promise.all(lookupCategories.map((category) => lookupsApi.getActiveLookups({ category })));
      const records = Object.fromEntries(lookupCategories.map((category, index) => [category, Array.isArray(results[index]) ? results[index] : []]));
      setLookupState({ status: "ready", records, error: "" });
    } catch (error) {
      setLookupState({ status: "error", records: {}, error: getErrorMessage(error, "Unable to load the clinical lookup options.") });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadLookups, 0);
    return () => window.clearTimeout(timer);
  }, [loadLookups]);

  const chronicSuggestions = useMemo(() => [
    ...(lookupState.records.CHRONIC_CONDITIONS || []),
    ...(lookupState.records.CHRONIC_CONDITION || []),
  ], [lookupState.records]);
  const knownBloodType = (lookupState.records.BLOOD_TYPE || []).some((lookup) => lookup.value === bloodType);

  async function saveProfile(values) {
    setSaveError("");
    try {
      const updatedProfile = await doctorClinicalApi.updateMedicalProfile(appointmentId, {
        bloodType: values.bloodType || null,
        ...(femalePatient ? { pregnancyStatus: values.pregnancyStatus === "UNKNOWN" ? null : values.pregnancyStatus || null } : {}),
        disabilityInfo: values.disabilityInfo.trim() || null,
        currentSymptoms: values.currentSymptoms.trim() || null,
        allergies: normaliseList(values.allergies),
        chronicConditions: normaliseList(values.chronicConditions),
        pastSurgeries: normaliseList(values.pastSurgeries),
        familyHistory: normaliseList(values.familyHistory),
        currentMedications: normaliseList(values.currentMedications),
        lifestyleHabits: normaliseList(values.lifestyleHabits),
        vaccinationStatus: normaliseList(values.vaccinationStatus),
        changeReason: values.changeReason.trim(),
      });
      await onSaved(updatedProfile);
    } catch (error) {
      setSaveError(getErrorMessage(error, "Unable to update this patient medical profile."));
    }
  }

  function selectAttachments(event) {
    const files = Array.from(event.target.files || []);
    if (files.length > 10) {
      event.target.value = "";
      setSelectedAttachments([]);
      setAttachmentState({ status: "error", message: "Choose no more than 10 files at a time." });
      return;
    }

    setSelectedAttachments(files);
    setAttachmentState({ status: "idle", message: "" });
  }

  async function uploadProfileAttachments() {
    if (!selectedAttachments.length) return;

    setAttachmentState({ status: "uploading", message: "" });
    try {
      const uploadedAttachments = await doctorClinicalApi.uploadProfileAttachments(appointmentId, selectedAttachments);
      const uploaded = Array.isArray(uploadedAttachments) ? uploadedAttachments : [];
      const uploadedCount = uploaded.length || selectedAttachments.length;
      onAttachmentsUploaded?.(uploaded);
      setSelectedAttachments([]);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      setAttachmentState({
        status: "success",
        message: `${uploadedCount} permanent medical ${uploadedCount === 1 ? "attachment was" : "attachments were"} uploaded.`,
      });
    } catch (error) {
      setAttachmentState({ status: "error", message: getErrorMessage(error, "Unable to upload the permanent medical attachment.") });
    }
  }

  const optionGroups = {
    allergies: lookupState.records.ALLERGY || [],
    chronicConditions: chronicSuggestions,
    pastSurgeries: lookupState.records.COMMON_SURGERIES || [],
    lifestyleHabits: lookupState.records.LIFESTYLE_HABITS || [],
  };

  return <section className="mx-auto max-w-5xl space-y-6 pb-10"><PageHeader title={text("Edit clinical profile")} description={`${text("Update current clinical information for")} ${patientName} ${text("from appointment")} #${appointmentId}.`} actions={<Button type="button" variant="outline" onClick={onCancel}><ArrowLeft className="h-4 w-4" /> {text("Back to medical file")}</Button>} />
    <form onSubmit={handleSubmit(saveProfile)} noValidate className="space-y-6"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start gap-3 border-b border-slate-100 pb-5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><h2 className="font-black text-slate-900">Clinical profile</h2><p className="mt-1 text-sm leading-6 text-slate-500">Use the managed lookup lists for common values, or add a medically necessary custom value.</p></div></div>{lookupState.status === "error" ? <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle className="h-4 w-4" /><span>{lookupState.error}</span><Button type="button" variant="outline" size="sm" onClick={loadLookups}>Retry</Button></div> : null}<div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Blood type"><select {...bloodTypeField} value={bloodType || ""} onChange={bloodTypeField.onChange} disabled={lookupState.status !== "ready"} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"><option value="">Not recorded</option>{bloodType && !knownBloodType ? <option value={bloodType}>{formatValue(bloodType)} (legacy value)</option> : null}{(lookupState.records.BLOOD_TYPE || []).map((lookup) => <option key={lookup.id} value={lookup.value}>{lookupLabel(lookup, locale)}</option>)}</select></Field>{femalePatient ? <Field label="Pregnancy status"><select {...register("pregnancyStatus")} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="">Not recorded</option><option value="PREGNANT">Pregnant</option><option value="NOT_PREGNANT">Not pregnant</option><option value="UNKNOWN">Unknown</option></select></Field> : null}<Field label="Current symptoms" hint="Written clinical summary"><textarea rows={femalePatient ? 3 : 2} {...register("currentSymptoms")} className="rounded-xl border border-slate-200 p-3 text-sm font-normal text-slate-800 outline-none focus:border-blue-500" /></Field><Field label="Disability information" hint="Choose a common type below or add relevant detail"><div className="space-y-2"><select value="" disabled={lookupState.status !== "ready" || !(lookupState.records.DISABILITY_TYPES || []).length} onChange={(event) => setValue("disabilityInfo", event.target.value, { shouldDirty: true })} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"><option value="">Choose a common disability type</option>{(lookupState.records.DISABILITY_TYPES || []).map((lookup) => <option key={lookup.id} value={lookup.value}>{lookupLabel(lookup, locale)}</option>)}</select><Input {...register("disabilityInfo")} placeholder="Or write a specific disability detail" /></div></Field></div></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="border-b border-slate-100 pb-5"><h2 className="font-black text-slate-900">Clinical lists</h2><p className="mt-1 text-sm text-slate-500">Select common values or add custom clinical information.</p></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><ManagedListField label="Allergies" hint="Known allergies and sensitivities" name="allergies" control={control} setValue={setValue} suggestions={optionGroups.allergies} disabled={isSubmitting} locale={locale} /><ManagedListField label="Chronic conditions" hint="Ongoing diagnoses" name="chronicConditions" control={control} setValue={setValue} suggestions={optionGroups.chronicConditions} disabled={isSubmitting} locale={locale} /><ManagedListField label="Past surgeries" hint="Relevant surgical history" name="pastSurgeries" control={control} setValue={setValue} suggestions={optionGroups.pastSurgeries} disabled={isSubmitting} locale={locale} /><ManagedListField label="Lifestyle habits" hint="Relevant habits and exposures" name="lifestyleHabits" control={control} setValue={setValue} suggestions={optionGroups.lifestyleHabits} disabled={isSubmitting} locale={locale} /><ManagedListField label="Family history" hint="Add clinically relevant family history" name="familyHistory" control={control} setValue={setValue} disabled={isSubmitting} locale={locale} /><ManagedListField label="Current medications" hint="Patient-reported ongoing medicines" name="currentMedications" control={control} setValue={setValue} disabled={isSubmitting} locale={locale} /><ManagedListField label="Vaccination status" hint="Add relevant vaccination information" name="vaccinationStatus" control={control} setValue={setValue} disabled={isSubmitting} locale={locale} /></div></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start gap-3 border-b border-slate-100 pb-5"><FileUp className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><h2 className="font-black text-slate-900">Permanent medical attachments</h2><p className="mt-1 text-sm leading-6 text-slate-500">Upload files that belong to the patient&apos;s ongoing medical profile, rather than one consultation. You can select up to 10 files.</p></div></div><div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700"><span>Attachments</span><input ref={attachmentInputRef} id="profile-attachments" type="file" multiple onChange={selectAttachments} className="sr-only" /><label htmlFor="profile-attachments" className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal transition-colors hover:border-blue-400 hover:bg-blue-50"><span className="min-w-0 truncate text-slate-500">{selectedAttachments.length ? selectedAttachments.map((file) => file.name).join(", ") : "No file selected"}</span><span className="shrink-0 font-semibold text-blue-700">Choose file</span></label>{attachmentState.status === "error" ? <p role="alert" className="text-sm font-normal text-rose-600">{attachmentState.message}</p> : null}{attachmentState.status === "success" ? <p role="status" className="text-sm font-normal text-emerald-700">{attachmentState.message}</p> : null}<div className="flex justify-end"><Button type="button" variant="outline" onClick={uploadProfileAttachments} disabled={!selectedAttachments.length || attachmentState.status === "uploading"}>{attachmentState.status === "uploading" ? <LoaderCircle className="animate-spin" /> : <FileUp />} {attachmentState.status === "uploading" ? "Uploading…" : "Upload permanent attachments"}</Button></div></div></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><Field label="Reason for change" hint="This is recorded in the profile-change history." error={errors.changeReason}><textarea rows={3} {...register("changeReason")} placeholder="For example: Updated after reviewing the patient during today’s consultation." className="rounded-xl border border-slate-200 p-3 text-sm font-normal text-slate-800 outline-none focus:border-blue-500" /></Field>{saveError ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{saveError}</p> : null}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : <><Save className="h-4 w-4" /> Save clinical profile</>}</Button></div></section></form>
  </section>;
}

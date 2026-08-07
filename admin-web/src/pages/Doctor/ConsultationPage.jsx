import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, FilePlus2, LoaderCircle, Plus, Send, Stethoscope, Trash2 } from "lucide-react";

import { doctorClinicalApi, doctorAppointmentsApi, doctorQueueApi } from "@/api/doctorWorkflowApi";
import { clinicsApi } from "@/api/clinicsApi";
import { doctorsApi } from "@/api/doctorsApi";
import { referralsApi } from "@/api/referralsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useDoctorLocale } from "@/context/DoctorLocaleContext";

const medicineSchema = z.object({
  medicineName: z.string().trim().min(1, "Medicine name is required."),
  dosage: z.string().trim().optional(), frequency: z.string().trim().optional(), startDate: z.string().optional(), endDate: z.string().optional(), notes: z.string().trim().optional(),
});

const consultationSchema = z.object({
  diagnosis: z.string().trim().min(2, "Diagnosis is required."),
  treatmentPlan: z.string().trim().min(2, "Treatment plan is required."),
  doctorNotes: z.string().trim().min(2, "Clinical notes are required."),
  medicines: z.array(medicineSchema), attachments: z.any().optional(),
});

const referralSchema = z.object({ type: z.enum(["EXTERNAL", "FOLLOW_UP"]), reason: z.string().trim().min(3, "Referral reason is required."), toClinicId: z.string(), toDoctorId: z.string() }).superRefine((value, context) => {
  if (value.type === "EXTERNAL" && !value.toClinicId) context.addIssue({ code: "custom", path: ["toClinicId"], message: "Choose the clinic receiving this referral." });
});

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getPatientName(appointment) {
  const user = appointment?.patient?.user;
  return user?.full_name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Patient";
}

function formatList(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not recorded";
  return value || "Not recorded";
}

export default function ConsultationPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { text } = useDoctorLocale();
  const [state, setState] = useState({ status: "loading", appointment: null, queueEntry: null, medicalProfile: null, histories: [], medicines: [], attachments: [], error: "" });
  const [destinations, setDestinations] = useState({ clinics: [], doctors: [] });
  const [referralDoctorsState, setReferralDoctorsState] = useState({ loading: false, error: "" });
  const [notice, setNotice] = useState("");
  const [saveProgress, setSaveProgress] = useState({ historyId: null, medicinesSaved: 0, attachmentsSaved: false, complete: false });
  const [completionLoading, setCompletionLoading] = useState(false);
  const [selectedAttachmentNames, setSelectedAttachmentNames] = useState([]);

  const consultationForm = useForm({ resolver: zodResolver(consultationSchema), defaultValues: { diagnosis: "", treatmentPlan: "", doctorNotes: "", medicines: [], attachments: undefined } });
  const attachmentField = consultationForm.register("attachments");
  const { fields, append, remove } = useFieldArray({ control: consultationForm.control, name: "medicines" });
  const referralForm = useForm({ resolver: zodResolver(referralSchema), defaultValues: { type: "EXTERNAL", reason: "", toClinicId: "", toDoctorId: "" } });

  const loadConsultation = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const [appointment, queue, medicalProfile, histories, medicines, attachments] = await Promise.all([
        doctorAppointmentsApi.getAppointment(appointmentId), doctorQueueApi.getMyQueue(), doctorClinicalApi.getMedicalProfile(appointmentId), doctorClinicalApi.getMedicalHistories(appointmentId), doctorClinicalApi.getMedicines(appointmentId), doctorClinicalApi.getAttachments(appointmentId),
      ]);
      const queueEntry = (Array.isArray(queue) ? queue : []).find((item) => item.status === "in_progress" && String(item.appointmentId || item.appointment?.id) === String(appointmentId)) || null;
      const historyItems = Array.isArray(histories) ? histories : [];
      const existingHistory = historyItems.find((item) => String(item.appointmentId) === String(appointmentId));
      setState({ status: "ready", appointment, queueEntry, medicalProfile, histories: historyItems, medicines: Array.isArray(medicines) ? medicines : [], attachments: Array.isArray(attachments) ? attachments : [], error: "" });
      if (existingHistory) setSaveProgress({ historyId: existingHistory.id, medicinesSaved: 0, attachmentsSaved: false, complete: true });
    } catch (requestError) {
      setState((current) => ({ ...current, status: "error", error: getErrorMessage(requestError, "Unable to load this consultation.") }));
    }
  }, [appointmentId]);

  useEffect(() => { loadConsultation(); }, [loadConsultation]);
  useEffect(() => {
    let cancelled = false;
    clinicsApi.getClinics()
      .then((clinics) => { if (!cancelled) setDestinations({ clinics: Array.isArray(clinics) ? clinics : [], doctors: [] }); })
      .catch(() => { if (!cancelled) setDestinations({ clinics: [], doctors: [] }); });
    return () => { cancelled = true; };
  }, []);

  const existingHistory = useMemo(() => state.histories.find((item) => String(item.appointmentId) === String(appointmentId)) || null, [appointmentId, state.histories]);
  const clinicalSaved = Boolean(existingHistory || saveProgress.complete);
  const referralType = referralForm.watch("type");
  const selectedReferralClinicId = referralForm.watch("toClinicId");

  async function selectReferralClinic(clinicId) {
    referralForm.setValue("toClinicId", clinicId, { shouldDirty: true, shouldValidate: true });
    referralForm.setValue("toDoctorId", "", { shouldDirty: true, shouldValidate: true });
    setDestinations((current) => ({ ...current, doctors: [] }));
    setReferralDoctorsState({ loading: false, error: "" });
    if (!clinicId) return;

    setReferralDoctorsState({ loading: true, error: "" });
    try {
      const doctors = await doctorsApi.getDoctors({ clinicId });
      setDestinations((current) => ({ ...current, doctors: Array.isArray(doctors) ? doctors : [] }));
    } catch (requestError) {
      setReferralDoctorsState({ loading: false, error: getErrorMessage(requestError, "Unable to load doctors in this clinic.") });
      return;
    }
    setReferralDoctorsState({ loading: false, error: "" });
  }

  function selectReferralType(type) {
    referralForm.setValue("type", type, { shouldDirty: true, shouldValidate: true });
    referralForm.setValue("toClinicId", "", { shouldDirty: true, shouldValidate: true });
    referralForm.setValue("toDoctorId", "", { shouldDirty: true, shouldValidate: true });
    setDestinations((current) => ({ ...current, doctors: [] }));
    setReferralDoctorsState({ loading: false, error: "" });
  }

  async function submitConsultation(values) {
    setNotice("");
    try {
      let historyId = saveProgress.historyId || existingHistory?.id;
      if (!historyId) {
        const history = await doctorClinicalApi.createMedicalHistory({ appointmentId: Number(appointmentId), diagnosis: values.diagnosis.trim(), treatmentPlan: values.treatmentPlan.trim(), doctorNotes: values.doctorNotes.trim() });
        historyId = history.id;
        setSaveProgress((current) => ({ ...current, historyId }));
      }
      for (let index = saveProgress.medicinesSaved; index < values.medicines.length; index += 1) {
        await doctorClinicalApi.createHistoryMedicine(historyId, values.medicines[index]);
        setSaveProgress((current) => ({ ...current, medicinesSaved: index + 1 }));
      }
      if (!saveProgress.attachmentsSaved) {
        await doctorClinicalApi.uploadHistoryAttachments(historyId, Array.from(values.attachments || []));
        setSaveProgress((current) => ({ ...current, attachmentsSaved: true }));
      }
      setSaveProgress((current) => ({ ...current, complete: true }));
      consultationForm.reset();
      setNotice("Clinical record saved. You can now complete the consultation.");
      await loadConsultation();
    } catch (requestError) {
      setNotice(`Some data may already be saved. ${getErrorMessage(requestError, "Review the form and retry the remaining step.")}`);
    }
  }

  async function submitReferral(values) {
    if (!state.appointment?.patientId) return;
    try {
      await referralsApi.createReferral({ patientId: Number(state.appointment.patientId), type: values.type, reason: values.reason.trim(), ...(values.type === "EXTERNAL" && values.toClinicId ? { toClinicId: Number(values.toClinicId) } : {}), ...(values.type === "EXTERNAL" && values.toDoctorId ? { toDoctorId: Number(values.toDoctorId) } : {}) });
      referralForm.reset();
      setNotice("Referral created. It is live, but the current backend cannot attach it to this appointment yet.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError, "The referral could not be created."));
    }
  }

  async function completeConsultation() {
    if (!state.queueEntry || !clinicalSaved) return;
    setCompletionLoading(true);
    setNotice("");
    try {
      await doctorQueueApi.completeConsultation(state.queueEntry.id);
      navigate("/doctor/queue", { replace: true });
    } catch (requestError) {
      setNotice(getErrorMessage(requestError, "The consultation could not be completed."));
    } finally { setCompletionLoading(false); }
  }

  if (state.status === "loading") return <section className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white p-14 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading consultation…</section>;
  if (state.status === "error") return <section className="mx-auto w-full max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-800"><h1 className="text-lg font-bold">Consultation unavailable</h1><p className="mt-2 text-sm">{state.error}</p><Button className="mt-5" onClick={loadConsultation}>Try again</Button></section>;
  if (!state.queueEntry) return <section className="mx-auto w-full max-w-4xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900"><h1 className="text-lg font-bold">Start this consultation from the queue</h1><p className="mt-2 text-sm">Only the doctor&apos;s active in-progress queue entry can open a live consultation.</p><Button className="mt-5" onClick={() => navigate("/doctor/queue")}>Open queue</Button></section>;

  return <div className="mx-auto w-full max-w-6xl space-y-6 pb-12"><header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-6 text-white shadow-lg shadow-blue-500/20 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><button type="button" onClick={() => navigate("/doctor/queue")} className="inline-flex items-center gap-2 text-xs font-bold text-blue-100 hover:text-white"><ArrowLeft size={15} /> Back to queue</button><p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-100">Live consultation</p><h1 className="mt-1 text-2xl font-black tracking-tight">{getPatientName(state.appointment)}</h1><p className="mt-1 text-sm text-blue-100">{state.appointment.type || "Consultation"} · Appointment #{state.appointment.id}</p></div><Button disabled={!clinicalSaved || completionLoading} onClick={completeConsultation} className="bg-white text-blue-700 hover:bg-blue-50"><CheckCircle2 /> {completionLoading ? "Completing…" : "Complete consultation"}</Button></header>
    {notice ? <p role="status" className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{notice}</p> : null}
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-black text-slate-900">Visit details</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-400">Reason for visit</dt><dd className="font-medium text-slate-800">{state.appointment.reasonForVisit || "Not recorded"}</dd></div><div><dt className="text-slate-400">Symptoms</dt><dd className="font-medium text-slate-800">{state.appointment.symptoms || "Not recorded"}</dd></div></dl></article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h2 className="text-sm font-black text-slate-900">Medical profile</h2>{state.appointment.patientId || state.appointment.patient?.id ? <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/doctor/patients/${state.appointment.patientId || state.appointment.patient.id}?appointmentId=${appointmentId}&returnTo=consultation`)}>Open full medical file</Button> : null}</div><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-400">Allergies</dt><dd className="font-medium text-slate-800">{formatList(state.medicalProfile?.allergies)}</dd></div><div><dt className="text-slate-400">Chronic conditions</dt><dd className="font-medium text-slate-800">{formatList(state.medicalProfile?.chronicConditions)}</dd></div><div><dt className="text-slate-400">Current medications</dt><dd className="font-medium text-slate-800">{formatList(state.medicalProfile?.currentMedications)}</dd></div></dl></article>
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Stethoscope size={19} /></span><div><h2 className="font-black text-slate-900">Clinical record</h2><p className="text-sm text-slate-500">Saved to the patient&apos;s medical history before this consultation is completed.</p></div></div>{clinicalSaved ? <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-900"><p className="font-bold">Clinical record saved</p><p className="mt-2">Diagnosis: {existingHistory?.diagnosis || "Saved in this session"}</p><p className="mt-1">Treatment plan: {existingHistory?.treatmentPlan || "Saved in this session"}</p></div> : <form className="mt-6 space-y-5" onSubmit={consultationForm.handleSubmit(submitConsultation)} noValidate><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Diagnosis<textarea rows={4} {...consultationForm.register("diagnosis")} className="rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-blue-500" />{consultationForm.formState.errors.diagnosis && <span className="text-xs text-rose-600">{consultationForm.formState.errors.diagnosis.message}</span>}</label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Treatment plan<textarea rows={4} {...consultationForm.register("treatmentPlan")} className="rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-blue-500" />{consultationForm.formState.errors.treatmentPlan && <span className="text-xs text-rose-600">{consultationForm.formState.errors.treatmentPlan.message}</span>}</label></div><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Clinical notes<textarea rows={5} {...consultationForm.register("doctorNotes")} className="rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-blue-500" />{consultationForm.formState.errors.doctorNotes && <span className="text-xs text-rose-600">{consultationForm.formState.errors.doctorNotes.message}</span>}</label><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-800">Prescriptions</h3><Button type="button" variant="outline" size="sm" onClick={() => append({ medicineName: "", dosage: "", frequency: "", startDate: "", endDate: "", notes: "" })}><Plus /> Add medicine</Button></div><div className="mt-4 space-y-4">{fields.length === 0 ? <p className="text-sm text-slate-500">No medicine prescribed.</p> : fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-3"><Input placeholder="Medicine name" {...consultationForm.register(`medicines.${index}.medicineName`)} /><Input placeholder="Dosage" {...consultationForm.register(`medicines.${index}.dosage`)} /><Input placeholder="Frequency" {...consultationForm.register(`medicines.${index}.frequency`)} /><Input type="date" {...consultationForm.register(`medicines.${index}.startDate`)} /><Input type="date" {...consultationForm.register(`medicines.${index}.endDate`)} /><div className="flex gap-2"><Input placeholder="Instructions" {...consultationForm.register(`medicines.${index}.notes`)} /><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove medicine"><Trash2 /></Button></div>{consultationForm.formState.errors.medicines?.[index]?.medicineName && <p className="text-xs text-rose-600 md:col-span-3">{consultationForm.formState.errors.medicines[index].medicineName.message}</p>}</div>)}</div></div><div className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{text("Attachments")}</span><input id="consultation-attachments" type="file" multiple {...attachmentField} onChange={(event) => { attachmentField.onChange(event); setSelectedAttachmentNames(Array.from(event.target.files || []).map((file) => file.name)); }} className="sr-only" /><label htmlFor="consultation-attachments" className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal transition-colors hover:border-blue-400 hover:bg-blue-50"><span className="min-w-0 truncate text-slate-500">{selectedAttachmentNames.length ? selectedAttachmentNames.join(", ") : text("No file selected")}</span><span className="shrink-0 font-semibold text-blue-700">{text("Choose file")}</span></label></div><Button type="submit" disabled={consultationForm.formState.isSubmitting}>{consultationForm.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : <FilePlus2 />} Save clinical record</Button></form>}</section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-black text-slate-900">Create referral</h2>
      <p className="mt-1 text-sm text-slate-500">This creates a live referral for the patient. The backend does not yet link it to this appointment.</p>
      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={referralForm.handleSubmit(submitReferral)} noValidate>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Type
          <NativeSelect value={referralType} onChange={(event) => selectReferralType(event.target.value)}>
            <NativeSelectOption value="EXTERNAL">External referral</NativeSelectOption>
            <NativeSelectOption value="FOLLOW_UP">Follow-up with me</NativeSelectOption>
          </NativeSelect>
        </label>
        {referralType === "EXTERNAL" ? <>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Target clinic
            <NativeSelect value={selectedReferralClinicId} onChange={(event) => selectReferralClinic(event.target.value)} disabled={referralForm.formState.isSubmitting}>
              <NativeSelectOption value="">Choose a clinic</NativeSelectOption>
              {destinations.clinics.map((clinic) => <NativeSelectOption key={clinic.id} value={String(clinic.id)}>{clinic.name}</NativeSelectOption>)}
            </NativeSelect>
            {referralForm.formState.errors.toClinicId && <span className="text-xs text-rose-600">{referralForm.formState.errors.toClinicId.message}</span>}
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Target doctor <span className="font-normal text-slate-500">(optional)</span>
            <NativeSelect {...referralForm.register("toDoctorId")} disabled={!selectedReferralClinicId || referralDoctorsState.loading || referralForm.formState.isSubmitting}>
              <NativeSelectOption value="">{referralDoctorsState.loading ? "Loading doctors…" : selectedReferralClinicId ? "Choose a doctor" : "Choose a clinic first"}</NativeSelectOption>
              {destinations.doctors.map((doctor) => <NativeSelectOption key={doctor.id} value={String(doctor.id)}>{doctor.user?.full_name || [doctor.user?.firstName, doctor.user?.lastName].filter(Boolean).join(" ") || `Doctor #${doctor.id}`}</NativeSelectOption>)}
            </NativeSelect>
            {referralDoctorsState.error && <span className="text-xs text-rose-600">{referralDoctorsState.error}</span>}
          </label>
        </> : <p className="self-end rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">This follow-up stays with you, so no clinic or doctor needs to be selected.</p>}
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Reason<textarea rows={3} {...referralForm.register("reason")} className="rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-blue-500" />{referralForm.formState.errors.reason && <span className="text-xs text-rose-600">{referralForm.formState.errors.reason.message}</span>}</label>
        <div className="md:col-span-2"><Button type="submit" disabled={referralForm.formState.isSubmitting}>{referralForm.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />} Create referral</Button></div>
      </form>
    </section>
  </div>;
}

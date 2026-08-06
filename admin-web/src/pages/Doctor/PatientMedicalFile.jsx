import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Activity, AlertCircle, ArrowLeft, CalendarDays, Download, FileText, HeartPulse, History, Mail, MapPin, Paperclip, Pencil, Phone, ShieldAlert, UserRound } from "lucide-react";

import { doctorAppointmentsApi, doctorClinicalApi } from "@/api/doctorWorkflowApi";
import { Button } from "@/components/ui/button";
import { useDoctorLocale } from "@/context/DoctorLocaleContext";
import PatientMedicalProfileEditor from "./PatientMedicalProfileEditor";

const tabs = [
  { id: "overview", label: "Medical Profile", icon: HeartPulse },
  { id: "history", label: "Consultation History", icon: History },
  { id: "attachments", label: "Attachments", icon: Paperclip },
  { id: "changes", label: "Profile Changes", icon: Activity },
];

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function getAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
}

function getPatientName(appointment) {
  const user = appointment?.patient?.user;
  return user?.full_name || [user?.firstName, user?.fatherName, user?.lastName].filter(Boolean).join(" ") || "Patient";
}

function getPatientId(appointment) {
  return appointment?.patientId ?? appointment?.patient?.id;
}

function formatValue(value) {
  if (value == null || value === "") return "Not recorded";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replaceAll("_", " ");
}

function EmptyState({ title, description }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center"><p className="font-medium text-slate-700">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

function TagList({ values, empty = "None reported" }) {
  return values?.length ? <div className="flex flex-wrap gap-2">{values.map((value, index) => <span key={`${String(value)}-${index}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{formatValue(value)}</span>)}</div> : <p className="text-sm text-slate-500">{empty}</p>;
}

function ProfileGroup({ label, values }) {
  return <div className="rounded-xl border border-slate-200 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><TagList values={values} /></div>;
}

function ClinicalAccessNotice({ error }) {
  return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><h2 className="font-semibold">Clinical record unavailable</h2><p className="mt-1 text-sm leading-6">{error || "The clinical record could not be loaded."}</p><p className="mt-2 text-sm leading-6">The server permits these records only through a doctor-owned, non-cancelled appointment and currently applies a seven-day access window.</p></div></div></section>;
}

export default function PatientMedicalFile() {
  const { text } = useDoctorLocale();
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [state, setState] = useState({ status: "loading", appointment: null, profile: null, histories: [], attachments: { profileAttachments: [], historyAttachments: [] }, changes: [], clinicalErrors: { profile: "", histories: "", attachments: "", changes: "" }, error: "" });
  const [downloadState, setDownloadState] = useState({ attachmentId: null, error: "" });

  const loadPatientFile = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      let appointmentId = searchParams.get("appointmentId");
      if (!appointmentId || !/^\d+$/.test(appointmentId)) {
        const appointments = await doctorAppointmentsApi.getAppointments();
        const linkedAppointment = (Array.isArray(appointments) ? appointments : []).find((item) => String(getPatientId(item)) === String(patientId));
        appointmentId = linkedAppointment?.id ? String(linkedAppointment.id) : "";
      }
      if (!appointmentId) throw new Error("No appointment was found between you and this patient.");

      const appointment = await doctorAppointmentsApi.getAppointment(appointmentId);
      if (String(getPatientId(appointment)) !== String(patientId)) throw new Error("This appointment does not belong to the selected patient.");

      const [profileResult, historiesResult, attachmentsResult, changesResult] = await Promise.allSettled([
        doctorClinicalApi.getMedicalProfile(appointmentId),
        doctorClinicalApi.getMedicalHistories(appointmentId),
        doctorClinicalApi.getAttachments(appointmentId),
        doctorClinicalApi.getMedicalProfileLogs(appointmentId),
      ]);
      const clinicalErrors = {
        profile: profileResult.status === "rejected" ? getErrorMessage(profileResult.reason, "The medical profile is unavailable.") : "",
        histories: historiesResult.status === "rejected" ? getErrorMessage(historiesResult.reason, "The consultation history is unavailable.") : "",
        attachments: attachmentsResult.status === "rejected" ? getErrorMessage(attachmentsResult.reason, "The attachment list is unavailable.") : "",
        changes: changesResult.status === "rejected" ? getErrorMessage(changesResult.reason, "The profile-change timeline is unavailable.") : "",
      };
      const attachments = attachmentsResult.status === "fulfilled" && attachmentsResult.value && typeof attachmentsResult.value === "object" ? attachmentsResult.value : {};

      setState({
        status: "ready",
        appointment,
        profile: profileResult.status === "fulfilled" ? profileResult.value : null,
        histories: historiesResult.status === "fulfilled" && Array.isArray(historiesResult.value) ? historiesResult.value : [],
        attachments: { profileAttachments: Array.isArray(attachments.profileAttachments) ? attachments.profileAttachments : [], historyAttachments: Array.isArray(attachments.historyAttachments) ? attachments.historyAttachments : [] },
        changes: changesResult.status === "fulfilled" && Array.isArray(changesResult.value) ? changesResult.value : [],
        clinicalErrors,
        error: "",
      });
    } catch (requestError) {
      setState((current) => ({ ...current, status: "error", error: getErrorMessage(requestError, "Unable to load this patient file.") }));
    }
  }, [patientId, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(loadPatientFile, 0);
    return () => window.clearTimeout(timer);
  }, [loadPatientFile]);

  const downloadAttachment = useCallback(async (attachment) => {
    if (!state.appointment?.id || !attachment?.id) return;

    setDownloadState({ attachmentId: attachment.id, error: "" });
    try {
      const fileBlob = await doctorClinicalApi.downloadAttachment(state.appointment.id, attachment.id);
      const objectUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.originalName || "medical-attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
      setDownloadState({ attachmentId: null, error: "" });
    } catch (requestError) {
      setDownloadState({ attachmentId: null, error: getErrorMessage(requestError, "Unable to download this attachment.") });
    }
  }, [state.appointment?.id]);

  const patient = state.appointment?.patient;
  const user = patient?.user || {};
  const profile = state.profile;
  const initials = useMemo(() => getPatientName(state.appointment).split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join(""), [state.appointment]);
  const currentTab = tabs.find((tab) => tab.id === activeTab);
  const returnToConsultation = searchParams.get("returnTo") === "consultation" && String(searchParams.get("appointmentId")) === String(state.appointment?.id);
  const backPath = returnToConsultation ? `/doctor/consultation/${state.appointment.id}` : "/doctor/patients";

  if (state.status === "loading") return <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">Loading medical file…</div>;
  if (state.status === "error") return <section className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center"><h1 className="text-lg font-semibold text-rose-900">Patient file unavailable</h1><p className="mt-2 text-sm text-rose-800">{state.error}</p><div className="mt-4 flex justify-center gap-3"><Button onClick={loadPatientFile}>Try again</Button><Button variant="outline" onClick={() => navigate("/doctor/patients")}>Back to patients</Button></div></section>;

  if (isEditingProfile && profile) {
    return <PatientMedicalProfileEditor
      appointmentId={state.appointment.id}
      patientName={getPatientName(state.appointment)}
      patientGender={state.appointment?.patient?.user?.gender}
      profile={profile}
      onCancel={() => setIsEditingProfile(false)}
      onSaved={async () => {
        setIsEditingProfile(false);
        setActiveTab("overview");
        await loadPatientFile();
      }}
    />;
  }

  return <section className="mx-auto max-w-7xl space-y-6 pb-10">
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><Button variant="outline" size="icon-sm" onClick={() => navigate(backPath)} aria-label={text(returnToConsultation ? "Back to consultation" : "Back to patients")}><ArrowLeft className="h-4 w-4" /></Button><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">{text("Patient Medical File")}</h1><p className="mt-1 text-sm text-slate-500">{text("Live record from appointment")} #{state.appointment.id}</p></div></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={loadPatientFile}>Refresh record</Button><Button size="sm" onClick={() => setIsEditingProfile(true)} disabled={!profile}><Pencil className="h-4 w-4" /> Edit clinical profile</Button></div>
    </div>

    <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col items-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-xl font-semibold text-blue-700">{initials || "P"}</div><h2 className="mt-3 text-lg font-semibold text-slate-900">{getPatientName(state.appointment)}</h2><p className="mt-1 text-sm text-slate-500">{user.gender || "Gender not recorded"}{getAge(user.birthDate) != null ? ` · ${getAge(user.birthDate)} years` : ""}</p></div><div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600"><p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-slate-400" />{user.phone || "Not recorded"}</p><p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0 text-slate-400" />{user.email || "Not recorded"}</p><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />Born {formatDate(user.birthDate)}</p>{user.address ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{user.address}</p> : null}</div></div>
        {profile ? <><div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-700"><ShieldAlert className="h-4 w-4" />Allergy alert</p><div className="mt-2"><TagList values={profile.allergies} empty="No allergies recorded" /></div></div><div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-red-600">Blood type</p><p className="mt-1 text-xl font-semibold text-red-800">{profile.bloodType || "Not recorded"}</p></div></> : null}
      </aside>
      <main className="min-w-0"><div className="mb-5 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1.5">{tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === tab.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}</div>
        {currentTab?.id === "overview" && (profile ? <Overview profile={profile} /> : <ClinicalAccessNotice error={state.clinicalErrors.profile} />)}
        {currentTab?.id === "history" && <HistoryTab histories={state.histories} error={state.clinicalErrors.histories} />}
        {currentTab?.id === "attachments" && <AttachmentsTab attachments={state.attachments} error={state.clinicalErrors.attachments} onDownload={downloadAttachment} downloadingAttachmentId={downloadState.attachmentId} downloadError={downloadState.error} />}
        {currentTab?.id === "changes" && <ChangesTab changes={state.changes} error={state.clinicalErrors.changes} />}
      </main>
    </div>
  </section>;
}

function Overview({ profile }) { return <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-900">Current clinical information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><ProfileGroup label="Chronic conditions" values={profile.chronicConditions} /><ProfileGroup label="Current medications" values={profile.currentMedications} /><ProfileGroup label="Past surgeries" values={profile.pastSurgeries} /><ProfileGroup label="Family history" values={profile.familyHistory} /><ProfileGroup label="Lifestyle" values={profile.lifestyleHabits} /><ProfileGroup label="Vaccinations" values={profile.vaccinationStatus} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-900">Additional information</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current symptoms</dt><dd className="mt-1 text-sm text-slate-700">{profile.currentSymptoms || "None recorded"}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Disability information</dt><dd className="mt-1 text-sm text-slate-700">{profile.disabilityInfo || "None recorded"}</dd></div>{profile.pregnancyStatus ? <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pregnancy status</dt><dd className="mt-1 text-sm text-slate-700">{formatValue(profile.pregnancyStatus)}</dd></div> : null}</dl></section></div>; }

function HistoryTab({ histories, error }) { if (error) return <ClinicalAccessNotice error={error} />; return histories.length ? <div className="space-y-4">{histories.map((history) => <article key={history.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium text-blue-700">{formatDate(history.appointment?.requestedDate || history.created_at || history.createdAt)}</p><h2 className="mt-1 text-base font-semibold text-slate-900">{history.diagnosis}</h2><p className="mt-1 text-sm text-slate-500">Clinical consultation record</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Visit #{history.appointmentId}</span></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Treatment plan</p><p className="mt-1 text-sm leading-6 text-slate-700">{history.treatmentPlan}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Doctor notes</p><p className="mt-1 text-sm leading-6 text-slate-700">{history.doctorNotes}</p></div></div><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prescribed medicines</p><div className="mt-2"><TagList values={(history.medicines || []).map((medicine) => medicine.medicineName || medicine.name)} /></div><p className="mt-3 text-xs text-slate-500">{(history.attachments || []).length} related attachment{(history.attachments || []).length === 1 ? "" : "s"}</p></div></article>)}</div> : <EmptyState title="No consultation history" description="Completed consultation records will appear here." />; }

function AttachmentsTab({ attachments, error, onDownload, downloadingAttachmentId, downloadError }) { if (error) return <ClinicalAccessNotice error={error} />; const profileFiles = attachments.profileAttachments || []; const consultationFiles = attachments.historyAttachments || []; return profileFiles.length || consultationFiles.length ? <div className="space-y-5">{downloadError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{downloadError}</p> : null}<FileGroup title="Profile attachments" files={profileFiles} onDownload={onDownload} downloadingAttachmentId={downloadingAttachmentId} /><FileGroup title="Consultation attachments" files={consultationFiles} onDownload={onDownload} downloadingAttachmentId={downloadingAttachmentId} /></div> : <EmptyState title="No attachments" description="Profile and consultation files will appear here." />; }
function FileGroup({ title, files, onDownload, downloadingAttachmentId }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-900">{title}</h2>{files.length ? <div className="mt-4 space-y-3">{files.map((file) => <div key={file.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center"><FileText className="h-5 w-5 shrink-0 text-blue-600" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{file.originalName || "Attachment"}</p><p className="mt-0.5 text-xs text-slate-500">{file.fileType || "File"} · {formatDate(file.created_at || file.createdAt)}</p></div><Button type="button" variant="outline" size="sm" disabled={downloadingAttachmentId === file.id} onClick={() => onDownload(file)}><Download className="h-4 w-4" />{downloadingAttachmentId === file.id ? "Downloading…" : "Download"}</Button></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No files in this group.</p>}</section>; }
function ChangesTab({ changes, error }) { if (error) return <ClinicalAccessNotice error={error} />; return changes.length ? <div className="space-y-3">{changes.map((change) => <article key={change.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold text-slate-900">{formatValue(change.fieldName)}</h2><p className="mt-1 text-sm text-slate-500">Account #{change.userId || "—"} · {formatDate(change.created_at || change.createdAt)}</p></div><UserRound className="h-5 w-5 text-slate-400" /></div><p className="mt-3 text-sm text-slate-700"><span className="text-slate-400">From:</span> {formatValue(change.oldValue)}</p><p className="mt-1 text-sm text-slate-700"><span className="text-slate-400">To:</span> {formatValue(change.newValue)}</p>{change.changeReason ? <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">{change.changeReason}</p> : null}</article>)}</div> : <EmptyState title="No profile changes" description="Medical profile updates will be listed here." />; }

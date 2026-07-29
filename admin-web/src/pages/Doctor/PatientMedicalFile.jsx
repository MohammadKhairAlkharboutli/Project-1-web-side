import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Activity, ArrowLeft, CalendarDays, FileText, HeartPulse, History, Mail, Paperclip, Phone, ShieldAlert, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getMockPatientMedicalFile } from "./mockPatientMedicalFiles";

const tabs = [
  { id: "overview", label: "Medical Profile", icon: HeartPulse },
  { id: "history", label: "Consultation History", icon: History },
  { id: "attachments", label: "Attachments", icon: Paperclip },
  { id: "changes", label: "Profile Changes", icon: Activity },
];

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function getAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
}

function EmptyState({ title, description }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center"><p className="font-medium text-slate-700">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

function TagList({ values, empty = "None reported" }) {
  return values?.length ? <div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{value}</span>)}</div> : <p className="text-sm text-slate-500">{empty}</p>;
}

function ProfileGroup({ label, values }) {
  return <div className="rounded-xl border border-slate-200 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><TagList values={values} /></div>;
}

export default function PatientMedicalFile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const patient = getMockPatientMedicalFile(patientId);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 120);
    return () => window.clearTimeout(timer);
  }, [patientId]);

  if (isLoading) return <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">Loading medical file…</div>;
  if (!patient) return <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center"><h1 className="text-lg font-semibold text-slate-900">Patient file not found</h1><p className="mt-2 text-sm text-slate-500">This mock patient does not have a medical file.</p><Button className="mt-4" onClick={() => navigate("/doctor/patients")}>Back to patients</Button></section>;

  const { user, medicalProfile: profile } = patient;
  const initials = user.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("");
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return <section className="mx-auto max-w-7xl space-y-6 pb-10">
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><Button variant="outline" size="icon-sm" onClick={() => navigate("/doctor/patients")} aria-label="Back to patients"><ArrowLeft className="h-4 w-4" /></Button><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">Patient Medical File</h1><p className="mt-1 text-sm text-slate-500">Mock clinical record · Patient #{patient.id}</p></div></div>
      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Read-only mock data</span>
    </div>

    <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col items-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-xl font-semibold text-blue-700">{initials}</div><h2 className="mt-3 text-lg font-semibold text-slate-900">{user.fullName}</h2><p className="mt-1 text-sm text-slate-500">{user.gender} · {getAge(user.birthDate)} years</p></div><div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{user.phone}</p><p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0 text-slate-400" />{user.email}</p><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" />Born {formatDate(user.birthDate)}</p></div></div><div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-700"><ShieldAlert className="h-4 w-4" />Allergy alert</p><div className="mt-2"><TagList values={profile.allergies} empty="No allergies recorded" /></div></div><div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-red-600">Blood type</p><p className="mt-1 text-xl font-semibold text-red-800">{profile.bloodType || "Not recorded"}</p></div></aside>
      <main className="min-w-0"><div className="mb-5 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1.5">{tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === tab.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}</div>
        {currentTab?.id === "overview" && <Overview profile={profile} />}
        {currentTab?.id === "history" && <HistoryTab histories={patient.medicalHistories} />}
        {currentTab?.id === "attachments" && <AttachmentsTab attachments={patient.attachments} />}
        {currentTab?.id === "changes" && <ChangesTab changes={patient.profileChanges} />}
      </main>
    </div>
  </section>;
}

function Overview({ profile }) { return <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-900">Current clinical information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><ProfileGroup label="Chronic conditions" values={profile.chronicConditions} /><ProfileGroup label="Current medications" values={profile.currentMedications} /><ProfileGroup label="Past surgeries" values={profile.pastSurgeries} /><ProfileGroup label="Family history" values={profile.familyHistory} /><ProfileGroup label="Lifestyle" values={profile.lifestyleHabits} /><ProfileGroup label="Vaccinations" values={profile.vaccinationStatus} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-900">Additional information</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current symptoms</dt><dd className="mt-1 text-sm text-slate-700">{profile.currentSymptoms || "None recorded"}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Disability information</dt><dd className="mt-1 text-sm text-slate-700">{profile.disabilityInfo || "None recorded"}</dd></div>{profile.pregnancyStatus && <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pregnancy status</dt><dd className="mt-1 text-sm text-slate-700">{profile.pregnancyStatus.replaceAll("_", " ")}</dd></div>}</dl></section></div>; }

function HistoryTab({ histories }) { return histories.length ? <div className="space-y-4">{histories.map((history) => <article key={history.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium text-blue-700">{formatDate(history.date)} · {history.clinicName}</p><h2 className="mt-1 text-base font-semibold text-slate-900">{history.diagnosis}</h2><p className="mt-1 text-sm text-slate-500">{history.doctorName}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Visit #{history.appointmentId}</span></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Treatment plan</p><p className="mt-1 text-sm leading-6 text-slate-700">{history.treatmentPlan}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Doctor notes</p><p className="mt-1 text-sm leading-6 text-slate-700">{history.doctorNotes}</p></div></div><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prescribed medicines</p><div className="mt-2"><TagList values={history.medicines} /></div><p className="mt-3 text-xs text-slate-500">{history.attachmentCount} related attachment{history.attachmentCount === 1 ? "" : "s"}</p></div></article>)}</div> : <EmptyState title="No consultation history" description="Completed consultation records will appear here." />; }

function AttachmentsTab({ attachments }) { const profileFiles = attachments.filter((file) => file.source === "Profile"); const consultationFiles = attachments.filter((file) => file.source === "Consultation"); return attachments.length ? <div className="space-y-5"><FileGroup title="Profile attachments" files={profileFiles} /><FileGroup title="Consultation attachments" files={consultationFiles} /></div> : <EmptyState title="No attachments" description="Profile and consultation files will appear here." />; }
function FileGroup({ title, files }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-900">{title}</h2>{files.length ? <div className="mt-4 space-y-3">{files.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"><FileText className="h-5 w-5 text-blue-600" /><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{file.originalName}</p><p className="mt-0.5 text-xs text-slate-500">{file.type} · {file.size} · {formatDate(file.createdAt)}</p></div></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No files in this group.</p>}</section>; }
function ChangesTab({ changes }) { return changes.length ? <div className="space-y-3">{changes.map((change) => <article key={change.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold text-slate-900">{change.fieldName}</h2><p className="mt-1 text-sm text-slate-500">{change.changedBy} · {formatDate(change.createdAt)}</p></div><UserRound className="h-5 w-5 text-slate-400" /></div><p className="mt-3 text-sm text-slate-700"><span className="text-slate-400">From:</span> {change.oldValue || "Not recorded"}</p><p className="mt-1 text-sm text-slate-700"><span className="text-slate-400">To:</span> {change.newValue || "Not recorded"}</p><p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">{change.reason}</p></article>)}</div> : <EmptyState title="No profile changes" description="Medical profile updates will be listed here." />; }

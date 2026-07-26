import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  Paperclip,
  Pill,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react";

import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getPatientDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";
import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
  sharedSurfaceShell,
} from "@/components/shared/styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { patients } from "../Admin/PatientData";
import { getCurrentDoctorAppointments } from "./doctorPortalData";

export default function ConsultationPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const appointments = getCurrentDoctorAppointments();
  const appointment = appointments.find(
    (item) => String(item.id) === String(appointmentId)
  ) || appointments[0];

  const patient = patients.find(
    (item) => String(item.id) === String(appointment?.patientId)
  ) || patients[0];

  // Active workspace tab: "notes", "emr", "prescriptions", "tests"
  const [activeTab, setActiveTab] = useState("notes");

  // Vitals State
  const [vitals, setVitals] = useState({
    bp: "120/80 mmHg",
    pulse: "72 bpm",
    temp: "36.8 °C",
    weight: "70 kg",
  });

  // Clinical Notes & Diagnosis State
  const [chiefComplaint, setChiefComplaint] = useState(
    appointment?.reasonForVisit || "Patient reports discomfort and mild symptoms."
  );
  const [physicalExam, setPhysicalExam] = useState(
    "Patient presents conscious and alert. Cardiopulmonary auscultation normal. No acute distress."
  );
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Prescriptions State
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      medicineName: "Amoxicillin",
      dosage: "500mg",
      frequency: "Twice daily after meals",
      duration: "7 days",
      instructions: "Take with food and finish full course.",
    },
  ]);

  const [newPrescription, setNewPrescription] = useState({
    medicineName: "",
    dosage: "",
    frequency: "Once daily",
    duration: "7 days",
    instructions: "",
  });

  // Lab Tests State
  const [labOrders, setLabOrders] = useState([
    { id: 1, testName: "Complete Blood Count (CBC)", urgency: "routine" },
  ]);
  const [newTestName, setNewTestName] = useState("");
  const [newTestUrgency, setNewTestUrgency] = useState("routine");

  // Save / Complete Status
  const [saveMessage, setSaveMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(
    appointment?.status === "completed"
  );
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Handlers
  const handleAddPrescription = (e) => {
    e.preventDefault();
    if (!newPrescription.medicineName.trim()) return;

    setPrescriptions((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newPrescription,
      },
    ]);
    setNewPrescription({
      medicineName: "",
      dosage: "",
      frequency: "Once daily",
      duration: "7 days",
      instructions: "",
    });
  };

  const handleRemovePrescription = (id) => {
    setPrescriptions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddLabOrder = (e) => {
    e.preventDefault();
    if (!newTestName.trim()) return;

    setLabOrders((prev) => [
      ...prev,
      { id: Date.now(), testName: newTestName, urgency: newTestUrgency },
    ]);
    setNewTestName("");
  };

  const handleRemoveLabOrder = (id) => {
    setLabOrders((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveDraft = () => {
    setSaveMessage("Consultation draft saved successfully.");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleCompleteConsultation = () => {
    setIsCompleted(true);
    setShowCompleteModal(false);
    setSaveMessage("Consultation completed and saved to patient history!");
    setTimeout(() => {
      navigate("/doctor/appointments");
    }, 2000);
  };

  if (!appointment) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-slate-600">Appointment record not found.</p>
        <Button onClick={() => navigate("/doctor/appointments")}>
          Back to Appointments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Back Link and Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/doctor/appointments")}
            aria-label="Back to appointments"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Patient Consultation
              </h2>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                  <CheckCircle2 size={13} /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  <Activity size={13} /> In Progress
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Appointment #{appointment.id} &bull; {appointment.type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className="text-xs font-medium text-emerald-600 animate-fade-in">
              {saveMessage}
            </span>
          )}
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save size={16} />
            Save Draft
          </Button>
          <Button
            onClick={() => setShowCompleteModal(true)}
            disabled={isCompleted}
            className="gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
          >
            <CheckCircle2 size={16} />
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* Patient Header Banner */}
      <section className={sharedSurfaceShell}>
        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xl font-bold">
                {patient?.user?.full_name?.charAt(0) || "P"}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {getPatientDisplayName(appointment)}
                  </h3>
                  <AppointmentStatusBadge status={appointment.status} />
                  <AppointmentPriorityBadge priority={appointment.priority} />
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Gender: <strong>{patient?.user?.gender || "N/A"}</strong></span>
                  <span>Age: <strong>{patient?.user?.age || "N/A"} yrs</strong></span>
                  <span>Blood Type: <strong className="text-rose-600">{patient?.medicalProfile?.bloodType || "O+"}</strong></span>
                  <span>Phone: <strong>{patient?.user?.phone || "N/A"}</strong></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4 lg:border-t-0 lg:pt-0">
              <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-medium text-slate-500">BP</p>
                <input
                  type="text"
                  value={vitals.bp}
                  onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                  className="w-full text-center text-xs font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-medium text-slate-500">Pulse</p>
                <input
                  type="text"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                  className="w-full text-center text-xs font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-medium text-slate-500">Temp</p>
                <input
                  type="text"
                  value={vitals.temp}
                  onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                  className="w-full text-center text-xs font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-medium text-slate-500">Weight</p>
                <input
                  type="text"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className="w-full text-center text-xs font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Known Allergies Alert Banner if present */}
          {patient?.medicalProfile?.allergies && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
              <AlertCircle size={16} className="shrink-0 text-amber-600" />
              <span>
                <strong>Allergies Warning:</strong> {patient.medicalProfile.allergies}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-4 overflow-x-auto" aria-label="Consultation tabs">
          <button
            onClick={() => setActiveTab("notes")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "notes"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <Stethoscope size={17} />
            Clinical Notes & Diagnosis
          </button>

          <button
            onClick={() => setActiveTab("emr")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "emr"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <User size={17} />
            Patient EMR & Medical History
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "prescriptions"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <Pill size={17} />
            Prescriptions ({prescriptions.length})
          </button>

          <button
            onClick={() => setActiveTab("tests")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "tests"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <Paperclip size={17} />
            Lab Orders ({labOrders.length})
          </button>
        </nav>
      </div>

      {/* TAB CONTENT 1: CLINICAL NOTES & DIAGNOSIS */}
      {activeTab === "notes" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${sharedSurfaceShell} p-5 space-y-4`}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-[var(--color-primary)]" />
              Symptoms & Subjective Examination
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chief Complaint & Reported Symptoms
              </label>
              <textarea
                rows={3}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe chief complaint..."
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Examination Notes
              </label>
              <textarea
                rows={4}
                value={physicalExam}
                onChange={(e) => setPhysicalExam(e.target.value)}
                placeholder="Physical examination observations..."
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className={`${sharedSurfaceShell} p-5 space-y-4`}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse size={18} className="text-[var(--color-primary)]" />
              Diagnosis & Assessment
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Diagnosis <span className="text-rose-500">*</span>
              </label>
              <Input
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="e.g. Essential (primary) Hypertension / Acute Bronchitis"
                className="w-full bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Secondary / Differential Diagnoses
              </label>
              <Input
                value={secondaryDiagnosis}
                onChange={(e) => setSecondaryDiagnosis(e.target.value)}
                placeholder="e.g. Type 2 Diabetes Mellitus, Tension Headache"
                className="w-full bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Treatment Plan & Clinical Advice
              </label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Dietary changes, exercise, home monitoring instructions..."
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recommended Follow-up Visit Date
              </label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-white text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PATIENT EMR & MEDICAL HISTORY */}
      {activeTab === "emr" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className={profileCardShell}>
              <p className={profileCardLabel}>Blood Type</p>
              <p className={profileCardValue}>{patient?.medicalProfile?.bloodType || "N/A"}</p>
            </div>
            <div className={profileCardShell}>
              <p className={profileCardLabel}>Allergies</p>
              <p className={profileCardValue}>{patient?.medicalProfile?.allergies || "None reported"}</p>
            </div>
            <div className={profileCardShell}>
              <p className={profileCardLabel}>Chronic Conditions</p>
              <p className={profileCardValue}>{patient?.medicalProfile?.chronicConditions || "None"}</p>
            </div>
            <div className={profileCardShell}>
              <p className={profileCardLabel}>Past Surgeries</p>
              <p className={profileCardValue}>{patient?.medicalProfile?.pastSurgeries || "None"}</p>
            </div>
            <div className={profileCardShell}>
              <p className={profileCardLabel}>Family History</p>
              <p className={profileCardValue}>{patient?.medicalProfile?.familyHistory || "Unremarkable"}</p>
            </div>
            <div className={profileCardShell}>
              <p className={profileCardLabel}>Current Medications</p>
              <p className={profileCardValue}>{patient?.medicalProfile?.currentMedications || "None"}</p>
            </div>
          </div>

          <div className={sharedSurfaceShell}>
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-base font-bold text-slate-900">
                Previous Medical Visit Logs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                History of prior consultations and diagnosed conditions.
              </p>
            </div>

            <div className="divide-y divide-slate-100 p-5 space-y-4">
              <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-primary)]">
                    2026-05-14 &bull; Follow-up Visit
                  </span>
                  <span className="text-xs text-slate-500">Dr. Sarah Jenkins</span>
                </div>
                <p className="text-xs font-medium text-slate-800">
                  Diagnosis: Mild Upper Respiratory Tract Infection
                </p>
                <p className="text-xs text-slate-600">
                  Prescribed Paracetamol 500mg and advised rest and oral fluids for 5 days.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-primary)]">
                    2026-02-10 &bull; Annual Check-up
                  </span>
                  <span className="text-xs text-slate-500">Dr. Michael Chen</span>
                </div>
                <p className="text-xs font-medium text-slate-800">
                  Diagnosis: Routine Physical Examination
                </p>
                <p className="text-xs text-slate-600">
                  Normal cardiovascular and abdominal examination. Blood pressure 118/76.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PRESCRIPTIONS */}
      {activeTab === "prescriptions" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className={`${sharedSurfaceShell} p-5 space-y-4`}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill size={18} className="text-[var(--color-primary)]" />
              Current Prescription List
            </h3>

            {prescriptions.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
                <Pill size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">
                  No medications prescribed yet.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Use the form on the right to add medications for this visit.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:bg-slate-100/80"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.medicineName}
                        </span>
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                          {item.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Frequency:</strong> {item.frequency} &bull; <strong>Duration:</strong> {item.duration}
                      </p>
                      {item.instructions && (
                        <p className="text-xs text-slate-500 italic">
                          "{item.instructions}"
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePrescription(item.id)}
                      className="text-slate-400 hover:text-rose-600"
                      aria-label="Remove prescription"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAddPrescription} className={`${sharedSurfaceShell} p-5 space-y-4`}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus size={18} className="text-[var(--color-primary)]" />
              Add Prescription Item
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={newPrescription.medicineName}
                onChange={(e) =>
                  setNewPrescription({ ...newPrescription, medicineName: e.target.value })
                }
                placeholder="e.g. Amoxicillin / Paracetamol"
                className="w-full bg-white text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dosage
                </label>
                <Input
                  value={newPrescription.dosage}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, dosage: e.target.value })
                  }
                  placeholder="e.g. 500mg"
                  className="w-full bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration
                </label>
                <Input
                  value={newPrescription.duration}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, duration: e.target.value })
                  }
                  placeholder="e.g. 7 days"
                  className="w-full bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Frequency
              </label>
              <NativeSelect
                value={newPrescription.frequency}
                onChange={(e) =>
                  setNewPrescription({ ...newPrescription, frequency: e.target.value })
                }
                className="w-full bg-white text-sm"
              >
                <NativeSelectOption value="Once daily">Once daily</NativeSelectOption>
                <NativeSelectOption value="Twice daily after meals">Twice daily after meals</NativeSelectOption>
                <NativeSelectOption value="Three times daily">Three times daily</NativeSelectOption>
                <NativeSelectOption value="Every 8 hours">Every 8 hours</NativeSelectOption>
                <NativeSelectOption value="As needed for pain">As needed for pain</NativeSelectOption>
              </NativeSelect>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Instructions
              </label>
              <Input
                value={newPrescription.instructions}
                onChange={(e) =>
                  setNewPrescription({ ...newPrescription, instructions: e.target.value })
                }
                placeholder="Take before sleep / Take with food..."
                className="w-full bg-white text-sm"
              />
            </div>

            <Button type="submit" className="w-full gap-2 bg-[var(--color-primary)] text-white">
              <Plus size={16} />
              Add Medication
            </Button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 4: LAB ORDERS & ATTACHMENTS */}
      {activeTab === "tests" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${sharedSurfaceShell} p-5 space-y-4`}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Paperclip size={18} className="text-[var(--color-primary)]" />
              Requested Lab Tests & Scans
            </h3>

            {labOrders.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No lab tests ordered yet.</p>
            ) : (
              <div className="space-y-2">
                {labOrders.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{test.testName}</p>
                      <span className="text-[11px] capitalize text-slate-500">
                        Urgency: <strong>{test.urgency}</strong>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLabOrder(test.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddLabOrder} className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-bold text-slate-700">Order New Test</p>
              <div className="flex gap-2">
                <Input
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="e.g. ECG / Chest X-Ray / Lipid Profile"
                  className="flex-1 bg-white text-sm"
                />
                <NativeSelect
                  value={newTestUrgency}
                  onChange={(e) => setNewTestUrgency(e.target.value)}
                  className="w-32 bg-white text-sm"
                >
                  <NativeSelectOption value="routine">Routine</NativeSelectOption>
                  <NativeSelectOption value="urgent">Urgent</NativeSelectOption>
                  <NativeSelectOption value="stat">STAT</NativeSelectOption>
                </NativeSelect>
                <Button type="submit" className="bg-[var(--color-primary)] text-white">
                  Add
                </Button>
              </div>
            </form>
          </div>

          <div className={`${sharedSurfaceShell} p-5 space-y-4`}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-[var(--color-primary)]" />
              Medical Attachments & Files
            </h3>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
              <Paperclip size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Drag & drop medical files or click to upload
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDF, DICOM, PNG, JPG (max 10MB)
              </p>
              <Button variant="outline" size="sm" className="mt-3 text-xs">
                Browse Files
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE CONSULTATION CONFIRMATION MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Complete Consultation?
                </h3>
                <p className="text-xs text-slate-500">
                  This will finalize the diagnosis, prescription, and visit notes.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 text-slate-700 border border-slate-200">
              <p><strong>Patient:</strong> {getPatientDisplayName(appointment)}</p>
              <p><strong>Primary Diagnosis:</strong> {primaryDiagnosis || "Not specified"}</p>
              <p><strong>Prescriptions Added:</strong> {prescriptions.length} items</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCompleteConsultation}
                className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
              >
                <CheckCircle2 size={16} />
                Confirm & Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

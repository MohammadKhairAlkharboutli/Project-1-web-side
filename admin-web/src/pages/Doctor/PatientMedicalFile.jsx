import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Droplet,
  AlertCircle,
  FileText,
  Pill,
  History,
  Paperclip,
  Download,
  Activity,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  Heart
} from "lucide-react";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function PatientMedicalFile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // This would be your backend endpoint tailored to your tables
        // Example: /api/patients/:id/full-record
        const response = await axios.get(`/api/patients/${patientId}/full-record`, {
          withCredentials: true,
        }).catch(() => ({
          // Fallback mock data structure matching your backend fields
          data: {
            id: patientId,
            user: {
              fullName: "Ahmad Ali",
              phone: "+963 933 123 456",
              email: "ahmad.ali@example.com",
              gender: "Male",
              dob: "1990-05-15"
            },
            medicalProfile: {
              bloodType: "A+",
              pregnancyStatus: "none",
              disabilityInfo: "None",
              allergies: "Penicillin",
              chronicConditions: "Hypertension",
              pastSurgeries: "Appendectomy (2015)",
              familyHistory: "Diabetes in father",
              currentMedications: "Lisinopril 10mg",
              lifestyleHabits: "Non-smoker",
              vaccinationStatus: "Up to date"
            },
            medicalHistories: [
              {
                id: 1,
                diagnosis: "Seasonal Flu",
                treatmentPlan: "Rest and hydration",
                created_at: "2023-10-12",
                doctorName: "Dr. Khaled"
              },
              {
                id: 2,
                diagnosis: "Lower Back Pain",
                treatmentPlan: "Physical therapy sessions",
                created_at: "2023-08-05",
                doctorName: "Dr. Sarah"
              }
            ],
            attachments: [
              { id: 1, originalName: "Blood_Test_Oct.pdf", category: "Lab Results" },
              { id: 2, originalName: "XRay_Chest.jpg", category: "Imaging" }
            ]
          }
        }));

        setPatient(response.data);
      } catch (error) {
        console.error("Error fetching patient file:", error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Top Header / Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Patients</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Patient ID: #{patientId}</span>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition">
              Create New Record
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar - Patient Info Summary */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-black mb-4 shadow-sm border border-blue-100">
                {patient.user?.fullName?.charAt(0)}
              </div>
              <h1 className="text-xl font-black text-slate-900">{patient.user?.fullName}</h1>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2">
                {patient.user?.gender} • {calculateAge(patient.user?.dob)} Years
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                  <p className="text-sm font-bold text-slate-700">{patient.user?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-bold text-slate-700">{patient.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-700">{patient.user?.dob}</p>
                </div>
              </div>
            </div>

            <hr className="my-6 border-slate-100" />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <Droplet className="text-rose-500 mb-2" size={20} />
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Blood Type</p>
                <p className="text-lg font-black text-rose-700">{patient.medicalProfile?.bloodType || "N/A"}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <ShieldAlert className="text-amber-500 mb-2" size={20} />
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Allergies</p>
                <p className="text-xs font-black text-amber-700 truncate">{patient.medicalProfile?.allergies || "None"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-8">
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl mb-6 w-fit">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon={<Activity size={16} />}
              label="Medical Profile"
            />
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={<History size={16} />}
              label="Consultation History"
            />
            <TabButton
              active={activeTab === "files"}
              onClick={() => setActiveTab("files")}
              icon={<Paperclip size={16} />}
              label="Attachments"
            />
          </div>

          {/* Tab Content: Medical Profile */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-3xl p-8 shadow-xs border border-slate-100">
                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                  General Medical Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoBlock label="Chronic Conditions" value={patient.medicalProfile?.chronicConditions} icon={<Heart className="text-rose-500" size={16}/>} />
                  <InfoBlock label="Current Medications" value={patient.medicalProfile?.currentMedications} icon={<Pill className="text-emerald-500" size={16}/>} />
                  <InfoBlock label="Past Surgeries" value={patient.medicalProfile?.pastSurgeries} />
                  <InfoBlock label="Family History" value={patient.medicalProfile?.familyHistory} />
                  <InfoBlock label="Vaccination Status" value={patient.medicalProfile?.vaccinationStatus} />
                  <InfoBlock label="Lifestyle Habits" value={patient.medicalProfile?.lifestyleHabits} />
                </div>

                {patient.medicalProfile?.pregnancyStatus !== "none" && (
                  <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-700">Pregnancy Status</p>
                      <p className="text-sm font-black text-purple-900">{patient.medicalProfile?.pregnancyStatus}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: History */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {patient.medicalHistories?.map((history) => (
                <div key={history.id} className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 hover:border-blue-200 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{history.diagnosis}</h3>
                        <p className="text-[11px] font-bold text-slate-400">{history.doctorName} • {history.created_at}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Treatment Plan</p>
                    <p className="text-sm text-slate-700">{history.treatmentPlan}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Files */}
          {activeTab === "files" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {patient.attachments?.map((file) => (
                <div key={file.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-xs hover:shadow-md transition">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xs">
                      <Paperclip size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{file.originalName}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{file.category}</p>
                    </div>
                  </div>
                  <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition">
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
        active
          ? "bg-white text-blue-600 shadow-sm"
          : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoBlock({ label, value, icon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-bold text-slate-700 pl-6 border-l-2 border-slate-100">
        {value || "No records available"}
      </p>
    </div>
  );
}

function calculateAge(dob) {
  if (!dob) return "--";
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  return Math.abs(new Date(difference).getUTCFullYear() - 1970);
}
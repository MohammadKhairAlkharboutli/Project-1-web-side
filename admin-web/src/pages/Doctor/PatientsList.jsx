// File: PatientsList.jsx

import { useState, useEffect } from "react";
import { User, Phone, Mail, Search, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Temporary mock data for testing and display
const MOCK_PATIENTS = [
  { id: 1, appointmentId: 101, name: "Ahmad Mohammad Ali", gender: "Male", age: 34, phone: "+963 933 123 456", email: "ahmad.ali@example.com" },
  { id: 2, appointmentId: 102, name: "Fatima Hassan Ibrahim", gender: "Female", age: 28, phone: "+963 944 987 654", email: "fatima.hassan@example.com" },
  { id: 3, appointmentId: 103, name: "Omar Khaled Al-Mahmoud", gender: "Male", age: 42, phone: "+963 955 456 789", email: "omar.mahmoud@example.com" },
  { id: 4, appointmentId: 104, name: "Sara Abdullah Khoury", gender: "Female", age: 25, phone: "+963 988 321 654", email: "sara.khoury@example.com" },
  { id: 5, appointmentId: 105, name: "Samer Tarek Al-Abdullah", gender: "Male", age: 50, phone: "+963 991 789 123", email: "samer.abdullah@example.com" },
];

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Simulate fetching data
  useEffect(() => {
    const timer = setTimeout(() => {
      setPatients(MOCK_PATIENTS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-100/60 p-4 sm:p-6 min-h-screen">
      {/* Page Header and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Patients List</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Manage and view patient medical records and attachments
          </p>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-left"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Patients Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((patient) => {
          const initials = patient.name
            ? patient.name.split(" ").map((n) => n[0]).join("").toUpperCase()
            : "P";

          return (
            <div
              key={patient.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-sm font-bold shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                        {patient.gender || "Patient"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 py-3.5 border-t border-slate-100 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span dir="ltr" className="text-left">{patient.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{patient.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-400 font-semibold">
                  {patient.age ? `${patient.age} years` : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl gap-1.5 p-2 h-auto"
                  onClick={() => navigate(`/doctor/medical-history/${patient.appointmentId || patient.id}`)}
                >
                  <span>View File</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/60 shadow-xs">
          <User size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">No matching patients found.</p>
        </div>
      )}
    </div>
  );
}
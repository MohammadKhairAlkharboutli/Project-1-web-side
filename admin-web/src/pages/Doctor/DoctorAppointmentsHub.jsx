import { CalendarDays, Stethoscope } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import DoctorAppointments from "./Appointments";
import DoctorOperationsTab from "./DoctorOperationsTab";

const tabs = [
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "operations", label: "Operations", icon: Stethoscope },
];

export default function DoctorAppointmentsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "operations" ? "operations" : "appointments";

  function chooseTab(tab) {
    setSearchParams(tab === "operations" ? { tab } : {});
  }

  return <div className="space-y-5"><nav className="flex w-fit gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1.5" aria-label="Appointment views">{tabs.map((tab) => {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return <button key={tab.id} type="button" onClick={() => chooseTab(tab.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><Icon className="h-4 w-4" />{tab.label}</button>;
  })}</nav>{activeTab === "operations" ? <DoctorOperationsTab /> : <DoctorAppointments />}</div>;
}

import { useMemo, useState, useRef, useEffect } from "react";
import { clinics } from "../Admin/ClinicData";
import { getCurrentDoctorScheduleSlots } from "./doctorPortalData";
import { doctorSchedulesApi } from "@/api/doctorSchedulesApi";
import {
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CalendarClock,
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getSlotClinicId(slot) {
  return slot.clinicId ?? slot.clinic?.id;
}

const DAYS_OF_WEEK = [
  { key: 0, label: "Sunday" },
  { key: 1, label: "Monday" },
  { key: 2, label: "Tuesday" },
  { key: 3, label: "Wednesday" },
  { key: 4, label: "Thursday" },
  { key: 5, label: "Friday" },
  { key: 6, label: "Saturday" },
];

const SCHEDULE_TYPES = ["NORMAL", "BREAK", "EMERGENCY", "OPERATION"];

export default function DoctorSchedule() {
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [activeDayKey, setActiveDayKey] = useState(new Date().getDay());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Request Modal State
  const [showRequestModal, setShowNewModal] = useState(false);
  const [requestSlots, setRequestSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await doctorSchedulesApi.getOwnSchedule();
      setScheduleSlots(data);

      // Auto-select first clinic if not selected
      if (data.length > 0 && !selectedClinicId) {
        const firstClinicId = getSlotClinicId(data[0]);
        setSelectedClinicId(String(firstClinicId));
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      // Fallback to mock if API fails
      setScheduleSlots(getCurrentDoctorScheduleSlots());
    } finally {
      setLoading(false);
    }
  };

  const clinicIds = new Set(
    scheduleSlots
      .map((slot) => getSlotClinicId(slot))
      .filter((clinicId) => clinicId !== undefined && clinicId !== null),
  );

  const clinicOptions = clinics.filter((clinic) => clinicIds.has(clinic.id));

  const selectedClinic = clinicOptions.find(
    (clinic) => String(clinic.id) === selectedClinicId,
  ) || (clinicOptions.length > 0 ? clinicOptions[0] : null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSlots = useMemo(
    () =>
      selectedClinicId
        ? scheduleSlots.filter(
            (slot) => String(getSlotClinicId(slot)) === selectedClinicId,
          )
        : scheduleSlots,
    [scheduleSlots, selectedClinicId],
  );

  const slotsByDay = useMemo(() => {
    const map = {};
    DAYS_OF_WEEK.forEach((d) => {
      map[d.key] = [];
    });

    filteredSlots.forEach((slot) => {
      const dayIndex = slot.dayOfWeek ?? 0;
      if (map[dayIndex]) {
        map[dayIndex].push(slot);
      }
    });

    return map;
  }, [filteredSlots]);

  const activeDaySlots = slotsByDay[activeDayKey] || [];
  const activeDayLabel = DAYS_OF_WEEK.find((d) => d.key === activeDayKey)?.label || "Sunday";

  // Handle opening the change request modal
  const handleOpenRequestModal = () => {
    // Pre-populate with current slots for that day/clinic
    const currentSlots = activeDaySlots.map(s => ({
      startTime: s.startTime.substring(0, 5), // Normalize HH:mm:ss to HH:mm
      endTime: s.endTime.substring(0, 5),
      type: s.type || "NORMAL",
      notes: s.notes || ""
    }));
    setRequestSlots(currentSlots.length > 0 ? currentSlots : [{ startTime: "09:00", endTime: "17:00", type: "NORMAL", notes: "" }]);
    setRequestError("");
    setShowNewModal(true);
  };

  const handleAddSlot = () => {
    setRequestSlots([...requestSlots, { startTime: "09:00", endTime: "17:00", type: "NORMAL", notes: "" }]);
  };

  const handleRemoveSlot = (index) => {
    setRequestSlots(requestSlots.filter((_, i) => i !== index));
  };

  const handleUpdateSlot = (index, field, value) => {
    const newSlots = [...requestSlots];
    newSlots[index][field] = value;
    setRequestSlots(newSlots);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setRequestError("");

    if (requestSlots.length === 0) {
      setRequestError("You must have at least one slot defined.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        clinicId: Number(selectedClinicId),
        dayOfWeek: activeDayKey,
        isActive: true,
        slots: requestSlots
      };

      const result = await doctorSchedulesApi.createOrUpdateSchedule(payload);

      window.alert(result.message || "Schedule change request submitted successfully.");
      setShowNewModal(false);
      fetchSchedule(); // Refresh data
    } catch (err) {
      console.error("Failed to submit schedule request:", err);
      setRequestError(err.response?.data?.message || "Failed to submit request. Please ensure slots do not overlap.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased p-6 lg:p-8" dir="ltr">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Full Blue Gradient Banner */}
        <div className="relative bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] rounded-[24px] px-6 py-5 sm:px-8 sm:py-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="relative z-10 space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur-md border border-white/30 text-white shadow-xs w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TABIBI PORTAL
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Doctor Schedule
            </h1>
            <p className="text-xs text-blue-100 font-medium max-w-xl">
              Manage and review your weekly operational hours across your clinics.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Clinic Dropdown */}
            <div className="relative z-50 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-inner" ref={dropdownRef}>
              <span className="text-xs font-bold text-white px-1 whitespace-nowrap">Clinic:</span>

              <div className="relative w-full sm:w-64">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs sm:text-sm py-2 px-3.5 font-bold shadow-sm transition-all flex items-center justify-between cursor-pointer border border-white/20 backdrop-blur-sm"
                >
                  <span className="truncate">{selectedClinic?.name || "Select Clinic"}</span>
                  <svg
                    className={`w-4 h-4 text-white/80 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl py-2 z-[9999]">
                    {clinicOptions.map((clinic) => {
                      const isSelected = String(clinic.id) === selectedClinicId;
                      return (
                        <button
                          key={clinic.id}
                          type="button"
                          onClick={() => {
                            setSelectedClinicId(String(clinic.id));
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-[#1e61dc]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span className="truncate">{clinic.name}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#1e61dc]"></span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleOpenRequestModal}
              disabled={!selectedClinicId}
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-2xl px-6 py-6 h-auto font-bold shadow-lg shadow-black/5 gap-2 border-none"
            >
              <CalendarClock size={20} />
              <span>Request Change</span>
            </Button>
          </div>
        </div>

        {/* Days Navigation Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const count = (slotsByDay[key] || []).length;
            const isSelected = activeDayKey === key;

            return (
              <button
                key={key}
                onClick={() => setActiveDayKey(key)}
                className={`flex items-center justify-between gap-3 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] text-white border-blue-300 shadow-md shadow-blue-500/20 scale-[1.02]"
                    : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:border-slate-200 shadow-xs"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : count > 0
                      ? "bg-sky-50 text-sky-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Day Content Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">{activeDayLabel} Schedule</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clinic: <span className="font-bold text-slate-700">{selectedClinic?.name || "Selected Clinic"}</span>
              </p>
            </div>
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs">
              {activeDaySlots.length} Active Slots
            </span>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : activeDaySlots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeDaySlots.map((slot, idx) => (
                <div
                  key={slot.id || idx}
                  className="bg-gradient-to-br from-slate-50/90 via-white to-sky-50/30 p-5 rounded-2xl border border-slate-200/90 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 space-y-3 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-100/70 flex items-center justify-center text-[#1e61dc] group-hover:bg-[#1e61dc] group-hover:text-white transition-colors shadow-2xs">
                        <Clock size={16} />
                      </div>
                      <span className="text-slate-900 text-sm font-extrabold tracking-tight">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    {slot.type && (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-sky-100/60 text-sky-700 border border-sky-200/50 uppercase tracking-wider">
                        {slot.type}
                      </span>
                    )}
                  </div>

                  {slot.notes ? (
                    <p className="text-xs text-slate-600 font-medium pl-10 border-l-2 border-sky-200">
                      {slot.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic pl-10">
                      No additional notes provided.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-700">No shifts scheduled for {activeDayLabel}</p>
              <p className="text-xs text-slate-400">There are no operational hours assigned for this clinic on this specific day.</p>
            </div>
          )}
        </div>

      </div>

      {/* Schedule Change Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-[#f8fafc]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <CalendarClock size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Request Schedule Change</h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      {activeDayLabel} • {selectedClinic?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-2.5 hover:bg-slate-200/50 rounded-xl text-slate-400 transition-colors"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-8 space-y-6">

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-xs font-bold leading-relaxed">
                <Info size={20} className="shrink-0 text-blue-500" />
                <p>
                  Submitting this form will create a change request for the Admin to approve.
                  Your current schedule for this day will remain active until the request is reviewed.
                </p>
              </div>

              {requestError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                  <AlertCircle size={20} />
                  <span>{requestError}</span>
                </div>
              )}

              <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                {requestSlots.map((slot, index) => (
                  <div key={index} className="relative bg-slate-50/50 p-5 rounded-2xl border border-slate-200 group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Times</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleUpdateSlot(index, "startTime", e.target.value)}
                            className="h-10 rounded-xl font-bold bg-white text-xs"
                            required
                          />
                          <span className="text-slate-400">-</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleUpdateSlot(index, "endTime", e.target.value)}
                            className="h-10 rounded-xl font-bold bg-white text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Shit Type</label>
                        <select
                          value={slot.type}
                          onChange={(e) => handleUpdateSlot(index, "type", e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {SCHEDULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Notes</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Optional notes"
                            value={slot.notes}
                            onChange={(e) => handleUpdateSlot(index, "notes", e.target.value)}
                            className="h-10 rounded-xl font-bold bg-white text-xs flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveSlot(index)}
                            className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSlot}
                  className="flex-1 h-14 rounded-2xl font-bold border-slate-200 text-slate-600 gap-2 hover:bg-slate-50"
                >
                  <Plus size={20} />
                  <span>Add Another Slot</span>
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  <span>{submitting ? 'Submitting Request...' : 'Submit Request'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

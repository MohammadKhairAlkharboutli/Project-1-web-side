import React, { useState } from "react";
import { 
  CalendarOff, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DoctorLeaves() {
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      date: "2026-08-10",
      isPartial: false,
      startTime: "",
      endTime: "",
      reason: "Annual Family Vacation",
      status: "Approved"
    },
    {
      id: 2,
      date: "2026-08-15",
      isPartial: true,
      startTime: "10:00",
      endTime: "13:00",
      reason: "Dentist Appointment",
      status: "Pending"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState("");
  const [isPartial, setIsPartial] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const handleAddLeave = (e) => {
    e.preventDefault();
    if (!leaveDate || !reason) return;

    const newLeave = {
      id: Date.now(),
      date: leaveDate,
      isPartial,
      startTime: isPartial ? startTime : "",
      endTime: isPartial ? endTime : "",
      reason,
      status: "Pending"
    };

    setLeaves([newLeave, ...leaves]);
    setIsModalOpen(false);
    // Reset form
    setLeaveDate("");
    setIsPartial(false);
    setStartTime("");
    setEndTime("");
    setReason("");
  };

  const handleDelete = (id) => {
    setLeaves(leaves.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. رأس الصفحة (تم تصغير الارتفاع بتغيير الـ padding إلى p-6) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-6 rounded-3xl text-white shadow-lg shadow-[#1e61dc]/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold tracking-wide">
            <CalendarOff size={14} /> Time-Off & Exceptions Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Doctor Leaves</h1>
          <p className="text-blue-100 text-xs sm:text-sm font-medium max-w-xl">
            Manage your requested leaves, schedule exceptions, and time-off hours smoothly within the clinical system.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-[#1e61dc] hover:bg-blue-50 font-bold text-xs px-5 py-5 rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 z-10 cursor-pointer"
        >
          <Plus size={18} />
          <span>Request New Leave</span>
        </Button>
      </div>

      {/* 2. جدول السجلات */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Submitted Leave Requests</h2>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
            Total: {leaves.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Duration / Hours</th>
                <th className="py-4 px-6">Reason</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-semibold">
                    No leave requests found. Click "Request New Leave" to add one.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar size={15} className="text-[#1e61dc]" />
                      {leave.date}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        leave.isPartial ? "bg-amber-50 text-amber-700 border border-amber-200/50" : "bg-blue-50 text-[#1e61dc] border border-blue-200/50"
                      }`}>
                        {leave.isPartial ? "Partial Hours" : "Full Day"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {leave.isPartial ? (
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Clock size={14} className="text-slate-400" />
                          {leave.startTime} - {leave.endTime}
                        </span>
                      ) : (
                        "Full Day Shift"
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate">{leave.reason}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold ${
                        leave.status === "Approved" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {leave.status === "Approved" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(leave.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Request"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. نافذة الإضافة (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Request New Leave</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Exception Date</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#1e61dc] transition-all"
                />
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="isPartial"
                  checked={isPartial}
                  onChange={(e) => setIsPartial(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#1e61dc] border-slate-300 focus:ring-[#1e61dc] cursor-pointer"
                />
                <label htmlFor="isPartial" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Partial Leave (Specific Hours)
                </label>
              </div>

              {isPartial && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#1e61dc] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#1e61dc] transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason / Notes</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for your leave..."
                  required
                  rows="3"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1e61dc] transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#1e61dc]/25 transition-all cursor-pointer"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
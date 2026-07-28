import React, { useState, useEffect } from 'react';
import {
  Send,
  Search,
  Filter,
  Plus,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { referralsApi } from "@/api/referralsApi";
import { doctorsApi } from "@/api/doctorsApi";
import { clinicsApi } from "@/api/clinicsApi";
import { Loader2 } from "lucide-react";

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  // Form State
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patientId: "",
    type: "EXTERNAL",
    reason: "",
    toClinicId: "",
    toDoctorId: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReferrals();
    fetchLookups();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const data = await referralsApi.getDoctorReferrals();
      setReferrals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      // Fallback mock data if API fails
      setReferrals([
        {
          id: 1,
          type: 'EXTERNAL',
          status: 'PENDING',
          reason: 'Specialized cardiac evaluation required',
          created_at: '2023-11-20',
          patient: { user: { fullName: 'Ahmad Mohammad' } },
          toClinic: { name: 'Cardiology Center' },
          toDoctor: { user: { fullName: 'Dr. Sarah Wilson' } }
        },
        {
          id: 2,
          type: 'FOLLOW_UP',
          status: 'COMPLETED',
          reason: 'Routine post-surgery follow up',
          created_at: '2023-11-15',
          patient: { user: { fullName: 'Sara Ibrahim' } },
          toClinic: { name: 'Main Surgery Clinic' },
          toDoctor: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [clinicsData, doctorsData] = await Promise.all([
        clinicsApi.getClinics(),
        doctorsApi.getDoctors()
      ]);
      setClinics(clinicsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching lookups:", error);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patientId || !formData.reason) {
      setError("Please fill in all required fields (Patient ID and Reason).");
      return;
    }

    try {
      setSubmitting(true);
      await referralsApi.createReferral({
        ...formData,
        patientId: Number(formData.patientId),
        toClinicId: formData.toClinicId ? Number(formData.toClinicId) : undefined,
        toDoctorId: formData.toDoctorId ? Number(formData.toDoctorId) : undefined,
      });

      setShowNewModal(false);
      setFormData({
        patientId: "",
        type: "EXTERNAL",
        reason: "",
        toClinicId: "",
        toDoctorId: ""
      });
      fetchReferrals();
      window.alert("Referral sent successfully");
    } catch (error) {
      console.error("Failed to create referral:", error);
      setError("Failed to create referral. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReferrals = referrals.filter(r =>
    r.patient?.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Referrals</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track and manage patient referrals to other departments or specialists
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-6 h-auto font-bold shadow-lg shadow-blue-500/20 gap-2"
        >
          <Plus size={20} />
          <span>New Referral</span>
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Referrals" value={referrals.length} icon={<Send className="text-blue-500" />} color="blue" />
        <StatCard label="Pending" value={referrals.filter(r => r.status === 'PENDING').length} icon={<Clock className="text-amber-500" />} color="amber" />
        <StatCard label="Completed" value={referrals.filter(r => r.status === 'COMPLETED').length} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search patient or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl text-sm"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 px-5 rounded-2xl border-slate-200/60 text-slate-600 gap-2">
            <Filter size={18} />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/60">
            <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500">Loading referrals...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/60 text-center px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Send size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No referrals found</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2">You haven't made any referrals that match your criteria yet.</p>
          </div>
        ) : (
          filteredReferrals.map((referral) => (
            <div key={referral.id} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">{referral.patient?.user?.fullName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          referral.type === 'EXTERNAL' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {referral.type}
                        </span>
                        <span className="text-slate-400 text-[11px]">•</span>
                        <span className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
                          <Calendar size={12} /> {referral.created_at}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    referral.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                    referral.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {referral.status}
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Reason for Referral</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{referral.reason}</p>
                </div>
              </div>

              <div className="w-px bg-slate-100 hidden md:block"></div>

              <div className="md:w-72 flex flex-col justify-between py-1">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Refer To</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <Building2 size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{referral.toClinic?.name || "General Facility"}</p>
                      <p className="text-[11px] text-slate-500">Clinic / Department</p>
                    </div>
                  </div>
                  {referral.toDoctor && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Stethoscope size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{referral.toDoctor?.user?.fullName}</p>
                        <p className="text-[11px] text-slate-500">Specialist</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Button variant="ghost" className="flex-1 h-10 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 gap-2">
                    <MoreHorizontal size={16} />
                    Details
                  </Button>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100">
                    <ExternalLink size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Referral Modal (simplified as a separate view or real modal) */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">New Patient Referral</h2>
                  <p className="text-sm text-slate-500 mt-1">Fill out the details to refer a patient</p>
                </div>
                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateReferral} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Referral Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="EXTERNAL">External (New Specialist)</option>
                    <option value="FOLLOW_UP">Follow-up (Internal)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Patient ID</label>
                  <Input
                    placeholder="Enter Patient ID"
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="h-12 bg-slate-50 border-slate-200 rounded-2xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Target Clinic</label>
                  <select
                    value={formData.toClinicId}
                    onChange={(e) => setFormData({...formData, toClinicId: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Clinic (Optional)</option>
                    {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Target Doctor</label>
                  <select
                    value={formData.toDoctorId}
                    onChange={(e) => setFormData({...formData, toDoctorId: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Doctor (Optional)</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.fullName || d.user?.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Reason for Referral</label>
                <textarea
                  rows={4}
                  placeholder="Provide clinical reasons and notes for this referral..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  <span>{submitting ? 'Sending...' : 'Send Referral'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100",
    amber: "bg-amber-50 border-amber-100",
    emerald: "bg-emerald-50 border-emerald-100"
  };

  return (
    <div className={`p-6 rounded-[32px] border ${colorClasses[color]} flex items-center justify-between shadow-xs`}>
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
        {React.cloneElement(icon, { size: 28 })}
      </div>
    </div>
  );
}

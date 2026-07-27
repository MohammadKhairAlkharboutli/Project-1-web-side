import { useState, useEffect, useRef } from "react";
import { Loader2, Sliders, AlertCircle, ChevronDown } from "lucide-react";
import {
  formatCurrency,
  formatDoctorStatus,
  formatEnumLabel,
  formatLanguagesSpoken,
} from "../Admin/Doctors/doctorUtils";

// --- 1. Sub-component: View Mode ---
function DoctorViewProfile({ doctor, onEditClick, completionStatus }) {
  const fullName = doctor?.user?.full_name || "Doctor Name";
  const isComplete = completionStatus?.isComplete ?? true;

  return (
    <div className="space-y-8">
      
      {/* Incomplete profile warning banner */}
      {!isComplete && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Profile Incomplete</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Please complete your profile information to activate all clinical features ({Math.round(completionStatus?.completionPercentage || 0)}% completed).
              </p>
            </div>
          </div>
          <button
            onClick={onEditClick}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Edit Profile Action Button */}
      <div className="flex justify-end">
        <button
          onClick={onEditClick}
          className="bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sliders size={14} />
          <span>Complete Profile</span>
        </button>
      </div>

      {/* Executive Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-br from-[#1e61dc] to-[#3b9df5]" />

        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-1 shadow-md overflow-hidden">
              <img
                src={doctor?.user?.avatar || doctor?.photo || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
                alt={fullName}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-[#1e61dc] text-xs font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1e61dc]" />
              {doctor?.specialization || "Specialist Practitioner"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {fullName}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {doctor?.subSpecialization ? doctor.subSpecialization : "Clinical Operations & Patient Services"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
          <div className="bg-blue-50/50 border border-blue-100 px-5 py-3 rounded-xl text-center min-w-[100px]">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">Rating</span>
            <span className="text-sm font-black text-[#1e61dc] mt-0.5 block">★ {doctor?.averageRating?.toFixed(1) || "0.0"}</span>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 px-5 py-3 rounded-xl text-center min-w-[100px]">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">Clinics</span>
            <span className="text-sm font-black text-[#1e61dc] mt-0.5 block">{doctor?.clinics_count || 0} Units</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/60 px-5 py-3 rounded-xl text-center min-w-[110px]">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Status</span>
            <span className="text-sm font-black text-emerald-700 mt-0.5 block">{formatDoctorStatus(doctor?.status)}</span>
          </div>
        </div>
      </div>

      {/* Structured Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">Professional Biography</h3>
              <span className="text-xs font-mono text-slate-400">Overview</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-normal bg-blue-50/30 p-5 rounded-2xl border border-blue-50">
              {doctor?.bio || "No professional biography registered in the system database."}
            </p>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">Identity & Credentials</h3>
              <span className="text-xs font-mono text-slate-400">Metadata</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-bold">Email Address</span>
                <span className="text-slate-800 font-bold truncate max-w-[160px]">{doctor?.user?.email || "N/A"}</span>
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-bold">Phone Number</span>
                <span className="text-slate-800 font-bold">{doctor?.user?.phone || "N/A"}</span>
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-bold">License ID</span>
                <span className="text-slate-800 font-bold">{doctor?.licenseNumber || "N/A"}</span>
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-bold">Gender</span>
                <span className="text-slate-800 font-bold">{formatEnumLabel(doctor?.user?.gender) || "N/A"}</span>
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-bold">Age</span>
                <span className="text-slate-800 font-bold">{doctor?.user?.age ? `${doctor.user.age} Years` : "N/A"}</span>
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-bold">Languages</span>
                <span className="text-slate-800 font-bold">{formatLanguagesSpoken(doctor?.languagesSpoken) || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">Consultation Tariffs</h3>
              <span className="text-xs font-mono text-slate-400">Pricing</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wide block">Initial Visit</span>
                  <span className="text-base font-black text-[#1e61dc] mt-0.5 block">{formatCurrency(doctor?.initialVisitFee)}</span>
                </div>
                <span className="text-lg">💳</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Return Visit</span>
                  <span className="text-base font-black text-slate-800 mt-0.5 block">{formatCurrency(doctor?.returnVisitFee)}</span>
                </div>
                <span className="text-lg">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">Facility Location</h3>
              <span className="text-xs font-mono text-slate-400">Address</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-50 flex items-start gap-3">
              <span className="text-base mt-0.5">📍</span>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">Primary Office</span>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{doctor?.user?.address || "No facility location address registered."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Custom Dropdown Component for Gender ---
function CustomGenderSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { label: "Select Gender", value: "", disabled: true },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="font-bold text-slate-600 block mb-1">Gender</label>
      
      {/* Trigger Button matching the design style */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1e61dc] text-white font-medium text-xs px-4 py-3 rounded-xl shadow-md flex items-center justify-between cursor-pointer focus:outline-none transition-all"
      >
        <span className="flex items-center gap-2">
          {selectedOption.label}
        </span>
        <div className="flex items-center gap-2">
          {value && <span className="w-2 h-2 rounded-full bg-white shadow-xs"></span>}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (!option.disabled) {
                  onChange({ target: { name: "gender", value: option.value } });
                  setIsOpen(false);
                }
              }}
              className={`px-4 py-3 text-xs font-medium cursor-pointer transition-colors ${
                option.disabled 
                  ? "text-slate-400 select-none cursor-default" 
                  : value === option.value 
                    ? "bg-[#1e61dc] text-white font-bold" 
                    : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 2. Sub-component: Edit / Completion Mode with Live Progress Bar ---
function DoctorEditProfile({ initialData, completionStatus: backendCompletion, onSaveSuccess, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    specialization: initialData?.specialization || "",
    subSpecialization: initialData?.subSpecialization || "",
    licenseNumber: initialData?.licenseNumber || "",
    experienceYears: initialData?.experienceYears || "",
    initialVisitFee: initialData?.initialVisitFee || "",
    returnVisitFee: initialData?.returnVisitFee || "",
    bio: initialData?.bio || "",
    languagesSpoken: initialData?.languagesSpoken || "",
    gender: initialData?.user?.gender || "",
    birthDate: initialData?.user?.birthDate ? initialData.user.birthDate.split("T")[0] : ""
  });

  // Live calculation of completion progress based on 5 core fields
  const calculateLiveCompletion = () => {
    const missing = [];
    if (!formData.birthDate) missing.push('birthDate');
    if (!formData.gender) missing.push('gender');
    if (!formData.licenseNumber || formData.licenseNumber.trim() === '') missing.push('syndicateNumber');
    if (!formData.specialization || formData.specialization.trim() === '') missing.push('medicalSpecialty');
    if (!formData.subSpecialization || formData.subSpecialization.trim() === '') missing.push('medicalSubSpecialty');

    const percentage = ((5 - missing.length) / 5) * 100;
    return {
      completionPercentage: percentage,
      missingFields: missing,
      isComplete: missing.length === 0
    };
  };

  const currentProgress = calculateLiveCompletion();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/doctors/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
          initialVisitFee: formData.initialVisitFee ? Number(formData.initialVisitFee) : undefined,
          returnVisitFee: formData.returnVisitFee ? Number(formData.returnVisitFee) : undefined,
        })
      });

      if (!response.ok) throw new Error("Failed to update profile");
      
      const result = await response.json();
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      setTimeout(() => {
        onSaveSuccess(result);
      }, 800);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error updating profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Complete Profile</h1>
          <p className="text-xs text-slate-500 mt-1">Please fill in the required fields to activate all clinical features.</p>
        </div>
        <div className="flex items-center gap-3">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={saving}
            className="bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] hover:opacity-95 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-55 cursor-pointer"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {message.text}
        </div>
      )}

      {/* Live Interactive Progress Bar */}
      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Completion Progress</span>
          <span className="text-xs font-black text-blue-700">{Math.round(currentProgress.completionPercentage)}% Completed</span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${currentProgress.completionPercentage}%` }}
          />
        </div>
        {currentProgress.missingFields?.length > 0 ? (
          <p className="text-xs text-amber-700 font-medium">
            ⚠️ Missing required fields: <span className="font-bold">{currentProgress.missingFields.join(', ')}</span>
          </p>
        ) : (
          <p className="text-xs text-emerald-700 font-bold">
            🎉 Excellent! All core fields have been successfully fulfilled.
          </p>
        )}
      </div>

      <div className="bg-white p-8 rounded-[28px] border border-slate-200/70 shadow-xs space-y-5">
        <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider border-b pb-3 flex items-center gap-2">
          <Sliders size={16} />
          <span>Professional & Financial Parameters</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">Specialization (Medical Specialty)</label>
            <input 
              type="text" 
              name="specialization"
              value={formData.specialization} 
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" 
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Sub-Specialization (Medical Sub-Specialty)</label>
            <input 
              type="text" 
              name="subSpecialization"
              value={formData.subSpecialization} 
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" 
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Syndicate License Number (Syndicate Number)</label>
            <input 
              type="text" 
              name="licenseNumber"
              value={formData.licenseNumber} 
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" 
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Experience Years</label>
            <input 
              type="number" 
              name="experienceYears"
              value={formData.experienceYears} 
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" 
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Initial Visit Fee ($)</label>
            <input 
              type="number" 
              name="initialVisitFee"
              value={formData.initialVisitFee} 
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" 
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Return Visit Fee ($)</label>
            <input 
              type="number" 
              name="returnVisitFee"
              value={formData.returnVisitFee} 
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" 
            />
          </div>
          
          {/* حقل الجنس (Gender) بالتصميم المطلوب تماماً */}
          <CustomGenderSelect 
            value={formData.gender} 
            onChange={handleChange} 
          />

          <div>
            <label className="font-bold text-slate-600 block mb-1">Birth Date</label>
            <input 
              type="date" 
              name="birthDate"
              value={formData.birthDate} 
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" 
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Languages Spoken</label>
          <input 
            type="text" 
            name="languagesSpoken"
            value={formData.languagesSpoken} 
            onChange={handleChange}
            placeholder="e.g. Arabic, English" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium" 
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Bio / Professional Biography</label>
          <textarea 
            rows="3" 
            name="bio"
            value={formData.bio} 
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium" 
          />
        </div>
      </div>
    </form>
  );
}

// --- 3. Main Container Component ---
export default function DoctorProfileContainer() {
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/doctors/me");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      
      setDoctorData(data.profile || data);
      if (data.completionStatus) {
        setCompletionStatus(data.completionStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e61dc]" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f4f7fb] text-slate-900 font-sans antialiased p-6 sm:p-10 lg:p-12" dir="ltr">
      <div className="max-w-[1400px] mx-auto">
        {isEditing ? (
          <DoctorEditProfile 
            initialData={doctorData}
            completionStatus={completionStatus}
            onSaveSuccess={() => {
              fetchProfile();
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <DoctorViewProfile 
            doctor={doctorData}
            completionStatus={completionStatus}
            onEditClick={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
}
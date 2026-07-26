import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Edit3,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  User as UserIcon,
} from "lucide-react";

import ProfileLayout from "@/components/shared/ProfileLayout";
import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
  profileHeaderDetailsLabel,
  profileHeaderDetailsShell,
  profileHeaderDetailsValue,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import {
  formatApprovalStatus,
  formatCurrency,
  formatDoctorStatus,
  formatEnumLabel,
  formatLanguagesSpoken,
  getDoctorDisplayName,
  getDoctorInitials,
} from "../Admin/Doctors/doctorUtils";
import { getCurrentDoctor } from "./doctorPortalData";

export default function DoctorProfile() {
  const initialDoctor = getCurrentDoctor();
  const [doctor, setDoctor] = useState(initialDoctor);

  // Active Sub-Tab: "overview", "practice", "personal"
  const [activeTab, setActiveTab] = useState("overview");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    specialization: doctor?.specialization || "",
    subSpecialization: doctor?.subSpecialization || "",
    licenseNumber: doctor?.licenseNumber || "",
    experienceYears: doctor?.experienceYears || 0,
    bio: doctor?.bio || "",
    initialVisitFee: doctor?.initialVisitFee || 0,
    returnVisitFee: doctor?.returnVisitFee || 0,
    languagesSpoken: Array.isArray(doctor?.languagesSpoken)
      ? doctor.languagesSpoken.join(", ")
      : "Arabic, English",
    phone: doctor?.user?.phone || "",
    address: doctor?.user?.address || "",
    gender: doctor?.user?.gender || "MALE",
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const languagesArray = formData.languagesSpoken
      .split(",")
      .map((lang) => lang.trim())
      .filter(Boolean);

    setDoctor((prev) => ({
      ...prev,
      specialization: formData.specialization,
      subSpecialization: formData.subSpecialization,
      licenseNumber: formData.licenseNumber,
      experienceYears: Number(formData.experienceYears),
      bio: formData.bio,
      initialVisitFee: Number(formData.initialVisitFee),
      returnVisitFee: Number(formData.returnVisitFee),
      languagesSpoken: languagesArray,
      user: {
        ...prev.user,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
      },
    }));

    setIsEditModalOpen(false);
  };

  // Header Component (Matches Admin DoctorProfileHeader layout)
  const headerContent = (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xl font-bold text-[var(--color-primary)]">
          {getDoctorInitials(doctor)}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {getDoctorDisplayName(doctor)}
              </h1>
              <Badge variant={doctor.status === "ACTIVE" ? "default" : "secondary"}>
                {formatDoctorStatus(doctor.status)}
              </Badge>
            </div>

            <p className="text-sm font-medium text-slate-600">
              {[doctor.specialization, doctor.subSpecialization]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{doctor?.user?.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{doctor?.user?.phone}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-2 border-slate-300"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:items-end">
        <div
          className={`${profileHeaderDetailsShell} sm:grid-cols-2 md:min-w-72 md:grid-cols-2`}
        >
          <div>
            <p className={profileHeaderDetailsLabel}>Approval</p>
            <p className={profileHeaderDetailsValue}>
              {formatApprovalStatus(doctor.isApproved)}
            </p>
          </div>

          <div>
            <p className={profileHeaderDetailsLabel}>Rating</p>
            <p className={profileHeaderDetailsValue}>
              {doctor.averageRating ? doctor.averageRating.toFixed(1) : "N/A"}
            </p>
          </div>

          <div>
            <p className={profileHeaderDetailsLabel}>Clinics Count</p>
            <p className={profileHeaderDetailsValue}>{doctor.clinics_count}</p>
          </div>

          <div>
            <p className={profileHeaderDetailsLabel}>Initial Fee</p>
            <p className={profileHeaderDetailsValue}>
              {formatCurrency(doctor.initialVisitFee)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Navigation Tabs Bar (Matches Admin DoctorProfileNav layout style)
  const navContent = (
    <div className="flex gap-2 p-1">
      <button
        onClick={() => setActiveTab("overview")}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === "overview"
            ? "bg-[var(--color-primary)] text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Stethoscope size={16} />
        Overview
      </button>

      <button
        onClick={() => setActiveTab("practice")}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === "practice"
            ? "bg-[var(--color-primary)] text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Briefcase size={16} />
        Practice & Fees
      </button>

      <button
        onClick={() => setActiveTab("personal")}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === "personal"
            ? "bg-[var(--color-primary)] text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <UserIcon size={16} />
        Personal Details
      </button>
    </div>
  );

  return (
    <>
      <ProfileLayout header={headerContent} nav={navContent}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Doctor Profile Overview
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Backend-aligned doctor information and system credentials.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className={profileCardShell}>
                <p className={profileCardLabel}>Specialization</p>
                <p className={profileCardValue}>{doctor.specialization}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Sub-specialization</p>
                <p className={profileCardValue}>
                  {doctor.subSpecialization || "N/A"}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Experience</p>
                <p className={profileCardValue}>
                  {doctor.experienceYears} years
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>License Number</p>
                <p className={profileCardValue}>{doctor.licenseNumber}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Status</p>
                <p className={profileCardValue}>
                  {formatDoctorStatus(doctor.status)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Approval Status</p>
                <p className={profileCardValue}>
                  {doctor.isApproved ? "Approved" : "Pending Approval"}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Average Rating</p>
                <p className={profileCardValue}>
                  {doctor.averageRating
                    ? doctor.averageRating.toFixed(1)
                    : "N/A"}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Languages Spoken</p>
                <p className={profileCardValue}>
                  {formatLanguagesSpoken(doctor.languagesSpoken)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Clinics Count</p>
                <p className={profileCardValue}>{doctor.clinics_count}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Initial Visit Fee</p>
                <p className={profileCardValue}>
                  {formatCurrency(doctor.initialVisitFee)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Return Visit Fee</p>
                <p className={profileCardValue}>
                  {formatCurrency(doctor.returnVisitFee)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Gender</p>
                <p className={profileCardValue}>
                  {formatEnumLabel(doctor?.user?.gender)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Age</p>
                <p className={profileCardValue}>{doctor?.user?.age || "N/A"}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Preferred Language</p>
                <p className={profileCardValue}>
                  {doctor?.user?.preferredLanguage || "en"}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Email</p>
                <p className={profileCardValue}>{doctor?.user?.email}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Phone</p>
                <p className={profileCardValue}>{doctor?.user?.phone}</p>
              </div>

              <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
                <p className={profileCardLabel}>Address</p>
                <p className={profileCardValue}>{doctor?.user?.address}</p>
              </div>

              <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
                <p className={profileCardLabel}>Bio / Clinical Statement</p>
                <p className={profileCardBody}>{doctor.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRACTICE & FEES */}
        {activeTab === "practice" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Practice & Fee Structure
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Professional licensing, visit fees, and multi-clinic details.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className={profileCardShell}>
                <p className={profileCardLabel}>License Number</p>
                <p className={profileCardValue}>{doctor.licenseNumber}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Experience</p>
                <p className={profileCardValue}>
                  {doctor.experienceYears} years
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Initial Visit Fee</p>
                <p className={profileCardValue}>
                  {formatCurrency(doctor.initialVisitFee)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Return Visit Fee</p>
                <p className={profileCardValue}>
                  {formatCurrency(doctor.returnVisitFee)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Languages Spoken</p>
                <p className={profileCardValue}>
                  {formatLanguagesSpoken(doctor.languagesSpoken)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Clinics Count</p>
                <p className={profileCardValue}>{doctor.clinics_count}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL DETAILS */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Contact information and personal preferences.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className={profileCardShell}>
                <p className={profileCardLabel}>Email</p>
                <p className={profileCardValue}>{doctor?.user?.email}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Phone</p>
                <p className={profileCardValue}>{doctor?.user?.phone}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Gender</p>
                <p className={profileCardValue}>
                  {formatEnumLabel(doctor?.user?.gender)}
                </p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Age</p>
                <p className={profileCardValue}>{doctor?.user?.age || "N/A"}</p>
              </div>

              <div className={profileCardShell}>
                <p className={profileCardLabel}>Preferred Language</p>
                <p className={profileCardValue}>
                  {doctor?.user?.preferredLanguage || "en"}
                </p>
              </div>

              <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
                <p className={profileCardLabel}>Address</p>
                <p className={profileCardValue}>{doctor?.user?.address}</p>
              </div>
            </div>
          </div>
        )}
      </ProfileLayout>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl space-y-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Edit Doctor Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update doctor profile fields matching NestJS backend DTO schema.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialization
                  </label>
                  <Input
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleEditChange}
                    placeholder="e.g. Cardiology"
                    className="w-full bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sub-Specialization
                  </label>
                  <Input
                    name="subSpecialization"
                    value={formData.subSpecialization}
                    onChange={handleEditChange}
                    placeholder="e.g. Interventional Cardiology"
                    className="w-full bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    License Number
                  </label>
                  <Input
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleEditChange}
                    placeholder="e.g. LIC-998877"
                    className="w-full bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <Input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleEditChange}
                    className="w-full bg-white"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Visit Fee ($)
                  </label>
                  <Input
                    type="number"
                    name="initialVisitFee"
                    value={formData.initialVisitFee}
                    onChange={handleEditChange}
                    className="w-full bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Return Visit Fee ($)
                  </label>
                  <Input
                    type="number"
                    name="returnVisitFee"
                    value={formData.returnVisitFee}
                    onChange={handleEditChange}
                    className="w-full bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleEditChange}
                    className="w-full bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <NativeSelect
                    name="gender"
                    value={formData.gender}
                    onChange={handleEditChange}
                    className="w-full bg-white text-sm"
                  >
                    <NativeSelectOption value="MALE">Male</NativeSelectOption>
                    <NativeSelectOption value="FEMALE">Female</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Languages Spoken (comma-separated)
                </label>
                <Input
                  name="languagesSpoken"
                  value={formData.languagesSpoken}
                  onChange={handleEditChange}
                  placeholder="Arabic, English, French"
                  className="w-full bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleEditChange}
                  placeholder="Street address..."
                  className="w-full bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Clinical Statement
                </label>
                <textarea
                  rows={4}
                  name="bio"
                  value={formData.bio}
                  onChange={handleEditChange}
                  placeholder="Doctor professional background and experience..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

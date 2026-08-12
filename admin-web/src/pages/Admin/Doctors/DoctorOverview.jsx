import { useOutletContext } from "react-router-dom";

import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";

import {
  formatCurrency,
  formatDoctorStatus,
  formatEnumLabel,
  formatLanguagesSpoken,
} from "./doctorUtils";
import DoctorClinics from "./DoctorClinics";

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
}

export default function DoctorOverview() {
  const { doctor } = useOutletContext();

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="clinic-assignment-heading"
        className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-lg shadow-blue-100/60"
      >
        <DoctorClinics />
      </section>

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Overview
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Backend-aligned doctor information for the profile view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Specialization
          </p>
          <p className={profileCardValue}>
            {doctor.specialization}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Sub-specialization
          </p>
          <p className={profileCardValue}>
            {doctor.subSpecialization || "N/A"}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Experience
          </p>
          <p className={profileCardValue}>
            {typeof doctor.experienceYears === "number"
              ? `${doctor.experienceYears} years`
              : "N/A"}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            License Number
          </p>
          <p className={profileCardValue}>
            {doctor.licenseNumber}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Status
          </p>
          <p className={profileCardValue}>
            {formatDoctorStatus(doctor.status)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Approval
          </p>
          <p className={profileCardValue}>
            {doctor.isApproved ? "Approved" : "Pending Approval"}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Rating
          </p>
          <p className={profileCardValue}>
            {Number.isFinite(Number(doctor.averageRating))
              ? Number(doctor.averageRating).toFixed(1)
              : "N/A"}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Languages Spoken
          </p>
          <p className={profileCardValue}>
            {formatLanguagesSpoken(doctor.languagesSpoken)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Initial Visit Fee
          </p>
          <p className={profileCardValue}>
            {formatCurrency(doctor.initialVisitFee)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Return Visit Fee
          </p>
          <p className={profileCardValue}>
            {formatCurrency(doctor.returnVisitFee)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Gender
          </p>
          <p className={profileCardValue}>
            {formatEnumLabel(doctor.user?.gender)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Birth Date
          </p>
          <p className={profileCardValue}>
            {formatDate(doctor.user?.birthDate)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Email
          </p>
          <p className={profileCardValue}>
            {doctor.user?.email || "N/A"}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Phone
          </p>
          <p className={profileCardValue}>
            {doctor.user?.phone || "N/A"}
          </p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>
            Address
          </p>
          <p className={profileCardValue}>
            {doctor.user?.address || "N/A"}
          </p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>
            Bio
          </p>
          <p className={profileCardBody}>
            {doctor.bio || "No biography provided."}
          </p>
        </div>
      </div>

    </div>
  );
}

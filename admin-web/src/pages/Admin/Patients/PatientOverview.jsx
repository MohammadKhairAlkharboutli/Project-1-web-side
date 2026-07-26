import { useParams } from "react-router-dom";

import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";

import { patients } from "../PatientData";
import {
  formatAppointmentsCount,
  formatAverageRating,
  formatEnumLabel,
  formatPatientStatus,
  formatRatingsCount,
} from "./patientUtils";

export default function PatientOverview() {
  const { patientId } = useParams();
  const patient = patients.find((item) => String(item.id) === patientId);

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Overview
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Backend-aligned patient information for the profile view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Status
          </p>
          <p className={profileCardValue}>
            {formatPatientStatus(patient.user.status)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Occupation
          </p>
          <p className={profileCardValue}>
            {patient.occupation}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Marital Status
          </p>
          <p className={profileCardValue}>
            {formatEnumLabel(patient.maritalStatus)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            No Show Count
          </p>
          <p className={profileCardValue}>
            {patient.noShowCount}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Date of Birth
          </p>
          <p className={profileCardValue}>
            {patient.user.birthDate}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Age</p>
          <p className={profileCardValue}>
            {patient.user.age}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Gender
          </p>
          <p className={profileCardValue}>
            {formatEnumLabel(patient.user.gender)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Preferred Language
          </p>
          <p className={profileCardValue}>
            {patient.user.preferredLanguage}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Email
          </p>
          <p className={profileCardValue}>
            {patient.user.email}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Phone
          </p>
          <p className={profileCardValue}>
            {patient.user.phone}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Emergency Contact Name
          </p>
          <p className={profileCardValue}>
            {patient.emergencyContactName}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Emergency Contact Phone
          </p>
          <p className={profileCardValue}>
            {patient.emergencyContactPhone}
          </p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>
            Address
          </p>
          <p className={profileCardValue}>
            {patient.user.address}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Appointments
          </p>
          <p className={profileCardValue}>
            {formatAppointmentsCount(patient.appointments)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Ratings
          </p>
          <p className={profileCardValue}>
            {formatRatingsCount(patient.ratings)} ({formatAverageRating(patient.ratings)} avg)
          </p>
        </div>
      </div>
    </div>
  );
}

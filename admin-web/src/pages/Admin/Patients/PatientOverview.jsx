import { useOutletContext } from "react-router-dom";

import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";

import {
  formatEnumLabel,
  formatOptionalValue,
  formatPatientStatus,
} from "./patientUtils";

export default function PatientOverview() {
  const { patient } = useOutletContext();

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
            {formatOptionalValue(patient.occupation)}
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
            {formatOptionalValue(patient.noShowCount)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Date of Birth
          </p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.user?.birthDate)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Age</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.user?.age)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Gender
          </p>
          <p className={profileCardValue}>
            {formatEnumLabel(patient.user?.gender)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Email
          </p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.user?.email)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Phone
          </p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.user?.phone)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Emergency Contact Name
          </p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.emergencyContactName)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Emergency Contact Phone
          </p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.emergencyContactPhone)}
          </p>
        </div>
      </div>
    </div>
  );
}

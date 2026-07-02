import { useParams } from "react-router-dom";

import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";

import { secretaries } from "../SecrataryData";

export default function SecretaryOverview() {
  const { secretaryId } = useParams();
  const secretary = secretaries.find((item) => String(item.id) === secretaryId);

  if (!secretary) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Overview
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          General employee information and clinic assignment details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Employee Code
          </p>
          <p className={profileCardValue}>
            {secretary.employeeCode}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Position
          </p>
          <p className={profileCardValue}>
            {secretary.position}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Clinic
          </p>
          <p className={profileCardValue}>
            {secretary.clinic}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Shift
          </p>
          <p className={profileCardValue}>
            {secretary.shift}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Assigned Doctors
          </p>
          <p className={profileCardValue}>
            {secretary.assignedDoctors}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Joined On
          </p>
          <p className={profileCardValue}>
            {secretary.joinedOn}
          </p>
        </div>
      </div>

      <div className={profileCardShell}>
        <p className={profileCardLabel}>
          Address
        </p>
        <p className={profileCardValue}>
          {secretary.address}
        </p>
      </div>
    </div>
  );
}

import { useParams } from "react-router-dom";

import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";

import { clinics } from "../ClinicData";
import {
  formatClinicRating,
  formatClinicStatus,
  formatDateTime,
} from "./clinicUtils";

export default function ClinicOverview() {
  const { clinicId } = useParams();
  const clinic = clinics.find((item) => String(item.id) === clinicId);

  if (!clinic) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Overview
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Backend-aligned clinic information for the profile view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Status
          </p>
          <p className={profileCardValue}>
            {formatClinicStatus(clinic.status)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Average Rating
          </p>
          <p className={profileCardValue}>
            {formatClinicRating(clinic.averageRating)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Location
          </p>
          <p className={profileCardValue}>
            {clinic.location}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Created
          </p>
          <p className={profileCardValue}>
            {formatDateTime(clinic.created_at)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Last Updated
          </p>
          <p className={profileCardValue}>
            {formatDateTime(clinic.updated_at)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>
            Clinic ID
          </p>
          <p className={profileCardValue}>
            {clinic.id}
          </p>
        </div>
      </div>
    </div>
  );
}

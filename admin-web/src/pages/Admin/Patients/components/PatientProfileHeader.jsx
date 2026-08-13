import { Link } from "react-router-dom";
import { Mail, Phone, Star } from "lucide-react";

import {
  profileHeaderDetailsLabel,
  profileHeaderDetailsShell,
  profileHeaderDetailsValue,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatEnumLabel,
  formatPatientStatus,
  getPatientDisplayName,
  getPatientInitials,
} from "../patientUtils";

export default function PatientProfileHeader({ patient }) {
  const user = patient.user || {};
  const ageLabel = Number.isFinite(user.age) ? `${user.age} years old` : "Age not recorded";

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
          {getPatientInitials(patient)}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {getPatientDisplayName(patient)}
              </h1>
              <Badge
                variant={user.status === "ACTIVE" ? "default" : "secondary"}
              >
                {formatPatientStatus(user.status)}
              </Badge>
            </div>

            <p className="text-sm text-slate-600">
              {formatEnumLabel(user.gender)} | {ageLabel}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{user.email || "No email"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{user.phone || "No phone"}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/ratings?patientId=${patient.id}`}>
              <Star className="h-4 w-4" />
              View reviews
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={`${profileHeaderDetailsShell} sm:grid-cols-2 md:min-w-72 md:grid-cols-2`}
      >
        <div>
          <p className={profileHeaderDetailsLabel}>
            Occupation
          </p>
          <p className={profileHeaderDetailsValue}>{patient.occupation}</p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            Marital Status
          </p>
          <p className={profileHeaderDetailsValue}>
            {formatEnumLabel(patient.maritalStatus)}
          </p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            Emergency Contact
          </p>
          <p className={profileHeaderDetailsValue}>
            {patient.emergencyContactName}
          </p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            No Show Count
          </p>
          <p className={profileHeaderDetailsValue}>{patient.noShowCount}</p>
        </div>
      </div>
    </div>
  );
}

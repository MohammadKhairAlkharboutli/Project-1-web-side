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
  formatApprovalStatus,
  formatCurrency,
  formatDoctorStatus,
  getDoctorDisplayName,
  getDoctorInitials,
} from "../doctorUtils";

export default function DoctorProfileHeader({ doctor }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
          {getDoctorInitials(doctor)}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {getDoctorDisplayName(doctor)}
              </h1>
              <Badge variant={doctor.status === "ACTIVE" ? "default" : "secondary"}>
                {formatDoctorStatus(doctor.status)}
              </Badge>
            </div>

            <p className="text-sm text-slate-600">
              {[doctor.specialization, doctor.subSpecialization]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{doctor.user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{doctor.user.phone}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/ratings?doctorId=${doctor.id}`}>
              <Star className="h-4 w-4" />
              View ratings
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={`${profileHeaderDetailsShell} sm:grid-cols-2 md:min-w-72 md:grid-cols-2`}
      >
        <div>
          <p className={profileHeaderDetailsLabel}>
            Approval
          </p>
          <p className={profileHeaderDetailsValue}>
            {formatApprovalStatus(doctor.isApproved)}
          </p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            Rating
          </p>
          <p className={profileHeaderDetailsValue}>
            {doctor.averageRating ? doctor.averageRating.toFixed(1) : "N/A"}
          </p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            Clinics Count
          </p>
          <p className={profileHeaderDetailsValue}>
            {doctor.clinics_count}
          </p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            Initial Fee
          </p>
          <p className={profileHeaderDetailsValue}>
            {formatCurrency(doctor.initialVisitFee)}
          </p>
        </div>
      </div>
    </div>
  );
}

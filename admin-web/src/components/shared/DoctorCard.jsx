import { Award, BadgeCheck, BriefcaseMedical, Languages, Star } from "lucide-react";

import {
  entityCardDescription,
  entityCardMeta,
  entityCardShell,
  entityCardTitle,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatDoctorStatus,
  formatLanguagesSpoken,
  getDoctorDisplayName,
} from "@/pages/Admin/Doctors/doctorUtils";

function getDoctorStatusVariant(status) {
  if (status === "ACTIVE") {
    return "default";
  }

  if (status === "INACTIVE") {
    return "destructive";
  }

  return "secondary";
}

function formatRating(averageRating) {
  return typeof averageRating === "number" ? averageRating.toFixed(1) : "N/A";
}

export default function DoctorCard({ doctor, actions, className }) {
  if (!doctor) {
    return null;
  }

  return (
    <article
      className={cn(
        entityCardShell,
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={entityCardTitle}>
            {getDoctorDisplayName(doctor)}
          </h3>
          <Badge variant={getDoctorStatusVariant(doctor.status)}>
            {formatDoctorStatus(doctor.status)}
          </Badge>
          {doctor.isApproved ? (
            <Badge variant="secondary">
              Approved
            </Badge>
          ) : null}
        </div>

        <p className={cn(entityCardDescription, "max-w-3xl")}>
          {doctor.bio || "No bio available."}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className={entityCardMeta}>
            <BriefcaseMedical className="h-4 w-4 text-slate-400" />
            <span>{doctor.specialization || "No specialization"}</span>
          </div>

          <div className={entityCardMeta}>
            <Award className="h-4 w-4 text-slate-400" />
            <span>{doctor.experienceYears ?? "N/A"} years</span>
          </div>

          <div className={entityCardMeta}>
            <Star className="h-4 w-4 text-slate-400" />
            <span>{formatRating(doctor.averageRating)} rating</span>
          </div>

          <div className={entityCardMeta}>
            <Languages className="h-4 w-4 text-slate-400" />
            <span>{formatLanguagesSpoken(doctor.languagesSpoken)}</span>
          </div>

          <div className={entityCardMeta}>
            <BadgeCheck className="h-4 w-4 text-slate-400" />
            <span>License {doctor.licenseNumber || "N/A"}</span>
          </div>
        </div>
      </div>

      {actions ? (
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:min-w-80 lg:justify-end">
          {actions}
        </div>
      ) : null}
    </article>
  );
}

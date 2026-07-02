import { MapPin, Star } from "lucide-react";

import {
  profileHeaderDetailsLabel,
  profileHeaderDetailsShell,
  profileHeaderDetailsValue,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";
import {
  formatClinicRating,
  formatClinicStatus,
  getClinicStatusVariant,
} from "../clinicUtils";

export default function ClinicProfileHeader({ clinic }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {clinic.name}
            </h1>
            <Badge variant={getClinicStatusVariant(clinic.status)}>
              {formatClinicStatus(clinic.status)}
            </Badge>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {clinic.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{clinic.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-slate-400" />
            <span>{formatClinicRating(clinic.averageRating)} average rating</span>
          </div>
        </div>
      </div>

      <div
        className={`${profileHeaderDetailsShell} sm:grid-cols-2 md:min-w-72 md:grid-cols-2`}
      >
        <div>
          <p className={profileHeaderDetailsLabel}>
            Clinic ID
          </p>
          <p className={profileHeaderDetailsValue}>
            {clinic.id}
          </p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            Status
          </p>
          <p className={profileHeaderDetailsValue}>
            {formatClinicStatus(clinic.status)}
          </p>
        </div>
      </div>
    </div>
  );
}

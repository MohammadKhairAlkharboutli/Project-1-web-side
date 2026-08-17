import { MapPin, Star, Hash } from "lucide-react";

import {
  entityCardDescription,
  entityCardMeta,
  entityCardShell,
  entityCardTitle,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatClinicStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getClinicStatusVariant(status) {
  if (status === "active") {
    return "success";
  }

  if (status === "closed") {
    return "destructive";
  }

  return "secondary";
}

function formatClinicRating(averageRating) {
  return typeof averageRating === "number" ? averageRating.toFixed(1) : "N/A";
}

export default function ClinicCard({ clinic, actions, className }) {
  if (!clinic) {
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
            {clinic.name}
          </h3>
          <Badge variant={getClinicStatusVariant(clinic.status)}>
            {formatClinicStatus(clinic.status)}
          </Badge>
        </div>

        <p className={cn(entityCardDescription, "max-w-3xl")}>
          {clinic.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className={entityCardMeta}>
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{clinic.location || "No location"}</span>
          </div>

          <div className={entityCardMeta}>
            <Star className="h-4 w-4 text-slate-400" />
            <span>{formatClinicRating(clinic.averageRating)} rating</span>
          </div>

          <div className={entityCardMeta}>
            <Hash className="h-4 w-4 text-slate-400" />
            <span>Clinic {clinic.id}</span>
          </div>
        </div>
      </div>

      {actions ? (
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:min-w-80 lg:justify-end xl:grid-cols-3">
          {actions}
        </div>
      ) : null}
    </article>
  );
}

import { Mail, Phone } from "lucide-react";

import {
  profileHeaderDetailsLabel,
  profileHeaderDetailsShell,
  profileHeaderDetailsValue,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";

export default function SecretaryProfileHeader({ secretary }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
          {secretary.avatar}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {secretary.name}
              </h1>
              <Badge
                variant={secretary.status === "Active" ? "default" : "secondary"}
              >
                {secretary.status}
              </Badge>
            </div>

            <p className="text-sm text-slate-600">
              {secretary.position} - {secretary.clinic}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{secretary.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{secretary.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${profileHeaderDetailsShell} sm:grid-cols-2 md:min-w-56 md:grid-cols-1`}
      >
        <div>
          <p className={profileHeaderDetailsLabel}>
            Shift
          </p>
          <p className={profileHeaderDetailsValue}>{secretary.shift}</p>
        </div>

        <div>
          <p className={profileHeaderDetailsLabel}>
            Joined On
          </p>
          <p className={profileHeaderDetailsValue}>
            {secretary.joinedOn}
          </p>
        </div>
      </div>
    </div>
  );
}

import { Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function DoctorProfileHeader({ doctor }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
          {doctor.avatar}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {doctor.name}
              </h1>
              <Badge
                variant={doctor.status === "Active" ? "default" : "secondary"}
              >
                {doctor.status}
              </Badge>
            </div>

            <p className="text-sm text-slate-600">{doctor.specialty}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{doctor.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{doctor.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-w-48 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2 md:min-w-56 md:grid-cols-1">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Secretary
          </p>
          <p className="mt-1 font-medium text-slate-800">{doctor.secretary}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Appointments Today
          </p>
          <p className="mt-1 font-medium text-slate-800">
            {doctor.appointmentsToday}
          </p>
        </div>
      </div>
    </div>
  );
}

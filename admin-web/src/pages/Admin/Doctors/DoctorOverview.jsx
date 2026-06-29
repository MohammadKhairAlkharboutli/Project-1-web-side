import { useParams } from "react-router-dom";

import { doctors } from "../DoctorData";

export default function DoctorOverview() {
  const { doctorId } = useParams();
  const doctor = doctors.find((item) => String(item.id) === doctorId);

  if (!doctor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Overview
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Basic doctor information and quick profile details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Specialty
          </p>
          <p className="mt-2 text-sm font-medium text-slate-800">
            {doctor.specialty}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Status
          </p>
          <p className="mt-2 text-sm font-medium text-slate-800">
            {doctor.status}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Email
          </p>
          <p className="mt-2 text-sm font-medium text-slate-800">
            {doctor.email}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Phone
          </p>
          <p className="mt-2 text-sm font-medium text-slate-800">
            {doctor.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

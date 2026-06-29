import { Outlet, useParams } from "react-router-dom";

import ProfileLayout from "@/components/shared/ProfileLayout";

import { doctors } from "../DoctorData";
import DoctorProfileHeader from "./components/DoctorProfileHeader";
import DoctorProfileNav from "./components/DoctorProfileNav";

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const doctor = doctors.find((item) => String(item.id) === doctorId);

  if (!doctor) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Doctor not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The doctor profile you requested does not exist.
        </p>
      </div>
    );
  }

  return (
    <ProfileLayout
      header={<DoctorProfileHeader doctor={doctor} />}
      nav={<DoctorProfileNav doctorId={doctor.id} />}
    >
      <Outlet />
    </ProfileLayout>
  );
}

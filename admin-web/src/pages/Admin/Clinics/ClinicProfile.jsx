import { Outlet, useParams } from "react-router-dom";

import ProfileLayout from "@/components/shared/ProfileLayout";

import { clinics } from "../ClinicData";
import ClinicProfileHeader from "./components/ClinicProfileHeader";
import ClinicProfileNav from "./components/ClinicProfileNav";

export default function ClinicProfile() {
  const { clinicId } = useParams();
  const clinic = clinics.find((item) => String(item.id) === clinicId);

  if (!clinic) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Clinic not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The clinic profile you requested does not exist.
        </p>
      </div>
    );
  }

  return (
    <ProfileLayout
      header={<ClinicProfileHeader clinic={clinic} />}
      nav={<ClinicProfileNav clinicId={clinic.id} />}
    >
      <Outlet />
    </ProfileLayout>
  );
}

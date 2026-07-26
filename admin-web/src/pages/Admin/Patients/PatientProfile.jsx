import { Outlet, useParams } from "react-router-dom";

import ProfileLayout from "@/components/shared/ProfileLayout";

import { patients } from "../PatientData";
import PatientProfileHeader from "./components/PatientProfileHeader";
import PatientProfileNav from "./components/PatientProfileNav";

export default function PatientProfile() {
  const { patientId } = useParams();
  const patient = patients.find((item) => String(item.id) === patientId);

  if (!patient) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Patient not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The patient profile you requested does not exist.
        </p>
      </div>
    );
  }

  return (
    <ProfileLayout
      header={<PatientProfileHeader patient={patient} />}
      nav={<PatientProfileNav patientId={patient.id} />}
    >
      <Outlet />
    </ProfileLayout>
  );
}

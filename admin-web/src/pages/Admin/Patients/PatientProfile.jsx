import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import ProfileLayout from "@/components/shared/ProfileLayout";

import PatientProfileHeader from "./components/PatientProfileHeader";
import PatientProfileNav from "./components/PatientProfileNav";

export default function PatientProfile() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadPatient() {
      setIsLoading(true);

      try {
        const data = await adminPatientsApi.getPatient(patientId);

        if (isCurrent) {
          setPatient(data);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          const message = error?.response?.data?.message || error?.message;
          setPatient(null);
          setLoadError(
            Array.isArray(message)
              ? message.join(" ")
              : message || "We could not load this patient profile.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPatient();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, patientId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading patient profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Patient not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {loadError || "The patient profile you requested does not exist."}
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
          onClick={() => setLoadAttempt((attempt) => attempt + 1)}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <ProfileLayout
      header={<PatientProfileHeader patient={patient} />}
      nav={<PatientProfileNav patientId={patient.id} />}
    >
      <Outlet
        context={{
          patient,
          refreshPatient: () => setLoadAttempt((attempt) => attempt + 1),
        }}
      />
    </ProfileLayout>
  );
}

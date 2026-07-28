import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import ProfileLayout from "@/components/shared/ProfileLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { doctorsApi } from "@/api/doctorsApi";
import DoctorProfileHeader from "./components/DoctorProfileHeader";
import DoctorProfileNav from "./components/DoctorProfileNav";
import { getDoctorDisplayName } from "./doctorUtils";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this doctor profile. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const [deactivateDoctorOpen, setDeactivateDoctorOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadDoctor() {
      try {
        const data = await doctorsApi.getDoctor(doctorId);

        if (isCurrent) {
          setDoctor(data);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
          setDoctor(null);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadDoctor();

    return () => {
      isCurrent = false;
    };
  }, [doctorId, loadAttempt]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Doctor not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {loadError || "The doctor profile you requested does not exist."}
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
          onClick={() => {
            setIsLoading(true);
            setLoadAttempt((attempt) => attempt + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  function closeDeactivateDoctorDialog() {
    setDeactivateDoctorOpen(false);
  }

  return (
    <>
      <ProfileLayout
        header={
          <DoctorProfileHeader
            doctor={doctor}
            onDeactivateDoctor={() => setDeactivateDoctorOpen(true)}
          />
        }
        nav={<DoctorProfileNav doctorId={doctor.id} />}
      >
        <Outlet
          context={{
            doctor,
            refreshDoctor: () => setLoadAttempt((attempt) => attempt + 1),
          }}
        />
      </ProfileLayout>

      <AlertDialog
        open={deactivateDoctorOpen}
        onOpenChange={setDeactivateDoctorOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prepare {getDoctorDisplayName(doctor)} to be marked as
              inactive instead of deleting their account and related records.
              Backend deactivation is not connected yet, so confirming only
              closes this modal for now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={closeDeactivateDoctorDialog}
            >
              Deactivate doctor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { clinicsApi } from "@/api/clinicsApi";
import ProfileLayout from "@/components/shared/ProfileLayout";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import ClinicFormDialog from "./components/ClinicFormDialog";
import ClinicProfileHeader from "./components/ClinicProfileHeader";
import ClinicProfileNav from "./components/ClinicProfileNav";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function ClinicProfile() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [editClinicOpen, setEditClinicOpen] = useState(false);
  const [deactivateClinicOpen, setDeactivateClinicOpen] = useState(false);
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [closeError, setCloseError] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadClinic() {
      try {
        const data = await clinicsApi.getClinic(clinicId);

        if (isCurrent) {
          setClinic(data);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setClinic(null);
          setLoadError(getErrorMessage(error, "We could not load this clinic."));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadClinic();

    return () => {
      isCurrent = false;
    };
  }, [clinicId, loadAttempt]);

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function updateClinic(formData) {
    const updatedClinic = await clinicsApi.updateClinic(clinic.id, formData);
    setClinic(updatedClinic);
  }

  async function closeClinic() {
    setIsClosing(true);
    setCloseError("");

    try {
      await clinicsApi.closeClinic(clinic.id);
      navigate("/admin/clinics", {
        replace: true,
        state: { notice: `${clinic.name} was closed successfully.` },
      });
    } catch (error) {
      setCloseError(
        getErrorMessage(error, "We could not close this clinic. Please try again."),
      );
    } finally {
      setIsClosing(false);
    }
  }

  function handleDeactivateDialogChange(open) {
    if (!open && !isClosing) {
      setCloseError("");
      setDeactivateClinicOpen(false);
      return;
    }

    setDeactivateClinicOpen(open);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading clinic profile...</p>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Clinic not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {loadError || "The clinic profile you requested does not exist."}
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
          onClick={retryLoad}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <ProfileLayout
        header={
          <ClinicProfileHeader
            clinic={clinic}
            onEditClinic={() => setEditClinicOpen(true)}
            onDeactivateClinic={() => setDeactivateClinicOpen(true)}
          />
        }
        nav={<ClinicProfileNav clinicId={clinic.id} />}
      >
        <Outlet context={{ clinic, refreshClinic: retryLoad }} />
      </ProfileLayout>

      <ClinicFormDialog
        open={editClinicOpen}
        onOpenChange={setEditClinicOpen}
        mode="edit"
        clinic={clinic}
        onSubmit={updateClinic}
      />

      <AlertDialog
        open={deactivateClinicOpen}
        onOpenChange={handleDeactivateDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close clinic?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close {clinic.name} and remove it from the active clinic
              list. It cannot be closed while doctors are still assigned to it.
            </AlertDialogDescription>
            {closeError ? (
              <p className="text-sm text-red-700" role="alert">
                {closeError}
              </p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={closeClinic} disabled={isClosing}>
              {isClosing ? "Closing..." : "Close clinic"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

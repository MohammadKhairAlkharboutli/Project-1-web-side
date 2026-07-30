import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Eye,
  LoaderCircle,
  Plus,
  Rows3,
  Unlink,
} from "lucide-react";

import { clinicsApi } from "@/api/clinicsApi";
import { doctorClinicsApi } from "@/api/doctorClinicsApi";
import ClinicCard from "@/components/shared/ClinicCard";
import { sharedEmptyStateShell } from "@/components/shared/styles";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorClinics() {
  const { doctor, refreshDoctor } = useOutletContext();
  const [assignedClinics, setAssignedClinics] = useState([]);
  const [allClinics, setAllClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [clinicToUnassign, setClinicToUnassign] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const hasAssignedClinic = assignedClinics.length > 0;

  useEffect(() => {
    let isCurrent = true;

    async function loadClinics() {
      try {
        const [assigned, all] = await Promise.all([
          doctorClinicsApi.getClinicsForDoctor(doctor.id),
          clinicsApi.getClinics(),
        ]);

        if (isCurrent) {
          setAssignedClinics(assigned);
          setAllClinics(all);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error, "We could not load clinic assignments."));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadClinics();

    return () => {
      isCurrent = false;
    };
  }, [doctor.id, loadAttempt]);

  const assignableClinics = useMemo(() => {
    if (hasAssignedClinic) {
      return [];
    }

    const assignedIds = new Set(assignedClinics.map((clinic) => String(clinic.id)));
    return allClinics.filter((clinic) => !assignedIds.has(String(clinic.id)));
  }, [allClinics, assignedClinics, hasAssignedClinic]);

  function openAssignDialog() {
    setActionError("");
    setSelectedClinicId(String(assignableClinics[0]?.id ?? ""));
    setAssignOpen(true);
  }

  async function assignClinic() {
    if (!selectedClinicId) {
      setActionError("Select a clinic to assign.");
      return;
    }

    setIsSubmitting(true);
    setActionError("");

    try {
      await doctorClinicsApi.assignDoctor({
        clinicId: Number(selectedClinicId),
        doctorId: doctor.id,
      });
      setAssignOpen(false);
      setIsLoading(true);
      setLoadAttempt((attempt) => attempt + 1);
      refreshDoctor();
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not assign this doctor to the clinic."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function unassignClinic() {
    if (!clinicToUnassign) {
      return;
    }

    setIsSubmitting(true);
    setActionError("");

    try {
      await doctorClinicsApi.unassignDoctor({
        clinicId: clinicToUnassign.id,
        doctorId: doctor.id,
      });
      setClinicToUnassign(null);
      setIsLoading(true);
      setLoadAttempt((attempt) => attempt + 1);
      refreshDoctor();
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not unassign this doctor from the clinic."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Clinic
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            The clinic this doctor is assigned to.
          </p>
        </div>

        <Button
          onClick={openAssignDialog}
          disabled={isLoading || hasAssignedClinic || assignableClinics.length === 0}
        >
          <Plus className="h-4 w-4" />
          Assign doctor to clinic
        </Button>
      </div>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}

      {assignedClinics.length > 1 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This record has more than one clinic assignment. The frontend now prevents additional assignments; an administrator should keep one assignment and remove the rest.
        </p>
      ) : null}

      {isLoading ? (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-slate-700">Loading clinic assignments...</p>
        </div>
      ) : loadError ? (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-red-700">{loadError}</p>
          <Button
            className="mt-4"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Try again
          </Button>
        </div>
      ) : assignedClinics.length > 0 ? (
        <div className="space-y-3">
          {assignedClinics.map((clinic) => (
            <ClinicCard
              key={clinic.id}
              clinic={clinic}
              actions={
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/clinics/${clinic.id}`}>
                      <Eye className="h-4 w-4" />
                      View clinic
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/doctors/${doctor.id}/schedules?clinicId=${clinic.id}`}>
                      <CalendarDays className="h-4 w-4" />
                      View schedule
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/doctors/${doctor.id}/appointments?clinicId=${clinic.id}`}>
                      <ClipboardList className="h-4 w-4" />
                      View appointments
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/queue?clinicId=${clinic.id}&doctorId=${doctor.id}`}>
                      <Rows3 className="h-4 w-4" />
                      View queue
                    </Link>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setClinicToUnassign(clinic)}
                  >
                    <Unlink className="h-4 w-4" />
                    Unassign from clinic
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-slate-700">
            This doctor is not assigned to any clinics.
          </p>
        </div>
      )}

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign doctor to clinic</DialogTitle>
            <DialogDescription>
              Choose a clinic for this doctor. The assignment takes effect immediately.
            </DialogDescription>
          </DialogHeader>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Clinic
            <NativeSelect
              value={selectedClinicId}
              onChange={(event) => setSelectedClinicId(event.target.value)}
              disabled={isSubmitting}
            >
              {assignableClinics.map((clinic) => (
                <NativeSelectOption key={clinic.id} value={String(clinic.id)}>
                  {clinic.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={assignClinic} disabled={isSubmitting || !selectedClinicId}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              Assign clinic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(clinicToUnassign)}
        onOpenChange={(open) => !open && setClinicToUnassign(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign doctor from clinic?</AlertDialogTitle>
            <AlertDialogDescription>
              {clinicToUnassign
                ? `${doctor.user?.full_name || "This doctor"} will no longer be assigned to ${clinicToUnassign.name}.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={unassignClinic} disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              Unassign doctor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

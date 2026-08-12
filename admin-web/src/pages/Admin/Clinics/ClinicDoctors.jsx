import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CalendarDays, ClipboardList, Eye, Rows3, Unlink } from "lucide-react";

import { doctorClinicsApi } from "@/api/doctorClinicsApi";
import { doctorsApi } from "@/api/doctorsApi";
import DoctorCard from "@/components/shared/DoctorCard";
import { sharedEmptyStateShell } from "@/components/shared/styles";
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
import { cn } from "@/lib/utils";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function ClinicDoctors() {
  const { clinic } = useOutletContext();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [doctorToUnassign, setDoctorToUnassign] = useState(null);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadDoctors() {
      try {
        const assignedDoctors = await doctorClinicsApi.getDoctorsForClinic(clinic.id);
        const doctorDetails = await Promise.all(
          assignedDoctors.map((doctor) => doctorsApi.getDoctor(doctor.id)),
        );

        if (isCurrent) {
          setDoctors(doctorDetails);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error, "We could not load assigned doctors."));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      isCurrent = false;
    };
  }, [clinic.id, loadAttempt]);

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function unassignDoctor() {
    if (!doctorToUnassign) {
      return;
    }

    setIsUnassigning(true);
    setActionError("");

    try {
      await doctorClinicsApi.unassignDoctor({
        clinicId: clinic.id,
        doctorId: doctorToUnassign.id,
      });
      setDoctorToUnassign(null);
      retryLoad();
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not unassign this doctor."));
    } finally {
      setIsUnassigning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Doctors
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Doctors assigned to work at this clinic.
        </p>
      </div>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}

      {isLoading ? (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-slate-700">Loading assigned doctors...</p>
        </div>
      ) : loadError ? (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-red-700">{loadError}</p>
          <Button className="mt-4" variant="outline" size="sm" onClick={retryLoad}>
            Try again
          </Button>
        </div>
      ) : doctors.length > 0 ? (
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              actions={
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/doctors/${doctor.id}`}>
                      <Eye className="h-4 w-4" />
                      View doctor
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/clinics/${clinic.id}/appointments?doctorId=${doctor.id}`}>
                      <ClipboardList className="h-4 w-4" />
                      View appointments
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/doctors/${doctor.id}/schedules`}>
                      <CalendarDays className="h-4 w-4" />
                      View schedule
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
                    onClick={() => setDoctorToUnassign(doctor)}
                  >
                    <Unlink className="h-4 w-4" />
                    Unassign doctor
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-slate-700">
            No doctors are assigned to this clinic.
          </p>
        </div>
      )}

      <AlertDialog
        open={Boolean(doctorToUnassign)}
        onOpenChange={(open) => !open && setDoctorToUnassign(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              {doctorToUnassign
                ? `${doctorToUnassign.user?.full_name || "This doctor"} will no longer be assigned to ${clinic.name}.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnassigning}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={unassignDoctor} disabled={isUnassigning}>
              {isUnassigning ? "Unassigning..." : "Unassign doctor"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

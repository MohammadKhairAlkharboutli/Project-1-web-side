import { useState } from "react";
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

import { doctors } from "../DoctorData";
import DoctorProfileHeader from "./components/DoctorProfileHeader";
import DoctorProfileNav from "./components/DoctorProfileNav";
import { getDoctorDisplayName } from "./doctorUtils";

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const [deactivateDoctorOpen, setDeactivateDoctorOpen] = useState(false);
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
        <Outlet />
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

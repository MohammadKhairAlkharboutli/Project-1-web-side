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

import { clinics } from "../ClinicData";
import ClinicFormDialog from "./components/ClinicFormDialog";
import ClinicProfileHeader from "./components/ClinicProfileHeader";
import ClinicProfileNav from "./components/ClinicProfileNav";

export default function ClinicProfile() {
  const { clinicId } = useParams();
  const [editClinicOpen, setEditClinicOpen] = useState(false);
  const [deactivateClinicOpen, setDeactivateClinicOpen] = useState(false);
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

  function closeEditClinicDialog() {
    setEditClinicOpen(false);
  }

  function closeDeactivateClinicDialog() {
    setDeactivateClinicOpen(false);
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
        <Outlet />
      </ProfileLayout>

      <ClinicFormDialog
        open={editClinicOpen}
        onOpenChange={setEditClinicOpen}
        mode="edit"
        clinic={clinic}
        onSubmit={closeEditClinicDialog}
      />

      <AlertDialog
        open={deactivateClinicOpen}
        onOpenChange={setDeactivateClinicOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate clinic?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prepare {clinic.name} to be marked as closed instead of
              deleting its records. Backend deactivation is not connected yet,
              so confirming only closes this modal for now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={closeDeactivateClinicDialog}
            >
              Deactivate clinic
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

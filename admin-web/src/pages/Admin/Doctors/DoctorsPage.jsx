import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { doctors } from "../DoctorData";

import { getDoctorColumns } from "./components/DoctorColumns";
import DoctorInviteDialog from "./components/DoctorInviteDialog";
import DoctorsTableToolbar from "./components/DoctorsTableToolbar";

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const specializationOptions = Array.from(
    new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
  const columns = getDoctorColumns((doctor) =>
    navigate(`/admin/doctors/${doctor.id}`)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Review doctor profiles and the backend-aligned details shown in the admin UI.
          </p>
        </div>

        <Button onClick={() => setInviteDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add doctor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={doctors}
        emptyMessage="No doctors found."
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <DoctorsTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            specializationOptions={specializationOptions}
          />
        )}
      />

      <DoctorInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}

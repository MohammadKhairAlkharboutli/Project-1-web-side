import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";

import { clinics } from "../ClinicData";
import { getClinicColumns } from "./components/ClinicColumns";
import ClinicFormDialog from "./components/ClinicFormDialog";
import ClinicsTableToolbar from "./components/ClinicsTableToolbar";

export default function ClinicsPage() {
  const navigate = useNavigate();
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  const locationOptions = Array.from(
    new Set(clinics.map((clinic) => clinic.location).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
  const columns = getClinicColumns((clinic) =>
    navigate(`/admin/clinics/${clinic.id}`)
  );

  function closeAddClinicDialog() {
    setClinicFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinics</h1>
          <p className="text-muted-foreground">
            Review clinic records and the backend-aligned details shown in the admin UI.
          </p>
        </div>

        <Button onClick={() => setClinicFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add clinic
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={clinics}
        emptyMessage="No clinics found."
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <ClinicsTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            locationOptions={locationOptions}
          />
        )}
      />

      <ClinicFormDialog
        open={clinicFormOpen}
        onOpenChange={setClinicFormOpen}
        mode="add"
        onSubmit={closeAddClinicDialog}
      />
    </div>
  );
}

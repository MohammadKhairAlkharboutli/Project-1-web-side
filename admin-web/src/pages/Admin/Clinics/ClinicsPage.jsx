import { useNavigate } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";

import { clinics } from "../ClinicData";
import { getClinicColumns } from "./components/ClinicColumns";
import ClinicsTableToolbar from "./components/ClinicsTableToolbar";

export default function ClinicsPage() {
  const navigate = useNavigate();
  const locationOptions = Array.from(
    new Set(clinics.map((clinic) => clinic.location).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
  const columns = getClinicColumns((clinic) =>
    navigate(`/admin/clinics/${clinic.id}`)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinics</h1>
        <p className="text-muted-foreground">
          Review clinic records and the backend-aligned details shown in the admin UI.
        </p>
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
    </div>
  );
}

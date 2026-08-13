import { useNavigate } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import { patients } from "../PatientData";

import { getPatientColumns } from "./components/PatientColumns";
import PatientsTableToolbar from "./components/PatientsTableToolbar";

export default function PatientsPage() {
  const navigate = useNavigate();
  const occupationOptions = Array.from(
    new Set(patients.map((patient) => patient.occupation).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
  const columns = getPatientColumns((patient) =>
    navigate(`/admin/patients/${patient.id}`)
  );

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.resetSorting();
    table.setPageIndex(0);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          Review patient records using the same data shape the backend exposes.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        emptyMessage="No patients found."
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <PatientsTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            occupationOptions={occupationOptions}
            onResetFilters={() => resetFilters(table, setGlobalFilter)}
          />
        )}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { clinicsApi } from "@/api/clinicsApi";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";

import { getClinicColumns } from "./components/ClinicColumns";
import ClinicFormDialog from "./components/ClinicFormDialog";
import ClinicsTableToolbar from "./components/ClinicsTableToolbar";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load the clinics. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function ClinicsPage() {
  const navigate = useNavigate();
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadClinics() {
      try {
        const data = await clinicsApi.getClinics();

        if (isCurrent) {
          setClinics(data);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
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
  }, [loadAttempt]);

  const locationOptions = Array.from(
    new Set(clinics.map((clinic) => clinic.location).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
  const columns = getClinicColumns((clinic) =>
    navigate(`/admin/clinics/${clinic.id}`),
  );

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.resetSorting();
  }

  async function addClinic(formData) {
    const clinic = await clinicsApi.createClinic(formData);

    if (clinic.status === "active") {
      setClinics((currentClinics) =>
        [...currentClinics, clinic].sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      );
    }
  }

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
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
        emptyMessage={
          isLoading
            ? "Loading clinics..."
            : loadError
              ? "Clinics could not be loaded."
              : "No active clinics found."
        }
        pagination={false}
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <ClinicsTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            locationOptions={locationOptions}
            onResetFilters={() => resetFilters(table, setGlobalFilter)}
          />
        )}
      />

      {loadError ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={retryLoad}>
            Try again
          </Button>
        </div>
      ) : null}

      <ClinicFormDialog
        open={clinicFormOpen}
        onOpenChange={setClinicFormOpen}
        mode="add"
        onSubmit={addClinic}
      />
    </div>
  );
}

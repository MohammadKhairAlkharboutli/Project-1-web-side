import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { doctorsApi } from "@/api/doctorsApi";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";

import { getDoctorColumns } from "./components/DoctorColumns";
import DoctorsTableToolbar from "./components/DoctorsTableToolbar";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load the doctors. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadDoctors() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await doctorsApi.getDoctors();

        if (isCurrent) {
          setDoctors(data);
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

    loadDoctors();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt]);

  const specializationOptions = Array.from(
    new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
  const columns = getDoctorColumns((doctor) =>
    navigate(`/admin/doctors/${doctor.id}`)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Review doctor profiles and the backend-aligned details shown in the admin UI.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={doctors}
        emptyMessage={
          isLoading
            ? "Loading doctors..."
            : loadError
              ? "Doctors could not be loaded."
              : "No doctors found."
        }
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <DoctorsTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            specializationOptions={specializationOptions}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          >
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}

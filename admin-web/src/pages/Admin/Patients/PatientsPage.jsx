import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { getPatientColumns } from "./components/PatientColumns";
import PatientsTableToolbar from "./components/PatientsTableToolbar";

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const debouncedSearch = useDebouncedValue(search);
  const columns = getPatientColumns((patient) =>
    navigate(`/admin/patients/${patient.id}`)
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadPatients() {
      setIsLoading(true);

      try {
        const response = await adminPatientsApi.getPatients({
          page,
          limit,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(status !== "all" ? { status } : {}),
        });

        if (isCurrent) {
          setPatients(response.data);
          setTotal(response.total);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          const message = error?.response?.data?.message || error?.message;
          setLoadError(
            Array.isArray(message)
              ? message.join(" ")
              : message || "We could not load the patients. Please try again.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, limit, loadAttempt, page, status]);

  function setSearch(value) {
    setSearchState(value);
    setPage(1);
  }

  function setStatus(value) {
    setStatusState(value);
    setPage(1);
  }

  function resetFilters(table) {
    setSearchState("");
    setStatusState("all");
    table.resetSorting();
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Review patient records using the same data shape the backend exposes."
      />

      <DataTable
        columns={columns}
        data={patients}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        serverFiltering
        serverPagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
          onPageSizeChange: (nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          },
        }}
        emptyMessage={
          isLoading
            ? "Loading patients..."
            : loadError
              ? "Patients could not be loaded."
              : "No patients found."
        }
        toolbar={({ table }) => (
          <PatientsTableToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            onResetFilters={() => resetFilters(table)}
          />
        )}
      />

      {loadError ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{loadError}</span>
          <button
            type="button"
            className="font-medium underline"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}

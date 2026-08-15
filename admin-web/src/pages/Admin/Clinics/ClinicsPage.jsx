import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { clinicsApi } from "@/api/clinicsApi";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

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
  const location = useLocation();
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionNotice] = useState(location.state?.notice || "");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state?.notice, navigate]);

  useEffect(() => {
    let isCurrent = true;

    async function loadClinics() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await clinicsApi.getAdminClinics({
          page,
          limit,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(status !== "all" ? { status } : {}),
        });

        if (isCurrent) {
          setClinics(response.data);
          setTotal(response.total);
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
  }, [debouncedSearch, limit, loadAttempt, page, status]);

  const columns = getClinicColumns((clinic) =>
    navigate(`/admin/clinics/${clinic.id}`),
  );

  function setSearch(value) {
    setSearchState(value);
    setPage(1);
  }

  function setStatus(value) {
    setStatusState(value);
    setPage(1);
  }

  function resetFilters() {
    setSearchState("");
    setStatusState("all");
    setPage(1);
  }

  async function addClinic(formData) {
    await clinicsApi.createClinic(formData);
    setPage(1);
    setLoadAttempt((attempt) => attempt + 1);
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
              : "No clinics match the current filters."
        }
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        serverFiltering
        sorting={false}
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
        toolbar={() => (
          <ClinicsTableToolbar
            globalFilter={search}
            setGlobalFilter={setSearch}
            status={status}
            setStatus={setStatus}
            onResetFilters={resetFilters}
          />
        )}
      />

      {actionNotice ? (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          role="status"
        >
          {actionNotice}
        </div>
      ) : null}

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

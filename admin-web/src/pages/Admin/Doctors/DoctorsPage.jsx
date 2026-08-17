import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { clinicsApi } from "@/api/clinicsApi";
import { doctorsApi } from "@/api/doctorsApi";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("all");
  const [clinicId, setClinicIdState] = useState("all");
  const [specialization, setSpecializationState] = useState("");
  const [clinics, setClinics] = useState([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [clinicLoadError, setClinicLoadError] = useState("");
  const [clinicLoadAttempt, setClinicLoadAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const debouncedSearch = useDebouncedValue(search);
  const debouncedSpecialization = useDebouncedValue(specialization);

  useEffect(() => {
    let isCurrent = true;

    async function loadDoctors() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await doctorsApi.getAdminDoctors({
          page,
          limit,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(status !== "all" ? { status } : {}),
          ...(clinicId !== "all" ? { clinicId } : {}),
          ...(debouncedSpecialization.trim()
            ? { specialization: debouncedSpecialization.trim() }
            : {}),
        });

        if (isCurrent) {
          setDoctors(data.data);
          setTotal(data.total);
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

    loadDoctors();

    return () => {
      isCurrent = false;
    };
  }, [
    clinicId,
    debouncedSearch,
    debouncedSpecialization,
    limit,
    loadAttempt,
    page,
    status,
  ]);

  useEffect(() => {
    let isCurrent = true;

    async function loadClinics() {
      setIsLoadingClinics(true);

      try {
        const data = await clinicsApi.getClinics();

        if (isCurrent) {
          setClinics(Array.isArray(data) ? data : []);
          setClinicLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setClinicLoadError(
            getErrorMessage(error).replace("doctors", "clinic options"),
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingClinics(false);
        }
      }
    }

    loadClinics();

    return () => {
      isCurrent = false;
    };
  }, [clinicLoadAttempt]);

  const columns = getDoctorColumns((doctor) =>
    navigate(`/admin/doctors/${doctor.id}`),
  );

  function setSearch(value) {
    setSearchState(value);
    setPage(1);
  }

  function setStatus(value) {
    setStatusState(value);
    setPage(1);
  }

  function setClinicId(value) {
    setClinicIdState(value);
    setPage(1);
  }

  function setSpecialization(value) {
    setSpecializationState(value);
    setPage(1);
  }

  function resetFilters(table) {
    setSearchState("");
    setStatusState("all");
    setClinicIdState("all");
    setSpecializationState("");
    table.resetSorting();
    setPage(1);
  }

  const hasActiveFilters = Boolean(
    search.trim() ||
      specialization.trim() ||
      status !== "all" ||
      clinicId !== "all",
  );
  const hasPendingDebouncedFilters =
    search !== debouncedSearch || specialization !== debouncedSpecialization;
  const showInitialEmptyState =
    !isLoading &&
    !hasPendingDebouncedFilters &&
    !loadError &&
    total === 0 &&
    !hasActiveFilters;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Review accepted doctor accounts, their clinical profiles, and clinic assignments."
      />

      {showInitialEmptyState ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-slate-800">No doctors yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Invite a doctor first. They will appear here after accepting the invitation and creating their account.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/admin/doctor-invitations">Open doctor invitations</Link>
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={doctors}
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
          emptyMessage={
            isLoading
              ? "Loading doctors..."
              : loadError
                ? "Doctors could not be loaded."
                : "No doctors match the current filters."
          }
          toolbar={({ table }) => (
            <DoctorsTableToolbar
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              clinicId={clinicId}
              setClinicId={setClinicId}
              clinics={clinics}
              isLoadingClinics={isLoadingClinics}
              specialization={specialization}
              setSpecialization={setSpecialization}
              onResetFilters={() => resetFilters(table)}
            />
          )}
        />
      )}

      {clinicLoadError ? (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <span>Clinic filters are unavailable. {clinicLoadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setClinicLoadAttempt((attempt) => attempt + 1)}
          >
            Retry clinic options
          </Button>
        </div>
      ) : null}

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

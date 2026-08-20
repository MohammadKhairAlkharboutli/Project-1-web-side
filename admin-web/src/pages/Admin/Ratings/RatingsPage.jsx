import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import { doctorsApi } from "@/api/doctorsApi";
import { ratingsApi } from "@/api/ratingsApi";
import DataTable from "@/components/shared/DataTable";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { getRatingColumns } from "./components/RatingColumns";
import RatingDetails from "./RatingDetails";
import RatingsToolbar from "./components/RatingsToolbar";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

function getDoctorOption(doctor) {
  return {
    id: Number(doctor.id),
    label: doctor.user?.fullName || `Doctor #${doctor.id}`,
    description: doctor.specialization || null,
  };
}

function getPatientOption(patient) {
  return {
    id: Number(patient.id),
    label: patient.user?.fullName || `Patient #${patient.id}`,
    description: patient.user?.email || patient.user?.phone || null,
  };
}

function getInitialOption(id, label) {
  const numericId = Number(id);

  return Number.isInteger(numericId) && numericId > 0
    ? { id: numericId, label: `${label} #${numericId}`, needsHydration: true }
    : null;
}

function getRatingActionCopy(currentStatus, nextStatus) {
  if (nextStatus === "hidden") {
    return {
      title: "Hide rating?",
      description: "This rating will no longer be visible to users or included in public averages. The rating and report history will remain available to administrators.",
      confirmLabel: "Hide rating",
      progressLabel: "Hiding...",
      successMessage: "Rating was hidden successfully.",
    };
  }

  if (nextStatus === "deleted") {
    return {
      title: "Delete rating?",
      description: "This performs a soft delete. The rating is removed from public use and remains in the administrator audit record.",
      confirmLabel: "Delete rating",
      progressLabel: "Deleting...",
      successMessage: "Rating was deleted successfully.",
    };
  }

  return {
    title: currentStatus === "deleted" ? "Restore deleted rating?" : "Unhide rating?",
    description: "This rating will be visible to users again and included in public averages.",
    confirmLabel: currentStatus === "deleted" ? "Restore rating" : "Unhide rating",
    progressLabel: currentStatus === "deleted" ? "Restoring..." : "Unhiding...",
    successMessage: currentStatus === "deleted" ? "Rating was restored successfully." : "Rating was unhidden successfully.",
  };
}

export default function RatingsPage() {
  const [searchParams] = useSearchParams();
  const [ratings, setRatings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearchState] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [updatingRatingId, setUpdatingRatingId] = useState(null);
  const [ratingAction, setRatingAction] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(() =>
    getInitialOption(searchParams.get("doctorId"), "Doctor"),
  );
  const [selectedPatient, setSelectedPatient] = useState(() =>
    getInitialOption(searchParams.get("patientId"), "Patient"),
  );
  const [scoreFilter, setScoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRating, setSelectedRating] = useState(null);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    if (!selectedDoctor?.needsHydration) {
      return undefined;
    }

    let isCurrent = true;

    doctorsApi
      .getDoctor(selectedDoctor.id)
      .then((doctor) => {
        if (isCurrent) {
          setSelectedDoctor(getDoctorOption(doctor));
        }
      })
      .catch(() => {
        if (isCurrent) {
          setSelectedDoctor((currentDoctor) => (
            currentDoctor
              ? { ...currentDoctor, needsHydration: false }
              : currentDoctor
          ));
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedDoctor]);

  useEffect(() => {
    if (!selectedPatient?.needsHydration) {
      return undefined;
    }

    let isCurrent = true;

    adminPatientsApi
      .getPatient(selectedPatient.id)
      .then((patient) => {
        if (isCurrent) {
          setSelectedPatient(getPatientOption(patient));
        }
      })
      .catch(() => {
        if (isCurrent) {
          setSelectedPatient((currentPatient) => (
            currentPatient
              ? { ...currentPatient, needsHydration: false }
              : currentPatient
          ));
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedPatient]);

  const loadDoctorOptions = useCallback(async (searchTerm) => {
    const response = await doctorsApi.getAdminDoctors({
      page: 1,
      limit: 25,
      ...(searchTerm ? { search: searchTerm } : {}),
    });

    return response.data.map(getDoctorOption);
  }, []);

  const loadPatientOptions = useCallback(async (searchTerm) => {
    const response = await adminPatientsApi.getPatients({
      page: 1,
      limit: 25,
      ...(searchTerm ? { search: searchTerm } : {}),
    });

    return response.data.map(getPatientOption);
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadRatings() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await ratingsApi.getAdminRatings({
          page,
          limit,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(selectedDoctor ? { doctorId: selectedDoctor.id } : {}),
          ...(selectedPatient ? { patientId: selectedPatient.id } : {}),
          ...(scoreFilter !== "all" ? { score: scoreFilter } : {}),
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        });

        if (isCurrent) {
          setRatings(response.data);
          setTotal(response.total);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error, "We could not load ratings."));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadRatings();

    return () => {
      isCurrent = false;
    };
  }, [
    debouncedSearch,
    limit,
    loadAttempt,
    page,
    scoreFilter,
    selectedDoctor,
    selectedPatient,
    statusFilter,
  ]);

  async function updateRatingStatus(rating, status) {
    setUpdatingRatingId(rating.id);
    setActionError("");
    setActionNotice("");

    try {
      if (status === "visible") {
        const conflictingRating = await ratingsApi.findVisibleRatingForAppointment(rating);

        if (conflictingRating) {
          setActionError(
            `This rating cannot be made visible because rating #${conflictingRating.id} is already the visible rating for the same patient and appointment.`,
          );
          return;
        }
      }

      const updatedRating = await ratingsApi.updateRatingStatus(rating.id, status);
      setRatings((currentRatings) =>
        currentRatings.map((item) =>
          String(item.id) === String(updatedRating.id)
            ? { ...item, ...updatedRating }
            : item,
        ),
      );
      setSelectedRating((currentRating) =>
        currentRating && String(currentRating.id) === String(updatedRating.id)
          ? { ...currentRating, ...updatedRating }
          : currentRating,
      );
      setRatingAction(null);
      setActionNotice(getRatingActionCopy(rating.status, status).successMessage);
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not update this rating."));
    } finally {
      setUpdatingRatingId(null);
    }
  }

  function requestRatingStatus(rating, status) {
    setActionError("");
    setRatingAction({ rating, status });
  }

  function setSearch(value) {
    setSearchState(value);
    setPage(1);
  }

  function setDoctorFilterValue(option) {
    setSelectedDoctor(option);
    setPage(1);
  }

  function setPatientFilterValue(option) {
    setSelectedPatient(option);
    setPage(1);
  }

  function setScoreFilterValue(value) {
    setScoreFilter(value);
    setPage(1);
  }

  function setStatusFilterValue(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function resetFilters(table) {
    setSearchState("");
    setSelectedDoctor(null);
    setSelectedPatient(null);
    setScoreFilter("all");
    setStatusFilter("all");
    table.resetSorting();
    table.setPageIndex(0);
    setPage(1);
  }

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Ratings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review and moderate ratings across doctors, patients, and appointments.
        </p>
      </div>

      <DataTable
        columns={getRatingColumns({
          onViewDetails: setSelectedRating,
          onUpdateStatus: requestRatingStatus,
          updatingRatingId,
        })}
        data={ratings}
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
            ? "Loading ratings..."
            : loadError
              ? "Ratings could not be loaded."
              : "No ratings found."
        }
        toolbar={(toolbarProps) => (
          <RatingsToolbar
            {...toolbarProps}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setDoctorFilterValue}
            loadDoctorOptions={loadDoctorOptions}
            selectedPatient={selectedPatient}
            setSelectedPatient={setPatientFilterValue}
            loadPatientOptions={loadPatientOptions}
            scoreFilter={scoreFilter}
            setScoreFilter={setScoreFilterValue}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilterValue}
            onResetFilters={() => resetFilters(toolbarProps.table)}
          />
        )}
      />

      {actionNotice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {actionNotice}
        </div>
      ) : null}

      {loadError || actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>{loadError || actionError}</p>
          {loadError ? (
            <button type="button" className="mt-2 font-medium underline" onClick={retryLoad}>
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      <RatingDetails
        rating={selectedRating}
        open={Boolean(selectedRating)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRating(null);
          }
        }}
        onUpdateStatus={requestRatingStatus}
        isUpdating={updatingRatingId === selectedRating?.id}
        actionError={actionError}
      />

      <AlertDialog
        open={Boolean(ratingAction)}
        onOpenChange={(open) => {
          if (!open && !updatingRatingId) {
            setRatingAction(null);
            setActionError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>{ratingAction ? getRatingActionCopy(ratingAction.rating.status, ratingAction.status).title : "Update rating?"}</AlertDialogTitle>
          <AlertDialogDescription>
              {ratingAction ? getRatingActionCopy(ratingAction.rating.status, ratingAction.status).description : ""}
            </AlertDialogDescription>
            {actionError ? (
              <p className="text-sm text-red-700" role="alert">{actionError}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(updatingRatingId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(updatingRatingId)}
              onClick={(event) => {
                event.preventDefault();
                if (ratingAction) updateRatingStatus(ratingAction.rating, ratingAction.status);
              }}
            >
              {updatingRatingId && ratingAction
                ? getRatingActionCopy(ratingAction.rating.status, ratingAction.status).progressLabel
                : ratingAction
                  ? getRatingActionCopy(ratingAction.rating.status, ratingAction.status).confirmLabel
                  : "Update rating"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

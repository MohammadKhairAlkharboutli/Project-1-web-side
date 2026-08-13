import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ratingsApi } from "@/api/ratingsApi";
import DataTable from "@/components/shared/DataTable";
import {
  ratingMatchesDoctorFilter,
  ratingMatchesPatientFilter,
} from "@/components/shared/Ratings/ratingUtils";
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

import { getRatingColumns } from "./components/RatingColumns";
import RatingDetails from "./RatingDetails";
import RatingsToolbar from "./components/RatingsToolbar";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function RatingsPage() {
  const [searchParams] = useSearchParams();
  const [allRatings, setAllRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [hidingRatingId, setHidingRatingId] = useState(null);
  const [ratingToHide, setRatingToHide] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState(
    searchParams.get("doctorId") || "",
  );
  const [patientFilter, setPatientFilter] = useState(
    searchParams.get("patientId") || "",
  );
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedRating, setSelectedRating] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadRatings() {
      try {
        const response = await ratingsApi.getAdminRatings();

        if (isCurrent) {
          setAllRatings(response.data);
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
  }, [loadAttempt]);

  const ratings = useMemo(
    () =>
      allRatings.filter((rating) => {
        const matchesDoctor = ratingMatchesDoctorFilter(rating, doctorFilter);
        const matchesPatient = ratingMatchesPatientFilter(rating, patientFilter);
        const matchesScore =
          scoreFilter === "all" || String(rating.score) === scoreFilter;

        return matchesDoctor && matchesPatient && matchesScore;
      }),
    [allRatings, doctorFilter, patientFilter, scoreFilter],
  );

  async function hideRating(rating) {
    setHidingRatingId(rating.id);
    setActionError("");
    setActionNotice("");

    try {
      const updatedRating = await ratingsApi.updateRatingStatus(rating.id, "hidden");
      setAllRatings((currentRatings) =>
        currentRatings.map((item) =>
          String(item.id) === String(updatedRating.id) ? updatedRating : item,
        ),
      );
      setSelectedRating((currentRating) =>
        currentRating && String(currentRating.id) === String(updatedRating.id)
          ? updatedRating
          : currentRating,
      );
      setRatingToHide(null);
      setActionNotice("Rating was hidden successfully.");
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not hide this rating."));
    } finally {
      setHidingRatingId(null);
    }
  }

  function requestHideRating(rating) {
    setActionError("");
    setRatingToHide(rating);
  }

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.resetSorting();
    table.setPageIndex(0);
    setDoctorFilter("");
    setPatientFilter("");
    setScoreFilter("all");
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
          onHide: requestHideRating,
          hidingRatingId,
        })}
        data={ratings}
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
            doctorFilter={doctorFilter}
            setDoctorFilter={setDoctorFilter}
            patientFilter={patientFilter}
            setPatientFilter={setPatientFilter}
            scoreFilter={scoreFilter}
            setScoreFilter={setScoreFilter}
            onResetFilters={() =>
              resetFilters(toolbarProps.table, toolbarProps.setGlobalFilter)
            }
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
        onHide={requestHideRating}
        isHiding={hidingRatingId === selectedRating?.id}
        actionError={actionError}
      />

      <AlertDialog
        open={Boolean(ratingToHide)}
        onOpenChange={(open) => {
          if (!open && !hidingRatingId) {
            setRatingToHide(null);
            setActionError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide rating?</AlertDialogTitle>
            <AlertDialogDescription>
              This rating will no longer be visible to users. The rating and its
              report history will remain available to administrators.
            </AlertDialogDescription>
            {actionError ? (
              <p className="text-sm text-red-700" role="alert">{actionError}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(hidingRatingId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(hidingRatingId)}
              onClick={(event) => {
                event.preventDefault();
                hideRating(ratingToHide);
              }}
            >
              {hidingRatingId ? "Hiding..." : "Hide rating"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

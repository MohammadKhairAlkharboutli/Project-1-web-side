import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import { mockRatings } from "@/components/shared/Ratings/mockRatingData";
import {
  ratingMatchesDoctorFilter,
  ratingMatchesPatientFilter,
} from "@/components/shared/Ratings/ratingUtils";

import { getRatingColumns } from "./components/RatingColumns";
import RatingsToolbar from "./components/RatingsToolbar";

export default function RatingsPage() {
  const [searchParams] = useSearchParams();
  const [doctorFilter, setDoctorFilter] = useState(
    searchParams.get("doctorId") || "",
  );
  const [patientFilter, setPatientFilter] = useState(
    searchParams.get("patientId") || "",
  );
  const [scoreFilter, setScoreFilter] = useState("all");

  const ratings = useMemo(
    () =>
      mockRatings.filter((rating) => {
        const matchesDoctor = ratingMatchesDoctorFilter(rating, doctorFilter);
        const matchesPatient = ratingMatchesPatientFilter(rating, patientFilter);
        const matchesScore =
          scoreFilter === "all" || String(rating.score) === scoreFilter;

        return matchesDoctor && matchesPatient && matchesScore;
      }),
    [doctorFilter, patientFilter, scoreFilter],
  );

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setDoctorFilter("");
    setPatientFilter("");
    setScoreFilter("all");
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
        columns={getRatingColumns()}
        data={ratings}
        emptyMessage="No ratings found."
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
    </section>
  );
}

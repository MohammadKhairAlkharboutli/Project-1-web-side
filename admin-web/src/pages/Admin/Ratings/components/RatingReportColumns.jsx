import { Link } from "react-router-dom";
import { ArrowUpDown, Check, Eye, X } from "lucide-react";

import RatingReportStatusBadge from "@/components/shared/Ratings/RatingReportStatusBadge";
import RatingScoreBadge from "@/components/shared/Ratings/RatingScoreBadge";
import { Button } from "@/components/ui/button";

import {
  formatRatingDate,
  getCommentPreview,
  getRatingDoctorName,
  getRatingPatientName,
  getPatientProfileName,
  getReportReasonLabel,
} from "@/components/shared/Ratings/ratingUtils";

export function getRatingReportColumns({ resolveReport, resolvingReportId }) {
  return [
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => getReportReasonLabel(row.original.reason),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <RatingReportStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "reporter",
      accessorFn: (report) => getPatientProfileName(report.reporterPatient, report.reporterPatientId),
      header: "Reporter",
      cell: ({ row }) => {
        const patientId = Number(row.original.reporterPatientId);
        const patientName = getPatientProfileName(row.original.reporterPatient, row.original.reporterPatientId);

        return Number.isInteger(patientId) && patientId > 0
          ? <Link to={`/admin/patients/${patientId}`} className="font-medium text-[var(--color-primary)] hover:underline">{patientName}</Link>
          : patientName;
      },
    },
    {
      id: "ratingScore",
      accessorFn: (report) => report.rating?.score,
      header: "Rating",
      cell: ({ row }) => <RatingScoreBadge score={row.original.rating?.score} />,
    },
    {
      id: "ratingComment",
      accessorFn: (report) => report.rating?.comment || "",
      header: "Reported Comment",
      cell: ({ row }) => (
        <p className="max-w-56 whitespace-normal break-words text-sm leading-5 text-slate-600 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
          {getCommentPreview(row.original.rating?.comment, 110)}
        </p>
      ),
    },
    {
      id: "doctor",
      accessorFn: (report) => getRatingDoctorName(report.rating),
      header: "Doctor",
      cell: ({ row }) => {
        const doctorId = Number(row.original.rating?.doctorProfileId);
        const doctorName = getRatingDoctorName(row.original.rating);

        return Number.isInteger(doctorId) && doctorId > 0
          ? <Link to={`/admin/doctors/${doctorId}`} className="font-medium text-[var(--color-primary)] hover:underline">{doctorName}</Link>
          : doctorName;
      },
    },
    {
      id: "reviewer",
      accessorFn: (report) => getRatingPatientName(report.rating),
      header: "Reviewer",
      cell: ({ row }) => {
        const patientId = Number(row.original.rating?.patientProfileId);
        const patientName = getRatingPatientName(row.original.rating);

        return Number.isInteger(patientId) && patientId > 0
          ? <Link to={`/admin/patients/${patientId}`} className="font-medium text-[var(--color-primary)] hover:underline">{patientName}</Link>
          : patientName;
      },
    },
    {
      id: "createdAt",
      accessorFn: (report) => report.createdAt,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatRatingDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isPending = row.original.status === "pending";

        return (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/rating-reports/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                Details
              </Link>
            </Button>

            {isPending ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={resolvingReportId === row.original.id}
                  onClick={() => resolveReport(row.original, "accept")}
                >
                  <Check className="h-4 w-4" />
                  {resolvingReportId === row.original.id ? "Resolving..." : "Accept"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={resolvingReportId === row.original.id}
                  onClick={() => resolveReport(row.original, "dismiss")}
                >
                  <X className="h-4 w-4" />
                  Dismiss
                </Button>
              </>
            ) : null}
          </div>
        );
      },
    },
  ];
}

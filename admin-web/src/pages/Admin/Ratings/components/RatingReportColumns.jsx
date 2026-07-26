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
  getReportReasonLabel,
} from "@/components/shared/Ratings/ratingUtils";

export function getRatingReportColumns() {
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
      accessorFn: (report) => report.reporterPatient?.user?.full_name || "",
      header: "Reporter",
      cell: ({ row }) => (
        <Link
          to={`/admin/patients/${row.original.reporterPatientId}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {row.original.reporterPatient?.user?.full_name || "Unknown Patient"}
        </Link>
      ),
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
      cell: ({ row }) => (
        <Link
          to={`/admin/doctors/${row.original.rating?.doctorProfileId}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {getRatingDoctorName(row.original.rating)}
        </Link>
      ),
    },
    {
      id: "reviewer",
      accessorFn: (report) => getRatingPatientName(report.rating),
      header: "Reviewer",
      cell: ({ row }) => (
        <Link
          to={`/admin/patients/${row.original.rating?.patientProfileId}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {getRatingPatientName(row.original.rating)}
        </Link>
      ),
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
                <Button variant="outline" size="sm" disabled>
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button variant="outline" size="sm" disabled>
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

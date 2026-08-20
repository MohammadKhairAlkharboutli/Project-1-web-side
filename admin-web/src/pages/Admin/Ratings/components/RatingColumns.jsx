import { Link } from "react-router-dom";
import { ArrowUpDown, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react";

import RatingScoreBadge from "@/components/shared/Ratings/RatingScoreBadge";
import RatingStatusBadge from "@/components/shared/Ratings/RatingStatusBadge";
import { Button } from "@/components/ui/button";

import {
  formatRatingDate,
  getCommentPreview,
  getRatingDoctorName,
  getRatingLabel,
  getRatingPatientName,
} from "@/components/shared/Ratings/ratingUtils";

export function getRatingColumns({ onViewDetails, onUpdateStatus, updatingRatingId }) {
  return [
    {
      accessorKey: "score",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <RatingScoreBadge score={row.original.score} />,
    },
    {
      id: "label",
      accessorFn: (rating) => getRatingLabel(rating.score),
      header: "Label",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <RatingStatusBadge status={row.original.status} />,
    },
    {
      id: "doctor",
      accessorFn: (rating) => getRatingDoctorName(rating),
      header: "Doctor",
      cell: ({ row }) => {
        const doctorId = Number(row.original.doctorProfileId);
        const doctorName = getRatingDoctorName(row.original);

        return Number.isInteger(doctorId) && doctorId > 0
          ? <Link to={`/admin/doctors/${doctorId}`} className="font-medium text-[var(--color-primary)] hover:underline">{doctorName}</Link>
          : doctorName;
      },
    },
    {
      id: "patient",
      accessorFn: (rating) => getRatingPatientName(rating),
      header: "Patient",
      cell: ({ row }) => {
        const patientId = Number(row.original.patientProfileId);
        const patientName = getRatingPatientName(row.original);

        return Number.isInteger(patientId) && patientId > 0
          ? <Link to={`/admin/patients/${patientId}`} className="font-medium text-[var(--color-primary)] hover:underline">{patientName}</Link>
          : patientName;
      },
    },
    {
      id: "appointment",
      accessorFn: (rating) => rating.appointmentId || "N/A",
      header: "Appointment",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900">
            #{row.original.appointmentId || "N/A"}
          </p>
          <p className="text-sm text-slate-500">
            {row.original.appointment?.requestedDate || "No date"}
          </p>
        </div>
      ),
    },
    {
      id: "comment",
      accessorFn: (rating) => rating.comment || "",
      header: "Comment",
      cell: ({ row }) => (
        <p className="max-w-56 whitespace-normal break-words text-sm leading-5 text-slate-600 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
          {getCommentPreview(row.original.comment, 110)}
        </p>
      ),
    },
    {
      id: "createdAt",
      accessorFn: (rating) => rating.createdAt,
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
        const rating = row.original;
        const isUpdating = updatingRatingId === rating.id;

        return <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(rating)}
          >
            <Eye className="h-4 w-4" />
            Details
          </Button>
          {rating.status === "visible" ? <Button variant="outline" size="sm" disabled={isUpdating} onClick={() => onUpdateStatus(rating, "hidden")}><EyeOff className="h-4 w-4" /> Hide</Button> : null}
          {rating.status === "hidden" ? <Button variant="outline" size="sm" disabled={isUpdating} onClick={() => onUpdateStatus(rating, "visible")}><RotateCcw className="h-4 w-4" /> Unhide</Button> : null}
          {rating.status === "deleted" ? <Button variant="outline" size="sm" disabled={isUpdating} onClick={() => onUpdateStatus(rating, "visible")}><RotateCcw className="h-4 w-4" /> Restore</Button> : null}
          {rating.status !== "deleted" ? <Button variant="outline" size="sm" disabled={isUpdating} onClick={() => onUpdateStatus(rating, "deleted")}><Trash2 className="h-4 w-4" /> {isUpdating ? "Updating..." : "Delete"}</Button> : null}
        </div>;
      },
    },
  ];
}

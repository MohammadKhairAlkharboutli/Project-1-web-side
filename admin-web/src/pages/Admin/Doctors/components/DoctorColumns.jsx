import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDoctorStatus,
  formatLanguagesSpoken,
  getDoctorDisplayName,
} from "../doctorUtils";

export function getDoctorColumns(onViewDoctor) {
  return [
    {
      id: "doctorName",
      accessorFn: (doctor) => getDoctorDisplayName(doctor),
      header: "Doctor",
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <div className="space-y-1">
            <p className="font-medium text-slate-900">
              {getDoctorDisplayName(doctor)}
            </p>
            <p className="text-sm text-slate-500">{doctor.user?.email || "No email"}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
    },
    {
      accessorKey: "experienceYears",
      header: "Experience",
      cell: ({ row }) => {
        const experienceYears = row.original.experienceYears;
        return typeof experienceYears === "number" ? `${experienceYears} years` : "N/A";
      },
    },
    {
      id: "languagesSpoken",
      accessorFn: (doctor) => formatLanguagesSpoken(doctor.languagesSpoken),
      header: "Languages",
    },
    {
      accessorKey: "averageRating",
      header: "Rating",
      cell: ({ row }) => {
        const averageRating = Number(row.original.averageRating);

        return Number.isFinite(averageRating)
          ? averageRating.toFixed(1)
          : "N/A";
      },
    },
    {
      accessorKey: "initialVisitFee",
      header: "Initial Fee",
      cell: ({ row }) => formatCurrency(row.original.initialVisitFee),
    },
    {
      accessorKey: "returnVisitFee",
      header: "Return Fee",
      cell: ({ row }) => formatCurrency(row.original.returnVisitFee),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const normalizedStatus = String(status || "").toLowerCase();
        const statusStyle = normalizedStatus === "active"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : normalizedStatus === "on_vacation"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-slate-100 text-slate-600";

        return (
          <Badge variant="outline" className={statusStyle}>
            {formatDoctorStatus(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDoctor(doctor)}
          >
            View
          </Button>
        );
      },
    },
  ];
}

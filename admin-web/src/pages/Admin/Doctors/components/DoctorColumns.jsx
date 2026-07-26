import { ArrowUpDown } from "lucide-react";

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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Doctor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <div className="space-y-1">
            <p className="font-medium text-slate-900">
              {getDoctorDisplayName(doctor)}
            </p>
            <p className="text-sm text-slate-500">{doctor.user.email}</p>
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
      cell: ({ row }) => `${row.original.experienceYears} years`,
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
        const averageRating = row.original.averageRating;

        return typeof averageRating === "number"
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

        return (
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
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

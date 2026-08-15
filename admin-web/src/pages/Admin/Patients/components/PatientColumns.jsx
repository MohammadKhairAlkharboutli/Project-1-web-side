import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatEnumLabel,
  formatPatientStatus,
  getPatientDisplayName,
  getPatientStatusBadgeClassName,
} from "../patientUtils";

export function getPatientColumns(onViewPatient) {
  return [
    {
      id: "patientName",
      accessorFn: (patient) => getPatientDisplayName(patient),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Patient
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const patient = row.original;
        const user = patient.user || {};

        return (
          <div className="space-y-1">
            <p className="font-medium text-slate-900">
              {getPatientDisplayName(patient)}
            </p>
            <p className="text-sm text-slate-500">{user.email || "No email"}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "occupation",
      header: "Occupation",
    },
    {
      id: "gender",
      accessorFn: (patient) => formatEnumLabel(patient.user?.gender),
      header: "Gender",
    },
    {
      id: "age",
      accessorFn: (patient) => patient.user?.age,
      header: "Age",
    },
    {
      accessorKey: "maritalStatus",
      header: "Marital Status",
      cell: ({ row }) => formatEnumLabel(row.original.maritalStatus),
    },
    {
      accessorKey: "noShowCount",
      header: "No Show Count",
    },
    {
      id: "status",
      accessorFn: (patient) => patient.user?.status,
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.user?.status;

        return (
          <Badge
            variant="outline"
            className={getPatientStatusBadgeClassName(status)}
          >
            {formatPatientStatus(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const patient = row.original;

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPatient(patient)}
          >
            View
          </Button>
        );
      },
    },
  ];
}

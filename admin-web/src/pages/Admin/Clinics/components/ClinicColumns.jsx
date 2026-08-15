import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatClinicRating,
  formatClinicStatus,
  getClinicStatusVariant,
} from "../clinicUtils";

export function getClinicColumns(onViewClinic) {
  return [
    {
      accessorKey: "name",
      header: "Clinic",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "averageRating",
      header: "Rating",
      cell: ({ row }) => formatClinicRating(row.original.averageRating),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <Badge variant={getClinicStatusVariant(status)}>
            {formatClinicStatus(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const clinic = row.original;

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewClinic(clinic)}
          >
            View
          </Button>
        );
      },
    },
  ];
}

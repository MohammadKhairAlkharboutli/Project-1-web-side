import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function getSecretaryColumns(onViewSecretary) {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Secretary
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "clinic",
      header: "Clinic",
    },
    {
      accessorKey: "shift",
      header: "Shift",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");

        return (
          <Badge variant={status === "Active" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const secretary = row.original;

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewSecretary(secretary)}
          >
            View
          </Button>
        );
      },
    },
  ];
}

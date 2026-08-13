import { useMemo } from "react";
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

import {
  formatLookupDate,
  getLookupDisplayName,
  getLookupParent,
} from "./lookupUtils";

function getLookupColumns({
  allLookups,
  isUpdatingStatus,
  onEditLookup,
  onRequestStatusChange,
  onDeleteLookup,
}) {
  return [
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {row.original.value}
        </code>
      ),
    },
    { accessorKey: "labelEn", header: "English label", cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.labelEn}</span> },
    { accessorKey: "labelAr", header: "Arabic label", cell: ({ row }) => <span className="whitespace-nowrap text-slate-700">{row.original.labelAr}</span> },
    {
      id: "parent",
      header: "Parent",
      accessorFn: (lookup) => getLookupDisplayName(getLookupParent(lookup, allLookups)) || "None",
      cell: ({ row }) => <span className="text-sm text-slate-600">{getLookupDisplayName(getLookupParent(row.original, allLookups)) || "None"}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (lookup) => (lookup.isActive ? "Active" : "Inactive"),
      cell: ({ row }) => {
        const lookup = row.original;

        return (
          <div className="grid w-36 grid-cols-[76px_28px] items-center gap-2">
            <Badge
              variant={lookup.isActive ? "secondary" : "outline"}
              className={lookup.isActive
                ? "min-w-[76px] justify-center bg-emerald-50 text-emerald-700"
                : "min-w-[76px] justify-center text-slate-500"}
            >
              {lookup.isActive ? "Active" : "Inactive"}
            </Badge>
            <Switch
              size="sm"
              checked={lookup.isActive}
              disabled={isUpdatingStatus}
              onCheckedChange={(nextActive) => onRequestStatusChange(lookup, nextActive)}
              aria-label={`${lookup.isActive ? "Deactivate" : "Activate"} ${lookup.labelEn}`}
            />
          </div>
        );
      },
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessorFn: (lookup) => lookup.updatedAt || lookup.updated_at || "",
      cell: ({ row }) => formatLookupDate(row.original.updatedAt || row.original.updated_at),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const lookup = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" className="bg-white" aria-label={`Open actions for ${lookup.labelEn}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onEditLookup(lookup)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isUpdatingStatus}
                  onSelect={() => onRequestStatusChange(lookup, !lookup.isActive)}
                >
                  <Power className="h-4 w-4" />
                  {lookup.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDeleteLookup(lookup)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

export default function DataLookupCategoryTable({
  category,
  lookups,
  allLookups,
  onEditLookup,
  onRequestStatusChange,
  onDeleteLookup,
  isUpdatingStatus,
}) {
  const columns = useMemo(
    () => getLookupColumns({
      allLookups,
      isUpdatingStatus,
      onEditLookup,
      onRequestStatusChange,
      onDeleteLookup,
    }),
    [allLookups, isUpdatingStatus, onDeleteLookup, onEditLookup, onRequestStatusChange],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{category.label}</h2>
          <p className="text-sm text-slate-500">
            {category.value} · {lookups.length} {lookups.length === 1 ? "lookup" : "lookups"}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={lookups}
        pagination={false}
        emptyMessage="No lookups in this category."
        rowClassName={(row) => row.original.isActive ? "transition-colors hover:bg-slate-50/80" : "bg-slate-50/70 text-slate-500 opacity-60 transition-colors hover:bg-slate-100/70"}
      />
    </section>
  );
}

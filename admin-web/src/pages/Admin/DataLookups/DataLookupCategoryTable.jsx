import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  formatLookupDate,
  getLookupDisplayName,
  getLookupParent,
} from "./lookupUtils";

export default function DataLookupCategoryTable({
  category,
  lookups,
  allLookups,
  onEditLookup,
  onToggleLookup,
  onDeleteLookup,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {category.label}
          </h2>
          <p className="text-sm text-slate-500">{category.value}</p>
        </div>
        <Badge variant="outline" className="w-fit bg-white text-slate-600">
          {lookups.length} {lookups.length === 1 ? "record" : "records"}
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Value</TableHead>
            <TableHead>English label</TableHead>
            <TableHead>Arabic label</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>
              <div className="w-36">Status</div>
            </TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lookups.length ? (
            lookups.map((lookup) => (
              <DataLookupRow
                key={lookup.id}
                lookup={lookup}
                allLookups={allLookups}
                onEditLookup={onEditLookup}
                onToggleLookup={onToggleLookup}
                onDeleteLookup={onDeleteLookup}
              />
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-20 text-center text-sm text-slate-500"
              >
                No lookups in this category.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}

function DataLookupRow({
  lookup,
  allLookups,
  onEditLookup,
  onToggleLookup,
  onDeleteLookup,
}) {
  const parent = getLookupParent(lookup, allLookups);

  return (
    <TableRow>
      <TableCell>
        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {lookup.value}
        </code>
      </TableCell>
      <TableCell className="font-medium text-slate-800">
        {lookup.labelEn}
      </TableCell>
      <TableCell>
        <span className="whitespace-nowrap text-slate-700">
          {lookup.labelAr}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-slate-600">
          {parent ? getLookupDisplayName(parent) : "None"}
        </span>
      </TableCell>
      <TableCell>
        <div className="grid w-36 grid-cols-[76px_28px] items-center gap-2">
          <Badge
            variant={lookup.isActive ? "secondary" : "outline"}
            className={
              lookup.isActive
                ? "min-w-[76px] justify-center bg-emerald-50 text-emerald-700"
                : "min-w-[76px] justify-center text-slate-500"
            }
          >
            {lookup.isActive ? "Active" : "Inactive"}
          </Badge>
          <Switch
            size="sm"
            checked={lookup.isActive}
            onCheckedChange={() => onToggleLookup(lookup.id)}
            aria-label={`Toggle ${lookup.labelEn} status`}
          />
        </div>
      </TableCell>
      <TableCell>{formatLookupDate(lookup.updatedAt)}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="bg-white"
                aria-label="Open lookup actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => onEditLookup(lookup)}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onToggleLookup(lookup.id)}>
                <Power className="h-4 w-4" />
                {lookup.isActive ? "Disable" : "Enable"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDeleteLookup(lookup)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

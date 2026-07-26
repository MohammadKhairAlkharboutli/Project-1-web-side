import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function DataTable({
  columns,
  data,
  emptyMessage = "No results found.",
  toolbar,
  initialPageSize = 10,
  initialColumnFilters = [],
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  rowClassName,
  pagination: paginationEnabled = true,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const normalizedPageSizeOptions = Array.from(
    new Set([...pageSizeOptions, initialPageSize])
  ).sort((a, b) => a - b);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    initialState: {
      columnFilters: initialColumnFilters,
    },

    state: {
      sorting,
      globalFilter,
      pagination,
    },

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginationEnabled
      ? getPaginationRowModel()
      : undefined,
  });

  return (
    <div className="space-y-4">
      {toolbar &&
        toolbar({
          table,
          globalFilter,
          setGlobalFilter,
        })}

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    typeof rowClassName === "function"
                      ? rowClassName(row)
                      : rowClassName
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paginationEnabled && (
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <NativeSelect
              className="w-20"
              value={String(table.getState().pagination.pageSize)}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
            >
              {normalizedPageSizeOptions.map((option) => (
                <NativeSelectOption key={option} value={String(option)}>
                  {option}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";

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
  sorting: sortingEnabled = true,
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
    getSortedRowModel: sortingEnabled ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginationEnabled
      ? getPaginationRowModel()
      : undefined,
  });

  const totalResultCount = table.getPreFilteredRowModel().rows.length;
  const filteredResultCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const currentPage = pageCount ? table.getState().pagination.pageIndex + 1 : 0;
  const pageRows = table.getRowModel().rows.length;
  const firstVisibleResult = filteredResultCount
    ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
    : 0;
  const lastVisibleResult = paginationEnabled
    ? Math.min(firstVisibleResult + pageRows - 1, filteredResultCount)
    : filteredResultCount;
  const activeColumnFilters = table.getState().columnFilters.map((filter) => {
    const column = table.getColumn(filter.id);
    const header = column?.columnDef.header;

    return {
      id: filter.id,
      label: typeof header === "string" ? header : filter.id,
      value: Array.isArray(filter.value) ? filter.value.join(", ") : String(filter.value),
    };
  });

  function getSortIcon(column) {
    const direction = column.getIsSorted();

    if (direction === "asc") {
      return <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />;
    }

    if (direction === "desc") {
      return <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />;
    }

    return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />;
  }

  return (
    <div className="space-y-4">
      {toolbar &&
        toolbar({
          table,
          globalFilter,
          setGlobalFilter,
        })}

      {(globalFilter || activeColumnFilters.length > 0) && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active table filters">
          <span className="text-sm font-medium text-slate-500">Active filters:</span>
          {globalFilter && (
            <button
              type="button"
              onClick={() => {
                setGlobalFilter("");
                table.setPageIndex(0);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 transition hover:bg-blue-100"
            >
              Search: {globalFilter}
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          {activeColumnFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                table.getColumn(filter.id)?.setFilterValue(undefined);
                table.setPageIndex(0);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {filter.label}: {filter.value}
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : sortingEnabled && header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-left font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                        title={`Sort by ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : "this column"}`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {getSortIcon(header.column)}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
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
                      : rowClassName || "transition-colors hover:bg-slate-50/80"
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

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite">
          {filteredResultCount === totalResultCount
            ? `${filteredResultCount} ${filteredResultCount === 1 ? "result" : "results"}`
            : `${filteredResultCount} of ${totalResultCount} results`}
          {paginationEnabled && filteredResultCount
            ? ` · Showing ${firstVisibleResult}-${lastVisibleResult}`
            : ""}
        </p>

        {paginationEnabled && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
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

            <span className="whitespace-nowrap">
              Page {currentPage || 1} of {pageCount || 1}
            </span>

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
    </div>
  );
}

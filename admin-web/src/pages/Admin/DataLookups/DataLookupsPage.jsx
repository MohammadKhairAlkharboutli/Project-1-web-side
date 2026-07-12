import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import DataLookupCategoryTable from "./DataLookupCategoryTable";
import DataLookupFormDialog from "./DataLookupFormDialog";
import { LOOKUP_CATEGORIES, LOOKUP_STATUS_OPTIONS } from "./lookupUtils";
import { mockDataLookups } from "./mockLookupData";

export default function DataLookupsPage() {
  const [lookups, setLookups] = useState(mockDataLookups);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLookup, setEditingLookup] = useState(null);
  const [lookupToDelete, setLookupToDelete] = useState(null);

  const groupedLookups = useMemo(
    () =>
      LOOKUP_CATEGORIES.map((category) => ({
        ...category,
        lookups: lookups
          .filter((lookup) => lookup.category === category.value)
          .filter(
            (lookup) =>
              statusFilter === "all" ||
              (statusFilter === "active" && lookup.isActive) ||
              (statusFilter === "inactive" && !lookup.isActive),
          ),
      })),
    [lookups, statusFilter],
  );

  function openAddDialog() {
    setEditingLookup(null);
    setFormOpen(true);
  }

  function openEditDialog(lookup) {
    setEditingLookup(lookup);
    setFormOpen(true);
  }

  function saveLookup(formData) {
    const timestamp = new Date().toISOString();

    if (editingLookup) {
      setLookups((current) =>
        current.map((lookup) =>
          lookup.id === editingLookup.id
            ? {
                ...lookup,
                ...formData,
                updatedAt: timestamp,
              }
            : lookup,
        ),
      );
    } else {
      setLookups((current) => {
        const nextId = Math.max(...current.map((lookup) => Number(lookup.id))) + 1;

        return [
          ...current,
          {
            id: nextId,
            ...formData,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];
      });
    }

    setFormOpen(false);
    setEditingLookup(null);
  }

  function toggleLookupStatus(lookupId) {
    setLookups((current) =>
      current.map((lookup) =>
        lookup.id === lookupId
          ? {
              ...lookup,
              isActive: !lookup.isActive,
              updatedAt: new Date().toISOString(),
            }
          : lookup,
      ),
    );
  }

  function deleteLookup() {
    if (!lookupToDelete) {
      return;
    }

    setLookups((current) =>
      current
        .filter((lookup) => lookup.id !== lookupToDelete.id)
        .map((lookup) =>
          String(lookup.parentId) === String(lookupToDelete.id)
            ? { ...lookup, parentId: null, updatedAt: new Date().toISOString() }
            : lookup,
        ),
    );
    setLookupToDelete(null);
  }

  function resetFilters() {
    setStatusFilter("all");
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Data Lookups
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage reusable lookup data such as medical conditions, allergies,
            specialties, and reference values.
          </p>
        </div>

        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add data lookup
        </Button>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Lookup categories
          </h2>
          <p className="text-sm text-slate-500">
            Categories are fixed by the backend. Manage records inside each
            category below.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <NativeSelect
            className="w-full sm:w-40"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {LOOKUP_STATUS_OPTIONS.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {groupedLookups.map((category) => (
          <DataLookupCategoryTable
            key={category.value}
            category={category}
            lookups={category.lookups}
            allLookups={lookups}
            onEditLookup={openEditDialog}
            onToggleLookup={toggleLookupStatus}
            onDeleteLookup={setLookupToDelete}
          />
        ))}
      </div>

      <DataLookupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editingLookup ? "edit" : "add"}
        lookup={editingLookup}
        lookups={lookups}
        onSubmit={saveLookup}
      />

      <AlertDialog
        open={Boolean(lookupToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setLookupToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete data lookup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {lookupToDelete?.labelEn || "this lookup"} from
              the mock admin list. Disabling is usually safer once real records
              reference lookup values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={deleteLookup}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

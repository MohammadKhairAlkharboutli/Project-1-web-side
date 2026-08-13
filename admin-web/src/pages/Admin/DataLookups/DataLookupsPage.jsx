import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { lookupsApi } from "@/api/lookupsApi";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import DataLookupCategoryTable from "./DataLookupCategoryTable";
import DataLookupFormDialog from "./DataLookupFormDialog";
import { LOOKUP_CATEGORIES } from "./lookupUtils";

const STATUS_TABS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
];

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function matchesSearch(lookup, search) {
  if (!search) return true;

  return [lookup.value, lookup.labelEn, lookup.labelAr]
    .filter(Boolean)
    .some((value) => String(value).toLocaleLowerCase().includes(search));
}

export default function DataLookupsPage() {
  const [lookups, setLookups] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLookup, setEditingLookup] = useState(null);
  const [lookupToDeactivate, setLookupToDeactivate] = useState(null);
  const [lookupToDelete, setLookupToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadLookups = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setLookups(await lookupsApi.getAdminLookups());
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load data lookups."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadLookups, 0);
    return () => window.clearTimeout(timer);
  }, [loadLookups]);

  const statusCounts = useMemo(() => ({
    active: lookups.filter((lookup) => lookup.isActive).length,
    inactive: lookups.filter((lookup) => !lookup.isActive).length,
    all: lookups.length,
  }), [lookups]);

  const visibleLookups = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();

    return lookups.filter((lookup) => (
      (statusFilter === "all" || (statusFilter === "active" ? lookup.isActive : !lookup.isActive))
      && (categoryFilter === "all" || lookup.category === categoryFilter)
      && matchesSearch(lookup, normalizedSearch)
    ));
  }, [categoryFilter, lookups, searchQuery, statusFilter]);

  const groupedLookups = useMemo(() => LOOKUP_CATEGORIES
    .filter((category) => categoryFilter === "all" || category.value === categoryFilter)
    .map((category) => ({
      ...category,
      lookups: visibleLookups.filter((lookup) => lookup.category === category.value),
    }))
    .filter((category) => categoryFilter !== "all" || category.lookups.length > 0),
  [categoryFilter, visibleLookups]);

  function resetFilters() {
    setStatusFilter("active");
    setCategoryFilter("all");
    setSearchQuery("");
  }

  function openAddDialog() {
    setEditingLookup(null);
    setFormError("");
    setFormOpen(true);
  }

  function openEditDialog(lookup) {
    setEditingLookup(lookup);
    setFormError("");
    setFormOpen(true);
  }

  async function saveLookup(formData) {
    setIsSaving(true);
    setFormError("");
    try {
      const saved = editingLookup
        ? await lookupsApi.updateLookup(editingLookup.id, formData)
        : await lookupsApi.createLookup(formData);

      setLookups((current) => editingLookup
        ? current.map((lookup) => lookup.id === editingLookup.id ? saved : lookup)
        : [...current, saved]);
      setFormOpen(false);
      setEditingLookup(null);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to save this data lookup."));
    } finally {
      setIsSaving(false);
    }
  }

  function requestStatusChange(lookup, nextActive) {
    setActionError("");
    if (nextActive) {
      updateLookupStatus(lookup);
      return;
    }

    setLookupToDeactivate(lookup);
  }

  async function updateLookupStatus(lookup) {
    setIsUpdatingStatus(true);
    setActionError("");
    try {
      const updated = await lookupsApi.toggleLookupStatus(lookup.id);
      setLookups((current) => current.map((item) => item.id === updated.id ? updated : item));
      setLookupToDeactivate(null);
    } catch (error) {
      setActionError(getErrorMessage(error, "Unable to update lookup status."));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function deleteLookup() {
    if (!lookupToDelete) return;
    setIsSaving(true);
    setActionError("");
    try {
      await lookupsApi.deleteLookup(lookupToDelete.id);
      setLookups((current) => current.filter((lookup) => lookup.id !== lookupToDelete.id));
      setLookupToDelete(null);
    } catch (error) {
      setActionError(getErrorMessage(error, "Unable to delete this data lookup."));
    } finally {
      setIsSaving(false);
    }
  }

  const hasActiveFilters = statusFilter !== "active" || categoryFilter !== "all" || Boolean(searchQuery);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Data Lookups</h1>
          <p className="mt-1 text-sm text-slate-600">Manage the values available in clinic forms. Deactivated values stay on existing records but cannot be selected for new ones.</p>
        </div>
        <Button onClick={openAddDialog} disabled={isLoading}>
          <Plus className="h-4 w-4" />
          Add data lookup
        </Button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Data lookup filters">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Status</p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="Lookup status">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${statusFilter === tab.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs text-slate-500">{statusCounts[tab.value]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                className="w-full pl-9 sm:w-64"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search value or label"
                aria-label="Search data lookups"
              />
            </div>
            <NativeSelect className="w-full sm:w-52" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
              <NativeSelectOption value="all">All categories</NativeSelectOption>
              {LOOKUP_CATEGORIES.map((category) => (
                <NativeSelectOption key={category.value} value={category.value}>{category.label}</NativeSelectOption>
              ))}
            </NativeSelect>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
        <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500" aria-live="polite">
          Showing {visibleLookups.length} of {lookups.length} {lookups.length === 1 ? "lookup" : "lookups"}. Select a column heading to change its order.
        </p>
      </section>

      {actionError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>}

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{loadError}</p>
          <Button className="mt-3" variant="outline" onClick={loadLookups}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">Loading data lookups…</div>
      ) : groupedLookups.length ? (
        <div className="space-y-5">
          {groupedLookups.map((category) => (
            <DataLookupCategoryTable
              key={category.value}
              category={category}
              lookups={category.lookups}
              allLookups={lookups}
              isUpdatingStatus={isUpdatingStatus}
              onEditLookup={openEditDialog}
              onRequestStatusChange={requestStatusChange}
              onDeleteLookup={setLookupToDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <h2 className="font-medium text-slate-800">No data lookups found</h2>
          <p className="mt-1 text-sm text-slate-500">Try another status, category, or search term.</p>
          {hasActiveFilters && <Button className="mt-4" variant="outline" onClick={resetFilters}>Reset filters</Button>}
        </div>
      )}

      <DataLookupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editingLookup ? "edit" : "add"}
        lookup={editingLookup}
        lookups={lookups}
        onSubmit={saveLookup}
        isSaving={isSaving}
        submitError={formError}
      />

      <AlertDialog open={Boolean(lookupToDeactivate)} onOpenChange={(open) => { if (!open && !isUpdatingStatus) setLookupToDeactivate(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate data lookup?</AlertDialogTitle>
            <AlertDialogDescription>
              {lookupToDeactivate?.labelEn || "This lookup"} will no longer be available for new selections. Existing patient and clinic records will keep their saved value. You can activate it again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isUpdatingStatus} onClick={(event) => { event.preventDefault(); updateLookupStatus(lookupToDeactivate); }}>
              {isUpdatingStatus ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(lookupToDelete)} onOpenChange={(open) => { if (!open && !isSaving) setLookupToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete data lookup?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {lookupToDelete?.labelEn || "this lookup"}. Deactivation is safer once real records reference it.</AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isSaving} onClick={(event) => { event.preventDefault(); deleteLookup(); }}>
              {isSaving ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { lookupsApi } from "@/api/lookupsApi";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import DataLookupCategoryTable from "./DataLookupCategoryTable";
import DataLookupFormDialog from "./DataLookupFormDialog";
import { LOOKUP_CATEGORIES, LOOKUP_STATUS_OPTIONS } from "./lookupUtils";

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

export default function DataLookupsPage() {
  const [lookups, setLookups] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLookup, setEditingLookup] = useState(null);
  const [lookupToDelete, setLookupToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadLookups = useCallback(async () => {
    setIsLoading(true); setLoadError("");
    try { setLookups(await lookupsApi.getAdminLookups()); }
    catch (error) { setLoadError(getErrorMessage(error, "Unable to load data lookups.")); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadLookups, 0);
    return () => window.clearTimeout(timer);
  }, [loadLookups]);

  const groupedLookups = useMemo(() => LOOKUP_CATEGORIES.map((category) => ({
    ...category,
    lookups: lookups.filter((lookup) => lookup.category === category.value).filter((lookup) =>
      statusFilter === "all" || (statusFilter === "active" && lookup.isActive) || (statusFilter === "inactive" && !lookup.isActive)),
  })), [lookups, statusFilter]);

  function openAddDialog() { setEditingLookup(null); setFormError(""); setFormOpen(true); }
  function openEditDialog(lookup) { setEditingLookup(lookup); setFormError(""); setFormOpen(true); }

  async function saveLookup(formData) {
    setIsSaving(true); setFormError("");
    try {
      const { isActive, ...payload } = formData;
      const saved = editingLookup
        ? await lookupsApi.updateLookup(editingLookup.id, payload)
        : await lookupsApi.createLookup(payload);
      const finalLookup = editingLookup && Boolean(isActive) !== Boolean(saved.isActive)
        ? await lookupsApi.toggleLookupStatus(saved.id) : saved;
      setLookups((current) => editingLookup
        ? current.map((lookup) => lookup.id === editingLookup.id ? finalLookup : lookup)
        : [...current, finalLookup]);
      setFormOpen(false); setEditingLookup(null);
    } catch (error) { setFormError(getErrorMessage(error, "Unable to save this data lookup.")); }
    finally { setIsSaving(false); }
  }

  async function toggleLookupStatus(lookupId) {
    setActionError("");
    try {
      const updated = await lookupsApi.toggleLookupStatus(lookupId);
      setLookups((current) => current.map((lookup) => lookup.id === updated.id ? updated : lookup));
    } catch (error) { setActionError(getErrorMessage(error, "Unable to update lookup status.")); }
  }

  async function deleteLookup() {
    if (!lookupToDelete) return;
    setIsSaving(true); setActionError("");
    try {
      await lookupsApi.deleteLookup(lookupToDelete.id);
      setLookups((current) => current.filter((lookup) => lookup.id !== lookupToDelete.id));
      setLookupToDelete(null);
    } catch (error) { setActionError(getErrorMessage(error, "Unable to delete this data lookup.")); }
    finally { setIsSaving(false); }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">Data Lookups</h1><p className="mt-1 text-sm text-slate-600">Manage reusable lookup data such as medical conditions, allergies, specialties, and reference values.</p></div><Button onClick={openAddDialog} disabled={isLoading}><Plus className="h-4 w-4" />Add data lookup</Button></div>
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold text-slate-900">Lookup categories</h2><p className="text-sm text-slate-500">Categories are fixed by the backend. Manage records inside each category below.</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><NativeSelect className="w-full sm:w-40" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{LOOKUP_STATUS_OPTIONS.map((option) => <NativeSelectOption key={option.value} value={option.value}>{option.label}</NativeSelectOption>)}</NativeSelect><Button variant="outline" onClick={() => setStatusFilter("all")}>Reset</Button></div></div>
      {actionError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>}
      {loadError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{loadError}</p><Button className="mt-3" variant="outline" onClick={loadLookups}>Retry</Button></div> : isLoading ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">Loading data lookups…</div> : <div className="space-y-5">{groupedLookups.map((category) => <DataLookupCategoryTable key={category.value} category={category} lookups={category.lookups} allLookups={lookups} onEditLookup={openEditDialog} onToggleLookup={toggleLookupStatus} onDeleteLookup={setLookupToDelete} />)}</div>}
      <DataLookupFormDialog open={formOpen} onOpenChange={setFormOpen} mode={editingLookup ? "edit" : "add"} lookup={editingLookup} lookups={lookups} onSubmit={saveLookup} isSaving={isSaving} submitError={formError} />
      <AlertDialog open={Boolean(lookupToDelete)} onOpenChange={(open) => { if (!open && !isSaving) setLookupToDelete(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete data lookup?</AlertDialogTitle><AlertDialogDescription>This will permanently remove {lookupToDelete?.labelEn || "this lookup"}. Disabling is usually safer once real records reference it.</AlertDialogDescription></AlertDialogHeader>{actionError && <p className="text-sm text-red-600">{actionError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={isSaving} onClick={(event) => { event.preventDefault(); deleteLookup(); }}>{isSaving ? "Deleting…" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </section>
  );
}

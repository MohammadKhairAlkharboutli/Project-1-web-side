import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";

import {
  getEligibleParentLookups,
  getLookupCategoryLabel,
  getLookupDisplayName,
  LOOKUP_CATEGORIES,
} from "./lookupUtils";

const EMPTY_FORM = {
  category: "BLOOD_TYPE",
  value: "",
  labelEn: "",
  labelAr: "",
  parentId: "",
  isActive: true,
};

export default function DataLookupFormDialog({
  open,
  onOpenChange,
  mode = "add",
  lookup,
  lookups,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DataLookupFormContent
          key={`${mode}-${lookup?.id || "new"}`}
          mode={mode}
          lookup={lookup}
          lookups={lookups}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function getInitialForm(lookup) {
  if (!lookup) {
    return EMPTY_FORM;
  }

  return {
    category: lookup.category,
    value: lookup.value,
    labelEn: lookup.labelEn,
    labelAr: lookup.labelAr,
    parentId: lookup.parentId ? String(lookup.parentId) : "",
    isActive: Boolean(lookup.isActive),
  };
}

function DataLookupFormContent({
  mode,
  lookup,
  lookups,
  onOpenChange,
  onSubmit,
}) {
  const [form, setForm] = useState(() => getInitialForm(lookup));

  const parentOptions = useMemo(
    () => getEligibleParentLookups(form.category, lookups, lookup?.id),
    [form.category, lookup?.id, lookups],
  );

  const hasParentOptions = parentOptions.length > 0;

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCategoryChange(category) {
    setForm((current) => ({
      ...current,
      category,
      parentId: "",
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      ...form,
      value: form.value.trim(),
      labelEn: form.labelEn.trim(),
      labelAr: form.labelAr.trim(),
      parentId: form.parentId ? Number(form.parentId) : null,
    });
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit data lookup" : "Add data lookup"}
          </DialogTitle>
          <DialogDescription>
            Manage one official selectable value used by clinic forms.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Value
            <Input
              value={form.value}
              onChange={(event) => updateField("value", event.target.value)}
              placeholder="ASTHMA"
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Category
            <NativeSelect
              className="w-full"
              value={form.category}
              onChange={(event) => handleCategoryChange(event.target.value)}
            >
              {LOOKUP_CATEGORIES.map((category) => (
                <NativeSelectOption key={category.value} value={category.value}>
                  {category.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            English label
            <Input
              value={form.labelEn}
              onChange={(event) => updateField("labelEn", event.target.value)}
              placeholder="Asthma"
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Arabic label
            <Input
              value={form.labelAr}
              onChange={(event) => updateField("labelAr", event.target.value)}
              placeholder="Arabic display label"
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Parent
            <NativeSelect
              className="w-full"
              value={form.parentId}
              disabled={!hasParentOptions}
              onChange={(event) => updateField("parentId", event.target.value)}
            >
              <NativeSelectOption value="">
                {hasParentOptions ? "No parent" : "No parent needed"}
              </NativeSelectOption>
              {parentOptions.map((parent) => (
                <NativeSelectOption key={parent.id} value={String(parent.id)}>
                  {getLookupDisplayName(parent)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {hasParentOptions && (
              <span className="text-xs font-normal text-slate-500">
                Parent options come from{" "}
                {getLookupCategoryLabel(parentOptions[0].category)}.
              </span>
            )}
          </label>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Active</p>
              <p className="text-xs text-slate-500">
                Active options appear in normal forms.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => updateField("isActive", checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === "edit" ? "Save changes" : "Add lookup"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

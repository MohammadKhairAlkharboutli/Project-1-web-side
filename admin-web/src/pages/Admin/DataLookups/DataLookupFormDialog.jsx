import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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

const lookupCategoryValues = LOOKUP_CATEGORIES.map((category) => category.value);

const dataLookupFormSchema = z.object({
  category: z.enum(lookupCategoryValues, {
    error: "Category is required.",
  }),
  value: z.string().trim().min(1, "Value is required."),
  labelEn: z.string().trim().min(1, "English label is required."),
  labelAr: z.string().trim().min(1, "Arabic label is required."),
  parentId: z.string(),
  isActive: z.boolean(),
});

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

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-normal text-red-600">{message}</span>;
}

function DataLookupFormContent({
  mode,
  lookup,
  lookups,
  onOpenChange,
  onSubmit,
}) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dataLookupFormSchema),
    defaultValues: getInitialForm(lookup),
  });

  const category = useWatch({ control, name: "category" });
  const categoryField = register("category");

  const parentOptions = useMemo(
    () => getEligibleParentLookups(category, lookups, lookup?.id),
    [category, lookup?.id, lookups],
  );

  const hasParentOptions = parentOptions.length > 0;

  function submitLookup(formData) {
    onSubmit({
      ...formData,
      parentId: formData.parentId ? Number(formData.parentId) : null,
    });
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <form onSubmit={handleSubmit(submitLookup)} noValidate>
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
              {...register("value")}
              aria-invalid={Boolean(errors.value)}
              placeholder="ASTHMA"
            />
            <FieldError message={errors.value?.message} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Category
            <NativeSelect
              className="w-full"
              aria-invalid={Boolean(errors.category)}
              {...categoryField}
              onChange={(event) => {
                categoryField.onChange(event);
                setValue("parentId", "");
              }}
            >
              {LOOKUP_CATEGORIES.map((category) => (
                <NativeSelectOption key={category.value} value={category.value}>
                  {category.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError message={errors.category?.message} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            English label
            <Input
              {...register("labelEn")}
              aria-invalid={Boolean(errors.labelEn)}
              placeholder="Asthma"
            />
            <FieldError message={errors.labelEn?.message} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Arabic label
            <Input
              {...register("labelAr")}
              aria-invalid={Boolean(errors.labelAr)}
              placeholder="Arabic display label"
            />
            <FieldError message={errors.labelAr?.message} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Parent
            <NativeSelect
              className="w-full"
              {...register("parentId")}
              disabled={!hasParentOptions}
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
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
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

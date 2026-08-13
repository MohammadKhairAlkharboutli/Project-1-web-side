import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
});

export default function DataLookupFormDialog({
  open,
  onOpenChange,
  mode = "add",
  lookup,
  lookups,
  onSubmit,
  isSaving,
  submitError,
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
          isSaving={isSaving}
          submitError={submitError}
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
  isSaving,
  submitError,
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
    () => getEligibleParentLookups(category, lookups, lookup?.id, lookup?.parentId),
    [category, lookup?.id, lookup?.parentId, lookups],
  );

  const hasParentOptions = parentOptions.length > 0;

  async function submitLookup(formData) {
    await onSubmit({
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
                Inactive values cannot be selected for new relationships.
              </span>
            )}
          </label>

        </div>

        <DialogFooter>
          {submitError && <p className="mr-auto text-sm text-red-600">{submitError}</p>}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : mode === "edit" ? "Save changes" : "Add lookup"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

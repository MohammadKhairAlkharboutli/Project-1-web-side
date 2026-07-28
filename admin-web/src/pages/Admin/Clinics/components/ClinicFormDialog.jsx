import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

const CLINIC_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "closed", label: "Closed" },
];

const clinicFormSchema = z.object({
  name: z.string().trim().min(1, "Clinic name is required."),
  location: z.string().trim().min(1, "Location is required."),
  status: z.enum(["active", "maintenance", "closed"], {
    error: "Status is required.",
  }),
  description: z.string().trim().min(1, "Description is required."),
});

const EMPTY_CLINIC_FORM = {
  name: "",
  location: "",
  status: "active",
  description: "",
};

function getDefaultValues(clinic) {
  if (!clinic) {
    return EMPTY_CLINIC_FORM;
  }

  return {
    name: clinic.name ?? "",
    location: clinic.location ?? "",
    status: clinic.status ?? "active",
    description: clinic.description ?? "",
  };
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-normal text-red-600">{message}</span>;
}

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not save the clinic. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function ClinicFormDialog({
  open,
  onOpenChange,
  mode = "add",
  clinic,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ClinicFormContent
          key={`${mode}-${clinic?.id ?? "new"}`}
          mode={mode}
          clinic={clinic}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function ClinicFormContent({ mode, clinic, onOpenChange, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: getDefaultValues(clinic),
  });

  const [requestError, setRequestError] = useState("");

  async function submitClinic(formData) {
    setRequestError("");

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  const isEditMode = mode === "edit";

  return (
    <DialogContent className="sm:max-w-3xl">
      <form onSubmit={handleSubmit(submitClinic)}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit clinic info" : "Add clinic"}
          </DialogTitle>
          <DialogDescription>
            Enter the core clinic profile details used across the admin area.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Clinic name
            <Input
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              placeholder="Downtown Clinic"
            />
            <FieldError message={errors.name?.message} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Location
            <Input
              {...register("location")}
              aria-invalid={Boolean(errors.location)}
              placeholder="New York"
            />
            <FieldError message={errors.location?.message} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Status
            <NativeSelect
              className="w-full"
              aria-invalid={Boolean(errors.status)}
              {...register("status")}
            >
              {CLINIC_STATUS_OPTIONS.map((status) => (
                <NativeSelectOption key={status.value} value={status.value}>
                  {status.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError message={errors.status?.message} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            Description
            <textarea
              {...register("description")}
              aria-invalid={Boolean(errors.description)}
              className="min-h-32 w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base leading-6 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
              placeholder="Describe the clinic focus, services, and operating context."
            />
            <FieldError message={errors.description?.message} />
          </label>

          {requestError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2"
              role="alert"
            >
              {requestError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save changes"
                : "Add clinic"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

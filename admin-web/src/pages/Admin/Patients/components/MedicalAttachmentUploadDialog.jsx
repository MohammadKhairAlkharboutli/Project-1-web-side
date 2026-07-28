import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, LoaderCircle } from "lucide-react";
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

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const medicalAttachmentSchema = z.object({
  files: z
    .array(z.any())
    .min(1, "Choose at least one file.")
    .max(MAX_FILES, `You can upload up to ${MAX_FILES} files at once.`)
    .refine(
      (files) => files.every((file) => ACCEPTED_FILE_TYPES.includes(file.type)),
      "Only PDF, JPG, PNG, and WebP files are allowed.",
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE_BYTES),
      "Each file must be 10 MB or smaller.",
    ),
  description: z.string().trim().max(500, "Description cannot be longer than 500 characters."),
});

/**
 * Reusable upload form. Supply onSubmit when the attachment API is connected;
 * it receives { files, description } after client-side validation succeeds.
 */
export default function MedicalAttachmentUploadDialog({
  open,
  onOpenChange,
  onSubmit,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(medicalAttachmentSchema),
    defaultValues: { files: [], description: "" },
  });
  const fileField = register("files");

  function clearForm() {
    reset();
    setSelectedFiles([]);
  }

  function closeDialog(nextOpen) {
    if (!nextOpen && !isSubmitting) {
      clearForm();
    }
    onOpenChange(nextOpen);
  }

  async function submitFiles(values) {
    await onSubmit(values);
    clearForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent>
        <form onSubmit={handleSubmit(submitFiles)} noValidate>
          <DialogHeader>
            <DialogTitle>Add medical attachments</DialogTitle>
            <DialogDescription>
              Upload up to {MAX_FILES} PDF or image files. Each file can be up to 10 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Files
              <Input
                {...fileField}
                type="file"
                multiple
                accept={ACCEPTED_FILE_TYPES.join(",")}
                aria-invalid={Boolean(errors.files)}
                onChange={(event) => {
                  fileField.onChange(event);
                  const selected = Array.from(event.target.files ?? []);
                  setSelectedFiles(selected);
                  setValue("files", selected, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
              {errors.files?.message && <span className="text-xs font-normal text-red-600">{errors.files.message}</span>}
            </label>

            {selectedFiles.length > 0 && (
              <ul className="space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {selectedFiles.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>)}
              </ul>
            )}

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Description <span className="font-normal text-slate-500">(optional)</span>
              <textarea
                {...register("description")}
                maxLength={500}
                rows={3}
                aria-invalid={Boolean(errors.description)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-3 focus:ring-blue-100 aria-invalid:border-red-500"
                placeholder="For example: Blood test results from 10 July."
              />
              {errors.description?.message && <span className="text-xs font-normal text-red-600">{errors.description.message}</span>}
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : <FileUp />}
              {isSubmitting ? "Uploading..." : "Upload files"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

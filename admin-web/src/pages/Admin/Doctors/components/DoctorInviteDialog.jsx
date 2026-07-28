import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { doctorInvitationsApi } from "@/api/doctorInvitationsApi";
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

const doctorInvitationSchema = z.object({
  email: z.string().trim().email("Enter a valid doctor email address."),
});

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorInviteDialog({ open, onOpenChange }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(doctorInvitationSchema),
    defaultValues: { email: "" },
  });
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleOpenChange(nextOpen) {
    if (!nextOpen) {
      reset();
      setRequestError("");
      setSuccessMessage("");
    }

    onOpenChange(nextOpen);
  }

  async function sendInvitation({ email }) {
    setRequestError("");
    setSuccessMessage("");

    try {
      const invitation = await doctorInvitationsApi.create(email);
      setSuccessMessage(`Invitation sent to ${invitation.email}.`);
      reset();
    } catch (error) {
      setRequestError(
        getErrorMessage(error, "We could not send the doctor invitation."),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
          <DialogDescription>
            Send an email invitation so the doctor can securely create their
            account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(sendInvitation)} noValidate>
          <div className="grid gap-4 p-5">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Doctor email
              <Input
                type="email"
                autoComplete="email"
                placeholder="doctor@example.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email?.message ? (
                <span className="text-xs font-normal text-red-600">
                  {errors.email.message}
                </span>
              ) : null}
            </label>

            {requestError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {requestError}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />}
              {isSubmitting ? "Sending..." : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

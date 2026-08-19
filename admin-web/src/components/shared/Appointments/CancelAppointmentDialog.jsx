import { useState } from "react";
import { AlertTriangle, LoaderCircle, XCircle } from "lucide-react";

import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
} from "./appointmentUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CancelAppointmentDialog({
  appointment,
  open,
  isCancelling,
  error,
  onOpenChange,
  onConfirm,
}) {
  const [cancellationReason, setCancellationReason] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!appointment || isCancelling) {
      return;
    }

    const wasCancelled = await onConfirm(cancellationReason.trim());
    if (wasCancelled) {
      setCancellationReason("");
    }
  }

  function handleOpenChange(nextOpen) {
    if (!nextOpen) {
      setCancellationReason("");
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl" showCloseButton={!isCancelling}>
        <DialogHeader>
          <DialogTitle>Cancel this appointment?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The appointment will be cancelled and
            any eligible held payment will be refunded.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSubmit}>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <p>
                {appointment
                  ? `Appointment #${appointment.id} is scheduled for ${formatAppointmentDate(
                      appointment.requestedDate,
                    )} at ${formatAppointmentTimeRange(appointment)}.`
                  : "Confirm that you want to cancel this appointment."}
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-800">
            Cancellation reason <span className="text-slate-500">(optional)</span>
            <span className="mt-1 block text-xs font-normal text-slate-500">
              This will be recorded with the appointment for auditing.
            </span>
            <textarea
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              maxLength={500}
              disabled={isCancelling}
              placeholder="Explain why this appointment is being cancelled…"
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <span className="mt-1 block text-right text-xs font-normal text-slate-500">
              {cancellationReason.length}/500
            </span>
          </label>

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter className="flex-wrap">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isCancelling}
              onClick={() => handleOpenChange(false)}
            >
              Keep appointment
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {isCancelling ? "Cancelling…" : "Cancel appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

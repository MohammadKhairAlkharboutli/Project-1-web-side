import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, LoaderCircle, XCircle } from "lucide-react";

import { appointmentsApi } from "@/api/appointmentsApi";
import AppointmentDetailsPage from "@/components/shared/Appointments/AppointmentDetailsPage";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  parseAppointmentDateTime,
} from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this appointment. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

function canCancelFutureAppointment(appointment) {
  if (!appointment || !["pending", "confirmed"].includes(appointment.status)) {
    return false;
  }

  const scheduledStart = parseAppointmentDateTime(
    appointment.requestedDate,
    appointment.startTime,
  );

  return Boolean(scheduledStart && scheduledStart > new Date());
}

export default function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadAppointment() {
      try {
        const data = await appointmentsApi.getAppointment(appointmentId);

        if (isCurrent) {
          setAppointment(data);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setAppointment(null);
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadAppointment();

    return () => {
      isCurrent = false;
    };
  }, [appointmentId, loadAttempt]);

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  const canCancel = useMemo(
    () => canCancelFutureAppointment(appointment),
    [appointment],
  );
  const trimmedReason = cancellationReason.trim();

  function updateCancelDialog(open) {
    if (isCancelling) {
      return;
    }

    setIsCancelDialogOpen(open);

    if (!open) {
      setCancellationReason("");
      setCancelError("");
    }
  }

  async function cancelAppointment(event) {
    event.preventDefault();

    if (!appointment || trimmedReason.length < 10 || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setCancelError("");
    setActionNotice("");

    try {
      await appointmentsApi.cancelAppointment(appointment.id, trimmedReason);
      setIsCancelDialogOpen(false);
      setCancellationReason("");
      setActionNotice(
        `Appointment #${appointment.id} was cancelled. Any eligible held payment was refunded.`,
      );
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setCancelError(
        getErrorMessage(error).replace(
          "We could not load this appointment. Please try again.",
          "The appointment could not be cancelled. Please try again.",
        ),
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-600">Loading appointment...</p>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            <p>{loadError}</p>
            <button type="button" className="mt-2 font-medium underline" onClick={retryLoad}>
              Try again
            </button>
          </div>
        ) : (
          <>
            {actionNotice ? (
              <div
                className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                role="status"
              >
                {actionNotice}
              </div>
            ) : null}

            <AppointmentDetailsPage
              appointment={appointment}
              headerActions={
                canCancel ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 hover:text-red-800"
                    onClick={() => updateCancelDialog(true)}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel appointment
                  </Button>
                ) : null
              }
            />
          </>
        )}
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={updateCancelDialog}>
        <DialogContent showCloseButton={!isCancelling}>
          <DialogHeader>
            <DialogTitle>Cancel this appointment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The appointment will be cancelled and
              any eligible held payment will be refunded.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5 p-5" onSubmit={cancelAppointment}>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p>
                  {appointment
                    ? `Appointment #${appointment.id} is scheduled for ${formatAppointmentDate(
                        appointment.requestedDate,
                      )} at ${formatAppointmentTimeRange(appointment)}.`
                    : "Confirm that you want to cancel this future appointment."}
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-800">
              Cancellation reason <span className="text-red-600">*</span>
              <span className="mt-1 block text-xs font-normal text-slate-500">
                This is recorded with the appointment for auditing.
              </span>
              <textarea
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                minLength={10}
                maxLength={500}
                required
                disabled={isCancelling}
                placeholder="Explain why this appointment is being cancelled…"
                className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <span className="mt-1 block text-right text-xs font-normal text-slate-500">
                {cancellationReason.length}/500
              </span>
            </label>

            {cancelError ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {cancelError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isCancelling}
                onClick={() => updateCancelDialog(false)}
              >
                Keep appointment
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isCancelling || trimmedReason.length < 10}
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
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";

import { appointmentsApi } from "@/api/appointmentsApi";
import AppointmentDetailsPage from "@/components/shared/Appointments/AppointmentDetailsPage";
import CancelAppointmentDialog from "@/components/shared/Appointments/CancelAppointmentDialog";
import { parseAppointmentDateTime } from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";

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

  function updateCancelDialog(open) {
    if (isCancelling) {
      return;
    }

    setIsCancelDialogOpen(open);

    if (!open) {
      setCancelError("");
    }
  }

  async function cancelAppointment(cancellationReason) {
    if (!appointment || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setCancelError("");
    setActionNotice("");

    try {
      await appointmentsApi.cancelAppointment(appointment.id, cancellationReason);
      setIsCancelDialogOpen(false);
      setActionNotice(
        `Appointment #${appointment.id} was cancelled. Any eligible held payment was refunded.`,
      );
      setLoadAttempt((attempt) => attempt + 1);
      return true;
    } catch (error) {
      setCancelError(
        getErrorMessage(error).replace(
          "We could not load this appointment. Please try again.",
          "The appointment could not be cancelled. Please try again.",
        ),
      );
      return false;
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

      <CancelAppointmentDialog
        appointment={appointment}
        open={isCancelDialogOpen}
        isCancelling={isCancelling}
        error={cancelError}
        onOpenChange={updateCancelDialog}
        onConfirm={cancelAppointment}
      />
    </section>
  );
}

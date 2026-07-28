import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { appointmentsApi } from "@/api/appointmentsApi";
import AppointmentDetailsPage from "@/components/shared/Appointments/AppointmentDetailsPage";
import { Button } from "@/components/ui/button";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this appointment. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

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
          <AppointmentDetailsPage appointment={appointment} />
        )}
      </div>
    </section>
  );
}

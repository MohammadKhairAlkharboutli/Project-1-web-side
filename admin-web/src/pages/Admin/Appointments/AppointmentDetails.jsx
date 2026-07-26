import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AppointmentDetailsPage from "@/components/shared/Appointments/AppointmentDetailsPage";
import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";
import { Button } from "@/components/ui/button";

export default function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const appointment = mockAppointments.find(
    (item) => String(item.id) === appointmentId,
  );

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <button type="button" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Button>
        </div>

        <AppointmentDetailsPage appointment={appointment} />
      </div>
    </section>
  );
}

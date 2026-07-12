import { Link, useParams } from "react-router-dom";
import { CalendarDays, ClipboardList, Eye, Rows3, Unlink } from "lucide-react";

import DoctorCard from "@/components/shared/DoctorCard";
import { getDoctorIdsForClinic } from "@/components/shared/doctorClinicAssignments";
import { sharedEmptyStateShell } from "@/components/shared/styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { clinics } from "../ClinicData";
import { doctors } from "../DoctorData";

function getAssignedDoctors(clinicId) {
  const assignedDoctorIds = getDoctorIdsForClinic(clinicId);

  return assignedDoctorIds
    .map((doctorId) => doctors.find((doctor) => doctor.id === doctorId))
    .filter(Boolean);
}

export default function ClinicDoctors() {
  const { clinicId } = useParams();
  const clinic = clinics.find((item) => String(item.id) === clinicId);
  const assignedDoctors = getAssignedDoctors(clinicId);

  if (!clinic) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Doctors
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Doctors assigned to work at this clinic.
        </p>
      </div>

      {assignedDoctors.length > 0 ? (
        <div className="space-y-3">
          {assignedDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              actions={
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/doctors/${doctor.id}`}>
                      <Eye className="h-4 w-4" />
                      View doctor
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/admin/clinics/${clinicId}/appointments?doctorId=${doctor.id}`}
                    >
                      <ClipboardList className="h-4 w-4" />
                      View appointments
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/admin/doctors/${doctor.id}/schedules?clinicId=${clinicId}`}
                    >
                      <CalendarDays className="h-4 w-4" />
                      View schedule
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/queue?clinicId=${clinicId}&doctorId=${doctor.id}`}>
                      <Rows3 className="h-4 w-4" />
                      View queue
                    </Link>
                  </Button>

                  <Button variant="destructive" size="sm" disabled>
                    <Unlink className="h-4 w-4" />
                    Unassign doctor
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-slate-700">
            No doctors are assigned to this clinic.
          </p>
        </div>
      )}
    </div>
  );
}

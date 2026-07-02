import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Eye,
  Plus,
  Rows3,
  Unlink,
} from "lucide-react";

import ClinicCard from "@/components/shared/ClinicCard";
import { getClinicIdsForDoctor } from "@/components/shared/doctorClinicAssignments";
import { sharedEmptyStateShell } from "@/components/shared/styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { clinics } from "../ClinicData";
import { doctors } from "../DoctorData";

function getAssignedClinics(doctorId) {
  const assignedClinicIds = getClinicIdsForDoctor(doctorId);

  return assignedClinicIds
    .map((clinicId) => clinics.find((clinic) => clinic.id === clinicId))
    .filter(Boolean);
}

export default function DoctorClinics() {
  const { doctorId } = useParams();
  const doctor = doctors.find((item) => String(item.id) === doctorId);
  const assignedClinics = getAssignedClinics(doctorId);

  if (!doctor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Clinics
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Clinics this doctor is assigned to.
          </p>
        </div>

        <Button disabled>
          <Plus className="h-4 w-4" />
          Assign doctor to clinic
        </Button>
      </div>

      {assignedClinics.length > 0 ? (
        <div className="space-y-3">
          {assignedClinics.map((clinic) => (
            <ClinicCard
              key={clinic.id}
              clinic={clinic}
              actions={
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/clinics/${clinic.id}`}>
                      <Eye className="h-4 w-4" />
                      View clinic
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/admin/doctors/${doctorId}/schedules?clinicId=${clinic.id}`}
                    >
                      <CalendarDays className="h-4 w-4" />
                      View schedule
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/admin/doctors/${doctorId}/appointments?clinicId=${clinic.id}`}
                    >
                      <ClipboardList className="h-4 w-4" />
                      View appointments
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" disabled>
                    <Rows3 className="h-4 w-4" />
                    View queue
                  </Button>

                  <Button variant="destructive" size="sm" disabled>
                    <Unlink className="h-4 w-4" />
                    Unassign from clinic
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className={cn(sharedEmptyStateShell, "px-6 py-10 text-center")}>
          <p className="text-sm font-medium text-slate-700">
            This doctor is not assigned to any clinics.
          </p>
        </div>
      )}
    </div>
  );
}

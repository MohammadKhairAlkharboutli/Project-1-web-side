import { getDoctorIdsForClinic } from "@/components/shared/doctorClinicAssignments";
import { doctors } from "@/pages/Admin/DoctorData";

export const doctorsApi = {
  async getDoctors(filters = {}) {
    if (!filters.clinicId) {
      return doctors;
    }

    const assignedDoctorIds = getDoctorIdsForClinic(filters.clinicId);

    return doctors.filter((doctor) => assignedDoctorIds.includes(Number(doctor.id)));
  },
};

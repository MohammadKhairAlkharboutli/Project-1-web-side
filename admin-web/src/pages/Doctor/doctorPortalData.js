import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";
import { mockDoctorWeeklyScheduleSlots } from "@/components/shared/DoctorWeeklySchedule/mockScheduleData";

import { doctors } from "../Admin/DoctorData";

export const CURRENT_DOCTOR_ID = 1;

export function getCurrentDoctor() {
  return doctors.find((doctor) => doctor.id === CURRENT_DOCTOR_ID) ?? doctors[0];
}

export function getCurrentDoctorAppointments() {
  const currentDoctor = getCurrentDoctor();

  return mockAppointments.filter(
    (appointment) => appointment.doctorId === currentDoctor?.id,
  );
}

export function getCurrentDoctorScheduleSlots() {
  return mockDoctorWeeklyScheduleSlots;
}

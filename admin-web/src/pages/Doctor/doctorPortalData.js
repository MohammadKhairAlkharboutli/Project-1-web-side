import { doctors } from "../Admin/DoctorData";
import { getMockDoctorAppointments } from "./doctorMockWorkflow";

export const CURRENT_DOCTOR_ID = 1;

export function getCurrentDoctor() {
  return doctors.find((doctor) => doctor.id === CURRENT_DOCTOR_ID) ?? doctors[0];
}

export function getCurrentDoctorAppointments() {
  return getMockDoctorAppointments();
}

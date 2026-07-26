import { appointmentMatchesDateRange } from "./appointmentUtils";

export function filterAppointmentsByDate(appointments, dateRange, exactDate) {
  return appointments.filter((appointment) => {
    if (exactDate) {
      return String(appointment.requestedDate).slice(0, 10) === exactDate;
    }

    return appointmentMatchesDateRange(appointment, dateRange);
  });
}

export function getUniqueAppointmentsById(appointments, idKey) {
  const seenIds = new Set();

  return appointments.filter((appointment) => {
    const id = appointment[idKey];

    if (seenIds.has(id)) {
      return false;
    }

    seenIds.add(id);
    return true;
  });
}

import { format, startOfDay, subDays } from "date-fns";

import {
  appointmentMatchesDateRange,
  getDateRangeBounds,
} from "./appointmentUtils";

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

export function getAppointmentDateQuery(dateRange, exactDate) {
  if (exactDate) {
    return { from: exactDate, to: exactDate };
  }

  const today = startOfDay(new Date());

  if (dateRange === "upcoming") {
    return { from: format(today, "yyyy-MM-dd") };
  }

  if (dateRange === "past") {
    return { to: format(subDays(today, 1), "yyyy-MM-dd") };
  }

  const { from, to } = getDateRangeBounds(dateRange);

  return {
    ...(from ? { from: format(from, "yyyy-MM-dd") } : {}),
    ...(to ? { to: format(to, "yyyy-MM-dd") } : {}),
  };
}

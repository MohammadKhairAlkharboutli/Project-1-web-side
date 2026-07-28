import {
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isEqual,
  isToday,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

export const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "this-week", label: "This week" },
  { value: "next-week", label: "Next week" },
  { value: "this-month", label: "This month" },
];

export function getAppointmentStatusLabel(status) {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No-show",
  };

  return labels[status] || "Unknown";
}

export function getAppointmentStatusVariant(status) {
  if (status === "cancelled" || status === "no_show") {
    return "destructive";
  }

  if (status === "completed") {
    return "secondary";
  }

  return "default";
}

export function getPriorityLabel(priority) {
  if (String(priority) === "2") {
    return "High";
  }

  return "Normal";
}

export function getPriorityVariant(priority) {
  return String(priority) === "2" ? "destructive" : "outline";
}

export function getUserDisplayName(profile, fallback) {
  if (profile?.user?.full_name) {
    return profile.user.full_name;
  }

  const name = [profile?.user?.firstName, profile?.user?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || fallback;
}

export function getPatientDisplayName(appointment) {
  return getUserDisplayName(appointment?.patient, "Unknown Patient");
}

export function getDoctorDisplayName(appointment) {
  return getUserDisplayName(appointment?.doctor, "Unknown Doctor");
}

export function getClinicName(appointment) {
  return appointment?.clinic?.name || "Unknown Clinic";
}

export function parseAppointmentDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  return parseISO(String(value).slice(0, 10));
}

export function parseAppointmentDateTime(dateValue, timeValue) {
  const date = String(dateValue || "").slice(0, 10);
  const time = String(timeValue || "00:00").slice(0, 5);

  if (!date) {
    return null;
  }

  return parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
}

export function formatAppointmentDate(value) {
  const date = parseAppointmentDate(value);

  return date ? format(date, "MMM d, yyyy") : "N/A";
}

export function formatAppointmentTime(value) {
  if (!value) {
    return "N/A";
  }

  return String(value).slice(0, 5);
}

export function formatAppointmentTimeRange(appointment) {
  return `${formatAppointmentTime(appointment?.startTime)} - ${formatAppointmentTime(
    appointment?.endTime,
  )}`;
}

export function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  return format(parseISO(String(value)), "MMM d, yyyy h:mm a");
}

export function getAppointmentTimePosition(appointment) {
  const startDateTime = parseAppointmentDateTime(
    appointment?.requestedDate,
    appointment?.startTime,
  );
  const endDateTime = parseAppointmentDateTime(
    appointment?.requestedDate,
    appointment?.endTime,
  );
  const now = new Date();

  if (!startDateTime || !endDateTime) {
    return "unknown";
  }

  if (isToday(startDateTime)) {
    return "today";
  }

  if (isAfter(startDateTime, now)) {
    return "upcoming";
  }

  if (isBefore(endDateTime, now)) {
    return "past";
  }

  return "today";
}

export function getAppointmentTimePositionLabel(appointment) {
  const labels = {
    today: "Today",
    upcoming: "Upcoming",
    past: "Past",
    unknown: "Unknown date",
  };

  return labels[getAppointmentTimePosition(appointment)];
}

export function isClosedAppointment(appointment) {
  return appointment?.status === "cancelled" || appointment?.status === "no_show";
}

export function isCompletedAppointment(appointment) {
  return appointment?.status === "completed";
}

export function isScheduledAppointment(appointment) {
  return appointment?.status === "pending" || appointment?.status === "confirmed";
}

export function getDateRangeBounds(range) {
  const today = startOfDay(new Date());

  if (range === "today") {
    return { from: today, to: today };
  }

  if (range === "this-week") {
    return {
      from: startOfWeek(today, { weekStartsOn: 0 }),
      to: endOfWeek(today, { weekStartsOn: 0 }),
    };
  }

  if (range === "next-week") {
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7);

    return {
      from: startOfWeek(nextWeekStart, { weekStartsOn: 0 }),
      to: endOfWeek(nextWeekStart, { weekStartsOn: 0 }),
    };
  }

  if (range === "this-month") {
    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  }

  return { from: null, to: null };
}

export function appointmentMatchesDateRange(appointment, range) {
  if (!range || range === "all") {
    return true;
  }

  const appointmentDate = parseAppointmentDate(appointment?.requestedDate);

  if (!appointmentDate) {
    return false;
  }

  if (range === "upcoming") {
    return getAppointmentTimePosition(appointment) === "upcoming";
  }

  if (range === "past") {
    return getAppointmentTimePosition(appointment) === "past";
  }

  const { from, to } = getDateRangeBounds(range);

  if (!from || !to) {
    return true;
  }

  const day = startOfDay(appointmentDate);

  return (
    (isAfter(day, from) || isEqual(day, from)) &&
    (isBefore(day, to) || isEqual(day, to))
  );
}

export function getQueueLabel(appointment) {
  if (appointment?.queue?.queueNumber) {
    return `Queue #${appointment.queue.queueNumber}`;
  }

  if (appointment?.checkinTime) {
    return "Checked in";
  }

  return "Not checked in";
}
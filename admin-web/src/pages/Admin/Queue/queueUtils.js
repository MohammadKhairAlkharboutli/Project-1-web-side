import { format, parseISO } from "date-fns";

export const QUEUE_STATUS = {
  WAITING: "waiting",
  CALLING: "calling",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SKIPPED: "skipped",
};

export const ACTIVE_QUEUE_STATUSES = [
  QUEUE_STATUS.WAITING,
  QUEUE_STATUS.CALLING,
  QUEUE_STATUS.IN_PROGRESS,
];

export function isActiveQueueItem(queueItem) {
  return ACTIVE_QUEUE_STATUSES.includes(queueItem?.status);
}

export function canAdminSkip(queueItem) {
  return queueItem?.status === QUEUE_STATUS.CALLING;
}

export function sortQueueByPosition(queueItems) {
  return [...queueItems].sort((left, right) => {
    const leftPosition = Number(
      left?.currentPosition ?? Number.MAX_SAFE_INTEGER,
    );
    const rightPosition = Number(
      right?.currentPosition ?? Number.MAX_SAFE_INTEGER,
    );

    return leftPosition - rightPosition;
  });
}

export function getPatientNameFromQueueItem(queueItem) {
  return getPatientNameFromAppointment(queueItem?.appointment);
}

export function getPatientNameFromAppointment(appointment) {
  const user = appointment?.patient?.user;

  if (user?.full_name) {
    return user.full_name;
  }

  const name = [user?.firstName, user?.fatherName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return name || "Unknown Patient";
}

export function formatQueueDateTime(value, pattern = "MMM d, h:mm a") {
  if (!value) {
    return "N/A";
  }

  try {
    return format(parseISO(String(value)), pattern);
  } catch {
    return "N/A";
  }
}

export function formatQueueDate(value) {
  if (!value) {
    return "N/A";
  }

  try {
    return format(parseISO(String(value).slice(0, 10)), "MMM d, yyyy");
  } catch {
    return "N/A";
  }
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

export function formatEstimatedWait(minutes) {
  if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) {
    return "N/A";
  }

  return `${Number(minutes)} min`;
}

export function getQueueStatusLabel(status) {
  const labels = {
    [QUEUE_STATUS.WAITING]: "Waiting",
    [QUEUE_STATUS.CALLING]: "Calling",
    [QUEUE_STATUS.IN_PROGRESS]: "In consultation",
    [QUEUE_STATUS.COMPLETED]: "Completed",
    [QUEUE_STATUS.SKIPPED]: "Skipped",
  };

  return labels[status] || "Unknown";
}

export function getQueuePriorityGroupLabel(priorityGroup) {
  const labels = {
    normal: "Scheduled",
    late: "Late check-in",
  };

  return labels[priorityGroup] || "Unknown";
}

export function getDoctorDisplayName(doctor) {
  const user = doctor?.user;

  if (user?.full_name) {
    return user.full_name;
  }

  const name = [user?.firstName, user?.fatherName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return name || `Doctor #${doctor?.id ?? ""}`.trim();
}

export const DOCTOR_SCHEDULE_UPDATE_MESSAGE_KEYS = new Set([
  "doctor.schedule.approved",
  "doctor.schedule.rejected",
  "schedule.request_approved",
  "schedule.request_rejected",
]);

function getStorageKey(userId) {
  return `doctor-schedule-updates:last-seen:${userId}`;
}

function getNotificationDate(notification) {
  const value = notification?.createdAt ?? notification?.created_at;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function hasUnseenDoctorScheduleUpdate(notifications, userId) {
  const updates = Array.isArray(notifications)
    ? notifications.filter((notification) => DOCTOR_SCHEDULE_UPDATE_MESSAGE_KEYS.has(notification?.messageKey))
    : [];

  if (!updates.length) {
    return false;
  }

  try {
    const lastSeen = Number(localStorage.getItem(getStorageKey(userId)));

    // On a new browser/device, show the dot once so existing updates are not missed.
    if (!Number.isFinite(lastSeen) || lastSeen <= 0) {
      return true;
    }

    return updates.some((notification) => getNotificationDate(notification) > lastSeen);
  } catch {
    return true;
  }
}

export function markDoctorScheduleUpdatesSeen(userId) {
  if (!userId) {
    return;
  }

  try {
    localStorage.setItem(getStorageKey(userId), String(Date.now()));
  } catch {
    // The dot can still be calculated on the next successful storage access.
  }
}

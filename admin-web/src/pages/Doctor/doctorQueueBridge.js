const STORAGE_KEY = "tabibi.doctorCallingQueueBridge.v1";

export function getCallingQueueBridge() {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveCallingQueueBridge(queueEntry) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(queueEntry));
  } catch {
    // Session storage is only a temporary recovery aid; live API data remains authoritative.
  }
}

export function clearCallingQueueBridge(queueId) {
  try {
    const current = getCallingQueueBridge();
    if (!queueId || String(current?.id) === String(queueId)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Nothing else is required when session storage is unavailable.
  }
}

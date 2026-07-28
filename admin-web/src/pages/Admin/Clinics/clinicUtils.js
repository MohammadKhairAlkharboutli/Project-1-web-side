export function formatClinicStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function getClinicStatusVariant(status) {
  if (status === "active") {
    return "default";
  }

  if (status === "closed") {
    return "destructive";
  }

  return "secondary";
}

export function formatClinicRating(averageRating) {
  const rating = Number(averageRating);
  return Number.isFinite(rating) ? rating.toFixed(1) : "N/A";
}

export function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

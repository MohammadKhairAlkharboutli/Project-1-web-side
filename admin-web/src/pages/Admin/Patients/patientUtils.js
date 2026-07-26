export function getPatientDisplayName(patient) {
  if (patient?.user?.full_name) {
    return patient.user.full_name;
  }

  return (
    [patient?.user?.firstName, patient?.user?.lastName]
      .filter(Boolean)
      .join(" ") || "Unknown Patient"
  );
}

export function getPatientInitials(patient) {
  const displayName = getPatientDisplayName(patient);

  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatPatientStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatEnumLabel(value) {
  if (!value) {
    return "N/A";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatOptionalValue(value) {
  return value || "N/A";
}

export function formatAppointmentsCount(appointments) {
  return Array.isArray(appointments) ? appointments.length : 0;
}

export function formatRatingsCount(ratings) {
  return Array.isArray(ratings) ? ratings.length : 0;
}

export function formatAverageRating(ratings) {
  if (!Array.isArray(ratings) || ratings.length === 0) {
    return "N/A";
  }

  const total = ratings.reduce((sum, rating) => sum + (rating.score || 0), 0);

  return (total / ratings.length).toFixed(1);
}

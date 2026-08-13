export function getPatientDisplayName(patient) {
  if (patient?.user?.fullName || patient?.user?.full_name) {
    return patient.user.fullName ?? patient.user.full_name;
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
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "N/A";
  }

  return value === null || value === undefined || value === "" ? "N/A" : value;
}

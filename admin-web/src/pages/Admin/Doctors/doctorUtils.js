export function getDoctorDisplayName(doctor) {
  if (doctor?.user?.full_name) {
    return doctor.user.full_name;
  }

  return (
    [doctor?.user?.firstName, doctor?.user?.lastName]
    .filter(Boolean)
    .join(" ") || "Unknown Doctor"
  );
}

export function getDoctorInitials(doctor) {
  const displayName = getDoctorDisplayName(doctor).replace(/^Dr\.?\s+/i, "");

  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatDoctorStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCurrency(value) {
  if (typeof value !== "number") {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLanguagesSpoken(languagesSpoken) {
  if (!Array.isArray(languagesSpoken) || languagesSpoken.length === 0) {
    return "N/A";
  }

  return languagesSpoken.join(", ");
}

export function formatApprovalStatus(isApproved) {
  return isApproved ? "Approved" : "Pending Approval";
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

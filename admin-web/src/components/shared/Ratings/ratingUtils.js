import { format, parseISO } from "date-fns";

export const RATING_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "deleted", label: "Deleted" },
];

export const RATING_SCORE_OPTIONS = [
  { value: "all", label: "All scores" },
  { value: "5", label: "5 - Excellent" },
  { value: "4", label: "4 - Very Good" },
  { value: "3", label: "3 - Good" },
  { value: "2", label: "2 - Acceptable" },
  { value: "1", label: "1 - Poor" },
];

export const REPORT_STATUS_OPTIONS = [
  { value: "all", label: "All report statuses" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

export const REPORT_REASON_OPTIONS = [
  { value: "all", label: "All reasons" },
  { value: "abusive", label: "Abusive" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "other", label: "Other" },
];

export function getRatingLabel(score) {
  const labels = {
    5: "Excellent",
    4: "Very Good",
    3: "Good",
    2: "Acceptable",
    1: "Poor",
  };

  return labels[score] || "Unrated";
}

export function getRatingStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getRatingStatusVariant(status) {
  if (status === "visible") {
    return "default";
  }

  if (status === "deleted") {
    return "destructive";
  }

  return "secondary";
}

export function getReportReasonLabel(reason) {
  if (!reason) {
    return "Unknown";
  }

  return reason
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getReportStatusLabel(status) {
  return getReportReasonLabel(status);
}

export function getReportStatusVariant(status) {
  if (status === "pending") {
    return "default";
  }

  if (status === "resolved") {
    return "secondary";
  }

  return "outline";
}

export function getPatientProfileName(patientProfile, patientProfileId) {
  const user = patientProfile?.user;
  const name = user?.full_name
    || user?.fullName
    || [user?.firstName, user?.fatherName, user?.lastName].filter(Boolean).join(" ");

  return name || (patientProfileId ? `Patient #${patientProfileId}` : "Unknown Patient");
}

export function getRatingPatientName(rating) {
  return getPatientProfileName(rating?.patientProfile, rating?.patientProfileId);
}

export function getRatingDoctorName(rating) {
  const user = rating?.doctorProfile?.user;
  const name = user?.full_name
    || user?.fullName
    || [user?.firstName, user?.fatherName, user?.lastName].filter(Boolean).join(" ");

  return name || (rating?.doctorProfileId ? `Doctor #${rating.doctorProfileId}` : "Unknown Doctor");
}

export function formatRatingDate(value) {
  if (!value) {
    return "N/A";
  }

  return format(parseISO(String(value)), "MMM d, yyyy");
}

export function getCommentPreview(comment, maxLength = 80) {
  if (!comment) {
    return "No comment";
  }

  if (comment.length <= maxLength) {
    return comment;
  }

  return `${comment.slice(0, maxLength)}...`;
}

export function ratingMatchesDoctorFilter(rating, value) {
  if (!value) {
    return true;
  }

  const normalizedValue = value.toLowerCase();
  const doctorText = [
    rating.doctorProfileId,
    rating.doctorProfile?.user?.full_name,
    rating.doctorProfile?.user?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return doctorText.includes(normalizedValue);
}

export function ratingMatchesPatientFilter(rating, value) {
  if (!value) {
    return true;
  }

  const normalizedValue = value.toLowerCase();
  const patientText = [
    rating.patientProfileId,
    rating.patientProfile?.user?.full_name,
    rating.patientProfile?.user?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return patientText.includes(normalizedValue);
}

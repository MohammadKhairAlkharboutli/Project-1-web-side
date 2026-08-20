const REQUIRED_SERVER_COMPLETION_FIELDS = [
  "birthDate",
  "gender",
  "syndicateNumber",
  "medicalSpecialty",
];

/**
 * The doctor profile API still reports medicalSubSpecialty as incomplete, even
 * though the profile update accepts that field being omitted. Keep that
 * backend-specific mismatch from blocking the doctor portal in the client.
 */
export function normalizeDoctorProfileCompletionStatus(completionStatus) {
  if (!Array.isArray(completionStatus?.missingFields)) {
    return {
      ...completionStatus,
      isComplete: Boolean(completionStatus?.isComplete),
    };
  }

  const missingFields = completionStatus.missingFields.filter(
    (field) => field !== "medicalSubSpecialty",
  );

  return {
    ...completionStatus,
    isComplete: missingFields.length === 0,
    completionPercentage:
      ((REQUIRED_SERVER_COMPLETION_FIELDS.length - missingFields.length) /
        REQUIRED_SERVER_COMPLETION_FIELDS.length) *
      100,
    missingFields,
  };
}

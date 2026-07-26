import RoleBadge from "./RoleBadge";
import ValueDiff from "./ValueDiff";

const FIELD_LABELS = {
  bloodType: "Blood type",
  pregnancyStatus: "Pregnancy status",
  disabilityInfo: "Disability info",
  currentSymptoms: "Current symptoms",
  allergies: "Allergies",
  chronicConditions: "Chronic conditions",
  pastSurgeries: "Past surgeries",
  familyHistory: "Family history",
  currentMedications: "Current medications",
  lifestyleHabits: "Lifestyle habits",
  vaccinationStatus: "Vaccination status",
};

const EMPTY_VALUE = "Not specified";

function formatDateTime(value) {
  if (!value) {
    return EMPTY_VALUE;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getFieldLabel(fieldName) {
  if (FIELD_LABELS[fieldName]) {
    return FIELD_LABELS[fieldName];
  }

  return String(fieldName || "Unknown field")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());
}

function getChangeCountLabel(count) {
  return `${count} profile ${count === 1 ? "field" : "fields"}`;
}

export default function MedicalProfileLogEvent({ event }) {
  const logs = event?.logs || [];
  const changedByName = event?.changedBy?.fullName || "Unknown user";
  const changedByRole = event?.changedBy?.role;
  const changeCountLabel = getChangeCountLabel(logs.length);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              {changedByName} updated {changeCountLabel}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <span>{formatDateTime(event?.createdAt)}</span>
              {event?.appointmentId ? (
                <span>Appointment #{event.appointmentId}</span>
              ) : null}
            </div>
          </div>

          <RoleBadge role={changedByRole} />
        </div>

        {event?.changeReason ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            <span className="font-medium text-slate-900">Reason:</span>{" "}
            {event.changeReason}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        {logs.map((log) => (
          <section
            key={log.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <h4 className="text-sm font-semibold text-slate-900">
              {getFieldLabel(log.fieldName)}
            </h4>
            <div className="mt-3">
              <ValueDiff oldValue={log.oldValue} newValue={log.newValue} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

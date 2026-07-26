import { Badge } from "@/components/ui/badge";

const EMPTY_VALUE = "Not specified";

function formatOptionalValue(value) {
  return value ? value : EMPTY_VALUE;
}

function formatDate(value) {
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
  }).format(date);
}

function formatStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusBadgeVariant(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "COMPLETED") {
    return "secondary";
  }

  if (normalizedStatus === "STOPPED" || normalizedStatus === "CANCELLED") {
    return "destructive";
  }

  if (!normalizedStatus) {
    return "outline";
  }

  return "default";
}

function PrescriptionDetail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default function PrescriptionCard({ medicine }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="break-words text-base font-semibold tracking-tight text-slate-900">
            {formatOptionalValue(medicine?.medicineName)}
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Prescribed medicine
          </p>
        </div>

        <Badge
          variant={getStatusBadgeVariant(medicine?.status)}
          className="self-start"
        >
          {formatStatusLabel(medicine?.status)}
        </Badge>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PrescriptionDetail
          label="Dosage"
          value={formatOptionalValue(medicine?.dosage)}
        />
        <PrescriptionDetail
          label="Frequency"
          value={formatOptionalValue(medicine?.frequency)}
        />
        <PrescriptionDetail
          label="Start Date"
          value={formatDate(medicine?.startDate)}
        />
        <PrescriptionDetail
          label="End Date"
          value={formatDate(medicine?.endDate)}
        />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <PrescriptionDetail
          label="Notes"
          value={formatOptionalValue(medicine?.notes)}
        />
      </div>
    </article>
  );
}

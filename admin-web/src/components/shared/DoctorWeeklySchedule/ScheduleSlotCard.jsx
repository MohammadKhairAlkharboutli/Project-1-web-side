import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { scheduleSlotShell } from "@/components/shared/styles";

const slotTypeStyles = {
  NORMAL: {
    card: "border-blue-100 bg-white shadow-sm",
    accent: "bg-blue-500",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    label: "Normal",
  },
  BREAK: {
    card: "border-dashed border-slate-300 bg-slate-50",
    accent: "bg-slate-300",
    badge: "border-slate-200 bg-slate-100 text-slate-600",
    label: "Break",
  },
  EMERGENCY: {
    card: "border-amber-200 bg-amber-50/70 shadow-sm",
    accent: "bg-amber-500",
    badge: "border-amber-200 bg-amber-100 text-amber-800",
    label: "Emergency",
  },
  OPERATION: {
    card: "border-violet-200 bg-violet-50/70 shadow-sm",
    accent: "bg-violet-500",
    badge: "border-violet-200 bg-violet-100 text-violet-800",
    label: "Operation",
  },
};

function formatSlotTime(value) {
  if (!value) {
    return "";
  }

  const normalized = String(value).slice(0, 5);
  const [hourValue, minute] = normalized.split(":");
  const hour = Number(hourValue);

  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !/^\d{2}$/.test(minute || "")) {
    return normalized;
  }

  return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}

function formatTimeRange(startTime, endTime) {
  const start = formatSlotTime(startTime);
  const end = formatSlotTime(endTime);

  if (!start && !end) {
    return "Time not set";
  }

  return `${start || "Start"} - ${end || "End"}`;
}

export default function ScheduleSlotCard({ slot }) {
  const typeStyle = slotTypeStyles[slot.type] ?? slotTypeStyles.NORMAL;
  const notes = typeof slot.notes === "string" ? slot.notes.trim() : "";
  const clinicName = slot.clinicName || slot.clinic?.name;

  return (
    <article
      className={cn(
        scheduleSlotShell,
        typeStyle.card,
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          typeStyle.accent,
        )}
        aria-hidden="true"
      />

      <div className="space-y-2 pl-2">
        <p className="text-sm font-semibold leading-5 text-slate-900">
          {formatTimeRange(slot.startTime, slot.endTime)}
        </p>
        <Badge
          variant="outline"
          className={cn("h-auto min-h-5 max-w-full whitespace-normal rounded-full px-2 py-0.5", typeStyle.badge)}
        >
          {typeStyle.label}
        </Badge>
      </div>

      <div className="mt-2 space-y-1 pl-2">
        <p className="text-xs font-medium leading-5 text-slate-700">
          {clinicName || "Clinic not specified"}
        </p>

        {notes ? (
          <p className="text-xs leading-5 text-slate-500">
            {notes}
          </p>
        ) : null}
      </div>
    </article>
  );
}

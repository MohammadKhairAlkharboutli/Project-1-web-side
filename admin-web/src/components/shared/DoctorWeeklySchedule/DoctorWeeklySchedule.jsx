import { useMemo } from "react";

import { cn } from "@/lib/utils";
import {
  sharedEmptyStateShell,
  sharedSurfaceShell,
} from "@/components/shared/styles";

import ScheduleDayColumn from "./ScheduleDayColumn";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function isValidDayOfWeek(dayOfWeek) {
  return Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6;
}

function sortByStartTime(firstSlot, secondSlot) {
  return String(firstSlot.startTime ?? "").localeCompare(
    String(secondSlot.startTime ?? ""),
  );
}

function groupSlotsByDay(slots) {
  const groupedSlots = DAYS_OF_WEEK.map(() => []);

  slots.forEach((slot) => {
    if (!isValidDayOfWeek(slot.dayOfWeek)) {
      return;
    }

    groupedSlots[slot.dayOfWeek].push(slot);
  });

  return groupedSlots.map((daySlots) => [...daySlots].sort(sortByStartTime));
}

export default function DoctorWeeklySchedule({
  slots = [],
  showInactiveSlots = false,
  emptyMessage = "This doctor doesn't have a schedule.",
  className,
}) {
  const visibleSlots = useMemo(
    () => {
      const sourceSlots = Array.isArray(slots) ? slots : [];

      return sourceSlots.filter((slot) => {
        if (!slot || !isValidDayOfWeek(slot.dayOfWeek)) {
          return false;
        }

        return showInactiveSlots || slot.isActive !== false;
      });
    },
    [showInactiveSlots, slots],
  );

  const groupedSlots = useMemo(
    () => groupSlotsByDay(visibleSlots),
    [visibleSlots],
  );

  if (visibleSlots.length === 0) {
    return (
      <section
        className={cn(
          sharedEmptyStateShell,
          "px-6 py-10 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-slate-700">
          {emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        sharedSurfaceShell,
        "p-4",
        className,
      )}
    >
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[72rem] grid-cols-7 gap-3 xl:min-w-0">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => (
            <ScheduleDayColumn
              key={dayName}
              dayName={dayName}
              slots={groupedSlots[dayIndex]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

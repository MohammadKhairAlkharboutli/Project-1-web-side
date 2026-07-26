import ScheduleSlotCard from "./ScheduleSlotCard";
import {
  sharedInlineEmptyStateShell,
  sharedSubtleSurfaceShell,
} from "@/components/shared/styles";
import { cn } from "@/lib/utils";

export default function ScheduleDayColumn({ dayName, slots }) {
  return (
    <section className={cn(sharedSubtleSurfaceShell, "flex min-h-40 flex-col p-3")}>
      <div className="mb-3 border-b border-slate-200 pb-2">
        <h3 className="text-sm font-semibold text-slate-900">
          {dayName}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {slots.length} {slots.length === 1 ? "slot" : "slots"}
        </p>
      </div>

      {slots.length > 0 ? (
        <div className="space-y-2">
          {slots.map((slot) => (
            <ScheduleSlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            sharedInlineEmptyStateShell,
            "flex flex-1 items-center justify-center px-3 py-5",
          )}
        >
          <p className="text-xs font-medium text-slate-400">
            No schedule
          </p>
        </div>
      )}
    </section>
  );
}

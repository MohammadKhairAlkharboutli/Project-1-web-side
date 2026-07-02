import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";

export function AppointmentInfoGrid({ children }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

export function AppointmentInfoItem({ label, value, wide = false }) {
  return (
    <div className={`${profileCardShell} ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <p className={profileCardLabel}>{label}</p>
      <p className={profileCardValue}>{value || "N/A"}</p>
    </div>
  );
}

export function AppointmentTextItem({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
      <p className={profileCardLabel}>{label}</p>
      <p className={profileCardBody}>{value}</p>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";

function getRoleLabel(role) {
  if (!role) {
    return "Unknown";
  }

  return String(role)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRoleClassName(role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "doctor") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (normalizedRole === "admin") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (normalizedRole === "patient") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-white text-slate-600";
}

export default function RoleBadge({ role }) {
  return (
    <Badge variant="outline" className={getRoleClassName(role)}>
      {getRoleLabel(role)}
    </Badge>
  );
}

import { useMemo } from "react";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { sharedSurfaceShell } from "@/components/shared/styles";

function getTokenPayload() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")));
  } catch {
    return null;
  }
}

function AccountDetail({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 break-words text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function SecretaryProfilePage() {
  const navigate = useNavigate();
  const account = useMemo(() => authApi.getStoredUser(), []);
  const tokenPayload = useMemo(() => getTokenPayload(), []);

  const displayName = account?.fullName || "Reception staff";
  const accountEmail = account?.email || tokenPayload?.email || "Not available";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Reception account</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Your reception queue desk account.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate("/secretary")}>
          <ArrowLeft className="h-4 w-4" />
          Queue desk
        </Button>
      </div>

      <section className={`${sharedSurfaceShell} p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-slate-900">{displayName}</h2>
            <p className="mt-1 truncate text-sm text-slate-600">{accountEmail}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Queue desk access
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <AccountDetail label="Role" value="Secretary" />
          <AccountDetail label="Workspace" value="Multi-clinic reception queue" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <p>Account details, profile photo, and password changes are managed by an administrator.</p>
        </div>
      </section>
    </section>
  );
}

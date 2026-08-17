import { Outlet, useNavigate } from "react-router-dom";

import { authApi } from "@/api/authApi";
import AccountDropdown from "@/components/shared/AccountDropdown";

function getTokenEmail() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")))?.email || null;
  } catch {
    return null;
  }
}

export default function SecretaryPageLayout() {
  const navigate = useNavigate();
  const account = authApi.getStoredUser();
  const displayName = account?.fullName || "Reception staff";
  const email = account?.email || getTokenEmail();
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white shadow-sm">
              T
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-slate-900">Tabibi</p>
              <p className="truncate text-xs font-medium text-slate-500">Reception queue desk</p>
            </div>
          </div>

          <AccountDropdown
            name={displayName}
            subtitle={email || "Reception queue desk"}
            initials={initials}
            onLogout={handleLogout}
          />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-card px-4 py-3 text-xs text-slate-500 sm:px-6 lg:px-8">
        © 2026 Tabibi Clinical Systems. All rights reserved.
      </footer>
    </div>
  );
}

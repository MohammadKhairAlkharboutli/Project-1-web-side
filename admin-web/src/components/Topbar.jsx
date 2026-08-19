import { useLocation, useNavigate } from "react-router-dom";

import { authApi } from "@/api/authApi";
import AccountDropdown from "@/components/shared/AccountDropdown";
import { useAdminAccount } from "@/context/AdminAccountContext";

const adminPageTitles = [
  ["/admin/doctor-invitations", "Doctor Invitations"],
  ["/admin/schedule-change-requests", "Schedule Changes"],
  ["/admin/system-policies", "System Policies"],
  ["/admin/data-lookups", "Data Lookups"],
  ["/admin/rating-reports", "Rating Reports"],
  ["/admin/appointments", "Appointments"],
  ["/admin/ratings", "Ratings"],
  ["/admin/queue", "Queue"],
  ["/admin/doctors", "Doctors"],
  ["/admin/patients", "Patients"],
  // Disabled for the older backend, which has no secretary routes.
  // ["/admin/secretaries", "Secretaries"],
  ["/admin/clinics", "Clinics"],
  ["/admin/profile", "My Profile"],
];

function getPageTitle(pathname) {
  if (pathname === "/admin") {
    return "Dashboard";
  }

  return adminPageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "Admin";
}

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, avatarUrl } = useAdminAccount();
  const title = getPageTitle(location.pathname);
  const adminName = [account?.firstName, account?.lastName]
    .filter(Boolean)
    .join(" ") || "Administrator";
  const initials = [account?.firstName, account?.lastName]
    .filter(Boolean)
    .map((name) => name.trim()[0])
    .join("")
    .toUpperCase() || "A";

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">T</div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Tabibi</p>
          <p className="text-xs text-slate-500">Admin workspace</p>
        </div>
      </div>
      <h1 className="hidden min-w-0 truncate text-lg font-semibold tracking-tight text-slate-900 lg:block">
        {title}
      </h1>

      <div className="ml-auto">
        <AccountDropdown
          name={adminName}
          subtitle="Administrator"
          initials={initials}
          avatarUrl={avatarUrl}
          onProfile={() => navigate("/admin/profile")}
          profileLabel="Settings & Profile"
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
}

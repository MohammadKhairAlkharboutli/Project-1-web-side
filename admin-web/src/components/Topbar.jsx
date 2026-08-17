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
  ["/admin/secretaries", "Secretaries"],
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
      <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h1>

      <AccountDropdown
        name={adminName}
        subtitle="Administrator"
        initials={initials}
        avatarUrl={avatarUrl}
        onProfile={() => navigate("/admin/profile")}
        onLogout={handleLogout}
      />
    </header>
  );
}

import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";

import { authApi } from "@/api/authApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                {initials}
              </div>
            )}
            <span className="hidden max-w-44 truncate text-sm font-medium text-slate-700 sm:inline">
              {adminName}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => navigate("/admin/profile")}>
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

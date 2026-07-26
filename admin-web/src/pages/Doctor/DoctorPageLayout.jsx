import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Stethoscope,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { authApi } from "@/api/authApi";

import { getCurrentDoctor } from "./doctorPortalData";

const doctorNavItems = [
  { label: "Dashboard", path: "/doctor", icon: LayoutDashboard, end: true },
  { label: "Appointments", path: "/doctor/appointments", icon: CalendarDays },
  { label: "Schedule", path: "/doctor/schedule", icon: Stethoscope },
  { label: "Profile", path: "/doctor/profile", icon: User },
];

function getPageTitle(pathname) {
  if (pathname === "/doctor") {
    return "Dashboard";
  }

  const currentItem = doctorNavItems.find(
    (item) => !item.end && pathname.startsWith(item.path),
  );

  return currentItem?.label ?? "";
}

export default function DoctorPageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = getCurrentDoctor();
  const pageTitle = getPageTitle(location.pathname);
  const initials =
    doctor?.user?.full_name
      ?.replace(/^Dr\.?\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "D";

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.log("error with logout: ", error);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-200 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-base font-bold text-white">
              T
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight text-slate-900">
                Tabibi
              </p>
              <p className="truncate text-xs leading-tight text-slate-500">
                doctor portal
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1 px-2">
            <h1 className="truncate text-center text-lg font-semibold text-slate-900">
              {pageTitle}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label="Toggle theme"
            >
              <Moon size={19} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="gap-2 px-2"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-36 truncate text-sm font-medium text-slate-700 sm:inline">
                    {doctor?.user?.full_name ?? "Doctor"}
                  </span>
                  <ChevronDown size={16} className="text-slate-400" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/doctor/profile")}>
                  <User size={16} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/doctor/profile")}>
                  <Settings size={16} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav className="overflow-x-auto px-4 sm:px-6" aria-label="Doctor navigation">
          <div className="flex min-w-max gap-1 pb-3">
            {doctorNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "text-slate-600 hover:bg-[var(--color-primary-light)] hover:text-slate-900",
                    )
                  }
                >
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      <footer className="flex h-8 items-center border-t border-slate-200 bg-white px-6 text-xs text-slate-500">
        <p>Copyright 2026 Tabibi Doctor Portal</p>
      </footer>
    </div>
  );
}

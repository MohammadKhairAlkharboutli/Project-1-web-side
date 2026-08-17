import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { authApi } from "@/api/authApi";
import { doctorSchedulesApi } from "@/api/doctorSchedulesApi";
import { ratingsApi } from "@/api/ratingsApi";
import { adminNavItems } from "@/components/adminNavigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SidebarItem({ item, isCollapsed, hasAttention }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) => cn(
        "relative flex items-center rounded-md py-2.5 text-sm font-medium transition-colors",
        isCollapsed ? "justify-center px-2" : "gap-3 px-3",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-slate-600 hover:bg-primary-light hover:text-slate-900",
      )}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? "text-primary-foreground" : "text-slate-400"} />
          <span className={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-40 opacity-100",
          )}>
            {item.label}
          </span>
          {hasAttention ? (
            <span
              aria-label="Attention required"
              className={cn(
                "absolute h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white",
                isCollapsed ? "right-2 top-2" : "right-3 top-1/2 -translate-y-1/2",
              )}
            />
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [attention, setAttention] = useState({
    ratingReports: false,
    scheduleRequests: false,
  });

  const refreshAttention = useCallback(async () => {
    const [scheduleRequestsResult, ratingReportsResult] = await Promise.allSettled([
      doctorSchedulesApi.getPendingScheduleRequests(),
      ratingsApi.getAdminReports({ status: "PENDING", page: 1, limit: 1 }),
    ]);

    setAttention((current) => ({
      scheduleRequests: scheduleRequestsResult.status === "fulfilled"
        ? Array.isArray(scheduleRequestsResult.value) && scheduleRequestsResult.value.length > 0
        : current.scheduleRequests,
      ratingReports: ratingReportsResult.status === "fulfilled"
        ? Number(ratingReportsResult.value.total) > 0
        : current.ratingReports,
    }));
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(refreshAttention, 0);
    const refreshInterval = window.setInterval(refreshAttention, 60_000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") refreshAttention();
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [refreshAttention]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <aside className={cn(
      "hidden min-h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-card p-4 transition-[width,padding] duration-300 ease-in-out lg:flex",
      isCollapsed ? "w-20 p-3" : "w-64 p-4",
    )}>
      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between gap-3 border-b border-slate-200 pb-4")}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">T</div>
          <div className={cn("min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100")}>
            <p className="text-lg font-bold tracking-tight text-slate-900">Tabibi</p>
            <p className="text-xs text-slate-500">Admin workspace</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className={cn("rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700", isCollapsed ? "pointer-events-none w-0 overflow-hidden p-0 opacity-0" : "opacity-100")}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsCollapsed(false)}
        className={cn("mt-3 flex h-9 w-full items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700", isCollapsed ? "opacity-100" : "pointer-events-none h-0 -translate-y-1 overflow-hidden opacity-0")}
        aria-label="Expand sidebar"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1" aria-label="Admin navigation">
        {adminNavItems.map((item) => {
          const hasAttention =
            (item.path === "/admin/rating-reports" && attention.ratingReports)
            || (item.path === "/admin/schedule-change-requests" && attention.scheduleRequests);

          return <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed} hasAttention={hasAttention} />;
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-slate-200 pt-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          title={isCollapsed ? "Log out" : undefined}
          className={cn(
            "flex w-full rounded-md py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700",
            isCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3",
          )}
        >
          <LogOut size={18} />
          <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-40 opacity-100")}>Log out</span>
        </Button>
      </div>
    </aside>
  );
}

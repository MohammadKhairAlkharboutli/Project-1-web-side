import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  User,
  CalendarOff,
  Users,
  ListOrdered,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import AccountDropdown from "@/components/shared/AccountDropdown";
import WorkspaceMobileNav from "@/components/shared/WorkspaceMobileNav";
import { cn } from "@/lib/utils";
import { authApi } from "@/api/authApi";
import { doctorsApi } from "@/api/doctorsApi";
import { notificationsApi } from "@/api/notificationsApi";
import { referralsApi } from "@/api/referralsApi";
import { userAvatarApi } from "@/api/userAvatarApi";
import { DoctorLocaleProvider, useDoctorLocale } from "@/context/DoctorLocaleContext";
import { hasUnseenDoctorScheduleUpdate } from "@/lib/doctorAttention";

const doctorNavItems = [
  { label: "Dashboard", path: "/doctor", icon: LayoutDashboard, end: true },
  { label: "Appointments", path: "/doctor/appointments", icon: CalendarDays },
  { label: "Queue", path: "/doctor/queue", icon: ListOrdered },
  { label: "Patients", path: "/doctor/patients", icon: Users },
  { label: "Referrals", path: "/doctor/referrals", icon: Send }, // 👈 Added Referrals here
  { label: "Schedule", path: "/doctor/schedule", icon: Stethoscope },
  { label: "Leaves & Time-Off", path: "/doctor/leaves", icon: CalendarOff },
  { label: "Profile", path: "/doctor/profile", icon: User },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

export default function DoctorPageLayout() {
  return <DoctorLocaleProvider><DoctorPageLayoutContent /></DoctorLocaleProvider>;
}

function DoctorPageLayoutContent() {
  const navigate = useNavigate();
  const { direction, locale } = useDoctorLocale();
  const labels = locale === "ar" ? {
    Dashboard: "لوحة التحكم", Appointments: "المواعيد", Queue: "الانتظار", Patients: "المرضى", Referrals: "الإحالات", Schedule: "الدوام", "Leaves & Time-Off": "الإجازات", Profile: "الملف الشخصي", Settings: "الإعدادات", "Log out": "تسجيل الخروج", Specialist: "اختصاصي",
  } : {};
  const label = (value) => labels[value] || value;
  const [doctor, setDoctor] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [attention, setAttention] = useState({
    receivedReferrals: false,
    scheduleUpdates: false,
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const avatarObjectUrlRef = useRef(null);

  const clearAvatarUrl = useCallback(() => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    setAvatarUrl(null);
  }, [avatarObjectUrlRef]);

  const loadAvatar = useCallback(async (profile) => {
    clearAvatarUrl();

    const storedAvatarUrl = profile?.user?.avatarUrl;
    if (!storedAvatarUrl) {
      return;
    }

    try {
      const nextAvatarUrl = await userAvatarApi.getObjectUrl();
      avatarObjectUrlRef.current = nextAvatarUrl;
      setAvatarUrl(nextAvatarUrl);
    } catch {
      // Legacy Google accounts store an external URL. Uploaded avatars always
      // use the authenticated blob request above.
      if (/^https:\/\//i.test(storedAvatarUrl)) {
        setAvatarUrl(storedAvatarUrl);
      }
    }
  }, [avatarObjectUrlRef, clearAvatarUrl]);

  const refreshDoctorShell = useCallback(async () => {
    try {
      const { profile } = await doctorsApi.getOwnProfile();
      setDoctor(profile);
      await loadAvatar(profile);
      return profile;
    } catch {
      setDoctor(null);
      clearAvatarUrl();
      return null;
    }
  }, [clearAvatarUrl, loadAvatar]);

  const refreshDoctorAttention = useCallback(async () => {
    const userId = doctor?.user?.id;

    if (!userId) {
      return;
    }

    const [receivedReferralsResult, notificationsResult] = await Promise.allSettled([
      referralsApi.getReceivedReferrals({ page: 1, limit: 1, status: "PENDING" }),
      notificationsApi.getMyNotifications(),
    ]);

    setAttention((current) => ({
      receivedReferrals: receivedReferralsResult.status === "fulfilled"
        ? Number(receivedReferralsResult.value?.meta?.total) > 0
        : current.receivedReferrals,
      scheduleUpdates: notificationsResult.status === "fulfilled"
        ? hasUnseenDoctorScheduleUpdate(notificationsResult.value, userId)
        : current.scheduleUpdates,
    }));
  }, [doctor?.user?.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialDoctor() {
      try {
        const { profile } = await doctorsApi.getOwnProfile();

        if (!isMounted) {
          return;
        }

        setDoctor(profile);
        await loadAvatar(profile);
      } catch {
        if (isMounted) {
          setDoctor(null);
          clearAvatarUrl();
        }
      }
    }

    loadInitialDoctor();
    return () => {
      isMounted = false;
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }
    };
  }, [avatarObjectUrlRef, clearAvatarUrl, loadAvatar]);

  useEffect(() => {
    if (!doctor?.user?.id) {
      return undefined;
    }

    const initialRefresh = window.setTimeout(refreshDoctorAttention, 0);
    const refreshInterval = window.setInterval(refreshDoctorAttention, 60_000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        refreshDoctorAttention();
      }
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [doctor?.user?.id, refreshDoctorAttention]);

  const uploadAvatar = useCallback(async (file) => {
    const updatedUser = await userAvatarApi.upload(file);
    await refreshDoctorShell();
    return updatedUser;
  }, [refreshDoctorShell]);

  const removeAvatar = useCallback(async () => {
    await userAvatarApi.remove();
    await refreshDoctorShell();
  }, [refreshDoctorShell]);
  
  const doctorName = doctor?.user?.full_name || [doctor?.user?.firstName, doctor?.user?.lastName].filter(Boolean).join(" ") || "Doctor";
  const doctorSpecialty = doctor?.specialization || label("Specialist");

  const initials =
    doctorName
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
    <div className="doctor-portal flex min-h-screen bg-background text-foreground" dir={direction}>
      <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">

        <aside
          className={cn(
            "hidden min-h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-card p-4 transition-[width,padding] duration-300 ease-in-out lg:flex",
            isSidebarCollapsed ? "w-20 p-3" : "w-64 p-4",
          )}
        >
          <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between gap-3 border-b border-slate-200 pb-4")}>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
                T
              </div>
              <div className={cn("min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300", isSidebarCollapsed ? "w-0 opacity-0" : "w-32 opacity-100")}>
                <p className="text-lg font-bold tracking-tight text-slate-900">Tabibi</p>
                <p className="text-xs text-slate-500">Doctor portal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className={cn(
                "rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700",
                isSidebarCollapsed ? "pointer-events-none w-0 overflow-hidden p-0 opacity-0" : "opacity-100",
              )}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className={cn(
              "mt-3 flex h-9 w-full items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700",
              isSidebarCollapsed ? "opacity-100" : "pointer-events-none h-0 -translate-y-1 overflow-hidden opacity-0",
            )}
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
            {doctorNavItems.map((item) => {
              const Icon = item.icon;
              const hasAttention =
                (item.path === "/doctor/referrals" && attention.receivedReferrals)
                || (item.path === "/doctor/schedule" && attention.scheduleUpdates);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  title={isSidebarCollapsed ? label(item.label) : undefined}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center rounded-md py-2.5 text-sm font-medium transition-colors",
                      isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-slate-600 hover:bg-primary-light hover:text-slate-900",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? "text-primary-foreground" : "text-slate-400"} />
                      <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isSidebarCollapsed ? "w-0 opacity-0" : "w-40 opacity-100")}>
                        {label(item.label)}
                      </span>
                      {hasAttention ? (
                        <span
                          aria-label="Attention required"
                          className={cn(
                            "absolute h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white",
                            isSidebarCollapsed ? "right-2 top-2" : "right-3 top-1/2 -translate-y-1/2",
                          )}
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1 border-t border-slate-200 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              title={isSidebarCollapsed ? label("Log out") : undefined}
              className={cn(
                "flex w-full rounded-md py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700",
                isSidebarCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3",
              )}
            >
              <LogOut size={18} />
              <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isSidebarCollapsed ? "w-0 opacity-0" : "w-40 opacity-100")}>
                {label("Log out")}
              </span>
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-card px-4 sm:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">T</div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Tabibi</p>
                <p className="text-xs text-slate-500">Doctor portal</p>
              </div>
            </div>
            <div className="ml-auto">
              <AccountDropdown
                name={doctorName}
                subtitle={doctorSpecialty}
                initials={initials}
                avatarUrl={avatarUrl}
                onProfile={() => navigate("/doctor/profile")}
                onSettings={() => navigate("/doctor/settings")}
                onLogout={handleLogout}
              />
            </div>
          </header>
          <WorkspaceMobileNav items={doctorNavItems} label="Doctor navigation" />

          <main className="w-full flex-1 bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
            <Outlet context={{
              refreshDoctorShell,
              refreshDoctorAttention,
              doctorUserId: doctor?.user?.id ?? null,
              hasReceivedReferralAttention: attention.receivedReferrals,
              avatarUrl,
              uploadAvatar,
              removeAvatar,
            }} />
            </div>
          </main>

          <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-card px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
            <p>© 2026 Tabibi Clinical Systems. All rights reserved.</p>
          </footer>
        </div>

      </div>
    </div>
  );
}

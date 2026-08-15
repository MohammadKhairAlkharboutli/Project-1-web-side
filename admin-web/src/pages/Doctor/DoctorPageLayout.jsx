import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <div className="doctor-portal flex h-screen w-screen overflow-hidden bg-[#F1F5F9] text-slate-900 justify-center p-4 box-border" dir={direction}>
      
      <div className="flex w-full max-w-[1440px] h-full bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-200/60">

        <aside className="hidden md:flex flex-col w-72 min-w-[18rem] max-w-[18rem] shrink-0 bg-white p-5 m-3 rounded-2xl shadow-md border border-slate-100/80 relative z-10 h-[calc(100vh-3.5rem)]">
          
          <div className="flex items-center gap-3 pb-4 mb-3 border-b border-slate-100 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white text-base font-bold shadow-md shadow-blue-500/25">
              T
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Tabibi
            </span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            <nav className="space-y-1">
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
                    className={({ isActive }) =>
                      cn(
                        "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all",
                        isActive
                          ? "bg-blue-50 text-blue-600 border border-blue-100/80 shadow-xs"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                        <span>{label(item.label)}</span>
                        {hasAttention ? (
                          <span
                            aria-label="Attention required"
                            className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-rose-500 ring-2 ring-white"
                          />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 mt-auto border-t border-slate-100 space-y-1 shrink-0">
            <NavLink
              to="/doctor/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative",
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-100/80 shadow-xs"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Settings size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  <span>{label("Settings")}</span>
                </>
              )}
            </NavLink>

            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex items-center justify-start gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <LogOut size={18} />
              <span>{label("Log out")}</span>
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
          
          <header className="hidden md:flex items-center justify-end px-8 py-4 bg-white border-b border-slate-100 shrink-0 z-20">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition-all">
                    <span className="text-xs font-bold text-slate-800 text-right">
                      {doctorName}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 mr-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white rounded-2xl shadow-xl border-slate-100 p-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{doctorName}</p>
                    <p className="text-[10px] text-blue-600 font-medium">{doctorSpecialty}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/doctor/profile")} className="rounded-xl text-xs font-bold py-2.5">
                    {label("Profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/doctor/settings")} className="rounded-xl text-xs font-bold py-2.5">
                    {label("Settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-xs font-bold py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                    {label("Log out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-8 sm:p-10 max-w-7xl w-full mx-auto bg-white overflow-y-auto">
            <Outlet context={{
              refreshDoctorShell,
              refreshDoctorAttention,
              doctorUserId: doctor?.user?.id ?? null,
              hasReceivedReferralAttention: attention.receivedReferrals,
              avatarUrl,
              uploadAvatar,
              removeAvatar,
            }} />
          </main>

          <footer className="border-t border-slate-100 bg-white py-4 px-10 text-xs font-semibold text-slate-400 flex justify-between items-center shrink-0">
            <p>© 2026 Tabibi Clinical Systems. All rights reserved.</p>
          </footer>
        </div>

      </div>
    </div>
  );
}

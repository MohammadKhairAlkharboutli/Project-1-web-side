import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  User,
  Search,
  Bell,
  CalendarOff,
  Users,
  ListOrdered,
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
  { label: "Queue", path: "/doctor/queue", icon: ListOrdered }, // 👈 تمت إضافة قائمة الانتظار الحية هنا
  { label: "Patients", path: "/doctor/patients", icon: Users },
  { label: "Schedule", path: "/doctor/schedule", icon: Stethoscope },
  { label: "Leaves & Time-Off", path: "/doctor/leaves", icon: CalendarOff },
  { label: "Profile", path: "/doctor/profile", icon: User },
];

export default function DoctorPageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = getCurrentDoctor();
  
  const doctorName = doctor?.user?.full_name ?? "Doctor";
  const doctorSpecialty = doctor?.specialty ?? "Specialist";

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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9] text-slate-900 justify-center p-4 box-border">
      
      {/* الحاوية الكبرى ثابتة الارتفاع والعرض لتمنع أي حركة غير مقصودة */}
      <div className="flex w-full max-w-[1440px] h-full bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-200/60">

        {/* 1. السايدبار الثابت (ممنوع انكماشه أو تمدده، وعرضه ثابت تماماً) */}
        <aside className="hidden md:flex flex-col w-72 min-w-[18rem] max-w-[18rem] shrink-0 bg-white p-5 m-3 rounded-2xl shadow-md border border-slate-100/80 relative z-10 h-[calc(100vh-3.5rem)]">
          
          {/* الشعار مع خط فاصل (ثابت في الأعلى) */}
          <div className="flex items-center gap-3 pb-4 mb-3 border-b border-slate-100 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white text-base font-bold shadow-md shadow-blue-500/25">
              T
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Tabibi
            </span>
          </div>

          {/* عناصر التنقل - قابلة للتمرير الداخلي إن زاد عددها */}
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            <nav className="space-y-1">
              {doctorNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
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
                        <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* أزرار الإعدادات وتسجيل الخروج في الأسفل (ثابتة تماماً ولا تتأثر بحجم المحتوى) */}
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
                  <span>Settings</span>
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
              <span>Log out</span>
            </Button>
          </div>
        </aside>

        {/* القسم الرئيسي (المحتوى يتمرر لوحده دون التأثير على إطار الصفحة أو السايدبار) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
          
          {/* الهيدر العلوي */}
          <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 shrink-0 z-20">
            
            {/* شريط البحث */}
            <div className="w-[420px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients, appointments, records..."
                  className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* الأيقونات وبروفايل الطبيب */}
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-600 hover:bg-slate-100 transition-all">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition-all">
                    <span className="text-xs font-bold text-slate-800 text-right">
                      {doctorName}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-bold">
                      {initials}
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
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/doctor/settings")} className="rounded-xl text-xs font-bold py-2.5">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-xs font-bold py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* محتوى الصفحة (يتمرر عمودياً ضمن منطقته فقط) */}
          <main className="flex-1 p-8 sm:p-10 max-w-7xl w-full mx-auto bg-white overflow-y-auto">
            <Outlet />
          </main>

          {/* التذييل */}
          <footer className="border-t border-slate-100 bg-white py-4 px-10 text-xs font-semibold text-slate-400 flex justify-between items-center shrink-0">
            <p>© 2026 Tabibi Clinical Systems. All rights reserved.</p>
          </footer>
        </div>

      </div>
    </div>
  );
}
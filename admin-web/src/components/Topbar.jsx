import { useLocation, useNavigate, Link } from "react-router-dom";
import { ChevronDown, User, LogOut, Settings, Bell, LayoutDashboard, Stethoscope, Users, Building2 } from "lucide-react";
import Dropdown from "./old-UI/Dropdown";
import DropdownItem from "./old-UI/DropdownItem";
import { authApi } from "../api/authApi";
import { useAdminAccount } from "@/context/AdminAccountContext";

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, avatarUrl } = useAdminAccount();
  
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
    } catch (error) {
      console.log("error with logout: ", error);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  const isActiveRoute = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-100 w-full">
      <div className="flex items-center gap-8">
        {/* Logo & Portal Title */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-sky-500/25">
            T
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-800 leading-none">Tabibi</h2>
            <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider mt-0.5 block">Admin Suite</span>
          </div>
        </div>

        {/* Modern Nav Links (Sky Theme) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-[20px] border border-slate-200/60 shadow-inner">
          <Link 
            to="/admin" 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isActiveRoute("/admin") && location.pathname === "/admin" 
                ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/20" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/admin/doctors" 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isActiveRoute("/admin/doctors") 
                ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/20" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Stethoscope size={15} />
            <span>Doctors</span>
          </Link>

          <Link 
            to="/admin/patients" 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isActiveRoute("/admin/patients") 
                ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/20" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Users size={15} />
            <span>Patients</span>
          </Link>

          <Link 
            to="/admin/clinics" 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isActiveRoute("/admin/clinics") 
                ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/20" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Building2 size={15} />
            <span>Clinics</span>
          </Link>
        </nav>
      </div>

      {/* Right Actions & Profile Dropdown */}
      <div className="flex items-center gap-3">
        <button className="h-10 w-10 rounded-2xl bg-slate-100/80 hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-sm">
          <Settings size={18} />
        </button>
        
        <button className="h-10 w-10 rounded-2xl bg-slate-100/80 hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-all relative border border-slate-200/60 shadow-sm">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown Menu */}
        <Dropdown
          align="right"
          width="w-52"
          trigger={
            <div className="flex items-center gap-3 pl-3 ml-1 border-l border-slate-200 cursor-pointer select-none group">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={adminName} 
                  className="h-10 w-10 rounded-2xl object-cover border-2 border-sky-200 shadow-md shadow-sky-500/10 group-hover:border-sky-400 transition-all" 
                />
              ) : (
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs shadow-sm">
                  {initials}
                </div>
              )}

              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                  {adminName}
                </p>
                <p className="text-[10px] text-sky-600 font-semibold">Admin Portal</p>
              </div>

              <ChevronDown size={14} className="text-slate-400 group-hover:text-sky-600 transition-transform" />
            </div>
          }
        >
          <div className="p-1.5 space-y-0.5">
            <DropdownItem onClick={() => navigate("/admin/profile")}>
              <span className="flex items-center gap-2.5 w-full py-2 px-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-all">
                <User size={15} className="text-slate-400 group-hover:text-sky-500" />
                Profile
              </span>
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/settings")}>
              <span className="flex items-center gap-2.5 w-full py-2 px-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-all">
                <Settings size={15} className="text-slate-400 group-hover:text-sky-500" />
                Settings
              </span>
            </DropdownItem>

            <div className="my-1 border-t border-slate-100" />

            <DropdownItem onClick={handleLogout}>
              <span className="flex items-center gap-2.5 w-full py-2 px-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all">
                <LogOut size={15} />
                Logout
              </span>
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;
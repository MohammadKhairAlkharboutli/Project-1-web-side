import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Moon, User, Settings, LogOut } from "lucide-react";
import Dropdown from "./old-UI/Dropdown";
import DropdownItem from "./old-UI/DropdownItem";
import { authApi } from "../api/authApi";

function getPageTitle(pathname) {
  if (pathname === "/admin") {
    return "Dashboard";
  }

  if (pathname.startsWith("/admin/doctors")) {
    return "Doctors";
  }

  if (pathname.startsWith("/admin/patients")) {
    return "Patients";
  }

  if (pathname.startsWith("/admin/secretaries")) {
    return "Secretaries";
  }

  if (pathname.startsWith("/admin/statistics")) {
    return "Statistics";
  }

  if (pathname.startsWith("/admin/clinics")) {
    return "Clinics";
  }

  return "";
}

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(location.pathname);

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
    <div className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <Moon size={19} />
        </button>

        <Dropdown
          align="right"
          width="w-44"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                A
              </div>

              <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                Admin User
              </span>

              <ChevronDown size={16} className="text-slate-400" />
            </button>
          }
        >
          <DropdownItem onClick={() => navigate("/profile")}>
            <span className="flex items-center gap-2">
              <User size={16} />
              Profile
            </span>
          </DropdownItem>

          <DropdownItem onClick={() => navigate("/settings")}>
            <span className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </span>
          </DropdownItem>

          <DropdownItem onClick={handleLogout}>
            <span className="flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </span>
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
};

export default Topbar;

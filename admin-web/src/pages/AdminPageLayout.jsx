import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Foot from "../components/Foot";
import { AdminAccountProvider } from "../context/AdminAccountContext";

export default function AdminPageLayout() {
  return (
    <AdminAccountProvider>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
          <Foot />
        </div>
      </div>
    </AdminAccountProvider>
  );
}

import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Foot from "../components/Foot";
import WorkspaceMobileNav from "../components/shared/WorkspaceMobileNav";
import { adminNavItems } from "../components/adminNavigation";
import { AdminAccountProvider } from "../context/AdminAccountContext";

export default function AdminPageLayout() {
  return (
    <AdminAccountProvider>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <WorkspaceMobileNav items={adminNavItems} label="Admin navigation" />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
          <Foot />
        </div>
      </div>
    </AdminAccountProvider>
  );
}

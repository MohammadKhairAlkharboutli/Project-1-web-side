import { Navigate, Outlet } from "react-router-dom";

const homeRouteByRole = {
  admin: "/admin",
  doctor: "/doctor",
  secretary: "/secretary",
};

function getStoredRole() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")));
    return String(decoded.usertype || "").toLowerCase();
  } catch {
    return null;
  }
}

export default function RoleProtectedRoute({ allowedRole }) {
  const role = getStoredRole();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={homeRouteByRole[role] || "/login"} replace />;
  }

  return <Outlet />;
}

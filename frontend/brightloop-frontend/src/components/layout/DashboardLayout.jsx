import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout({ role }) {
  const { user } = useAuth();

  // Route Guard: Redirect to /login if no active session
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role Guard: Redirect to authorized workspace if accessing another role's routes
  if (role && user.role !== role) {
    const target =
      user.role === "customer" ? "/customer" : user.role === "staff" ? "/staff" : "/admin";
    return <Navigate to={target} replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar role={role} />
      <div className="main-area">
        <Topbar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

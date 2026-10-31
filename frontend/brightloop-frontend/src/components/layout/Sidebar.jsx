import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Users,
  Layers,
  BarChart3,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const menus = {
  admin: [
    ["Overview", "/admin", LayoutDashboard],
    ["Products", "/admin/products", Package],
    ["Plans", "/admin/plans", Layers],
    ["Customers", "/admin/customers", Users],
    ["Subscriptions", "/admin/subscriptions", Activity],
    ["Invoices", "/admin/invoices", FileText],
    ["Payments", "/admin/payments", CreditCard],
    ["Reports", "/admin/reports", BarChart3],
  ],
  staff: [
    ["Overview", "/staff", LayoutDashboard],
    ["Quotations", "/staff/quotations", ClipboardList],
  ],
  customer: [
    ["Overview", "/customer", LayoutDashboard],
    ["Browse plans", "/customer/plans", Layers],
    ["My subscriptions", "/customer/subscriptions", Activity],
    ["Payment history", "/customer/payments", CreditCard],
  ],
};

export default function Sidebar({ role = "admin" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">B</span>
        <span>brightloop</span>
      </div>
      <div className="nav-label">{role} workspace</div>
      <nav>
        {(menus[role] || menus.admin).map(([label, to, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${role}`}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="logout-button" onClick={handleLogout}>
        <LogOut size={17} /> Sign out
      </button>
    </aside>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Plans from "./pages/admin/Plans";
import Customers from "./pages/admin/Customers";
import Subscriptions from "./pages/admin/Subscriptions";
import Invoices from "./pages/admin/Invoices";
import Payments from "./pages/admin/Payments";
import Reports from "./pages/admin/Reports";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Quotations from "./pages/staff/Quotations";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BrowsePlans from "./pages/customer/BrowsePlans";
import MySubscriptions from "./pages/customer/MySubscriptions";
import PaymentHistory from "./pages/customer/PaymentHistory";
import AdminLayout from "./components/layout/AdminLayout";
import StaffLayout from "./components/layout/StaffLayout";
import CustomerLayout from "./components/layout/CustomerLayout";
import { useAuth } from "./hooks/useAuth";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "customer") return <Navigate to="/customer" replace />;
  if (user.role === "staff") return <Navigate to="/staff" replace />;
  return <Navigate to="/admin" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="plans" element={<Plans />} />
        <Route path="customers" element={<Customers />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<StaffDashboard />} />
        <Route path="quotations" element={<Quotations />} />
      </Route>

      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<CustomerDashboard />} />
        <Route path="plans" element={<BrowsePlans />} />
        <Route path="subscriptions" element={<MySubscriptions />} />
        <Route path="payments" element={<PaymentHistory />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;

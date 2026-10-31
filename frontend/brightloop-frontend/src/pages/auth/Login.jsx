import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("admin@brightloop.demo");
  const [password, setPassword] = useState("demo123");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await login(email, password, role);
      navigate(user.role === "customer" ? "/customer" : user.role === "staff" ? "/staff" : "/admin");
    } catch { setError("Unable to sign in. Please try again."); }
  }

  return <div className="auth-page"><div className="auth-card">
    <div className="brand auth-brand"><span className="brand-mark">B</span><span>brightloop</span></div>
    <p className="eyebrow">WELCOME BACK</p><h1>Sign in to your workspace</h1><p className="muted">Manage subscriptions, billing and customers in one place.</p>
    <form onSubmit={handleSubmit} className="form-stack">
      <label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <label>Demo role<select value={role} onChange={e=>setRole(e.target.value)}><option value="admin">Admin</option><option value="staff">Staff</option><option value="customer">Customer</option></select></label>
      {error && <p className="error-text">{error}</p>}
      <button className="primary-button full-button">Sign in</button>
    </form>
    <p className="auth-footer">New to Brightloop? <Link to="/register">Create an account</Link></p>
    <p className="demo-note">Demo mode: any email and password will work. Connect the backend before production.</p>
  </div></div>;
}

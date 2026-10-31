import { createContext, useMemo, useState } from "react";
import { loginDemo } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("brightloop_user")); }
    catch { return null; }
  });

  async function login(email, password, role) {
    const result = await loginDemo(email, password, role);
    setUser(result.user);
    localStorage.setItem("brightloop_user", JSON.stringify(result.user));
    return result.user;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("brightloop_user");
    localStorage.removeItem("brightloop_token");
  }

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

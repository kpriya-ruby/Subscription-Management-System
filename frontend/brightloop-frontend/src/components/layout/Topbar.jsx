import { Bell, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Topbar() {
  const { user } = useAuth();
  return <header className="topbar">
    <div className="search-box"><Search size={17}/><input placeholder="Search anything..." aria-label="Search"/></div>
    <div className="topbar-right"><button className="icon-button" aria-label="Notifications"><Bell size={19}/></button><div className="user-chip"><span className="avatar">{(user?.name || "U")[0].toUpperCase()}</span><span>{user?.name || "User"}</span></div></div>
  </header>;
}

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaTachometerAlt, FaPlusCircle, FaHistory, FaWallet, FaClipboardList, FaUsers, FaBuilding, FaSignOutAlt } from "react-icons/fa";
const Sidebar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const empLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/apply-leave", label: "Apply Leave", icon: <FaPlusCircle /> },
    { to: "/leave-history", label: "My Leave History", icon: <FaHistory /> },
    { to: "/leave-balance", label: "Leave Balance", icon: <FaWallet /> }
  ];
  const mgrLinks = [
    { to: "/manager", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/leave-requests", label: "Leave Requests", icon: <FaClipboardList /> },
    { to: "/employees", label: "Employees", icon: <FaUsers /> },
    { to: "/departments", label: "Departments", icon: <FaBuilding /> }
  ];
  const links = user?.role === "manager" ? mgrLinks : empLinks;
  const logout = () => { setUser(null); navigate("/login"); };
  return (
    <div className="sidebar d-flex flex-column p-3">
      <h4 className="text-white mb-4"><span className="text-primary">Leave</span>Pro</h4>
      <nav className="nav flex-column flex-grow-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}>
            {l.icon} {l.label}
          </NavLink>
        ))}
      </nav>
      <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-2" onClick={logout}><FaSignOutAlt /> Logout</button>
    </div>
  );
};
export default Sidebar;

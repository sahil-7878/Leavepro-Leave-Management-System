import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaHistory,
  FaWallet,
  FaClipboardList,
  FaUsers,
  FaBuilding,
  FaSignOutAlt
} from "react-icons/fa";

const Sidebar = () => {
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar d-flex flex-column p-3">
      <h4 className="text-white mb-4 sidebar-brand">
        <span className="text-primary">Leave</span>Pro
      </h4>

      <nav className="nav flex-column flex-grow-1 sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${
                isActive ? "active" : ""
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center gap-2 sidebar-logout"
        onClick={handleLogout}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
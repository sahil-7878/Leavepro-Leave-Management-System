import { useAuth } from "../context/AuthContext";
import { FaBell, FaUserCircle } from "react-icons/fa";
const Header = () => {
  const { user } = useAuth();
  return (
    <div className="header bg-white d-flex justify-content-between align-items-center px-4 py-3 shadow-sm">
      <h5 className="mb-0">Welcome, {user?.name}</h5>
      <div className="d-flex align-items-center gap-3">
        <FaBell size={20} className="text-secondary" />
        <div className="d-flex align-items-center gap-2">
          <FaUserCircle size={28} className="text-primary" />
          <div><div className="fw-semibold small">{user?.name}</div><div className="text-muted small text-capitalize">{user?.role}</div></div>
        </div>
      </div>
    </div>
  );
};
export default Header;

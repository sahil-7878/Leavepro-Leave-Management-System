import { useAuth } from "../context/AuthContext";
import { FaBell, FaUserCircle } from "react-icons/fa";

const Header = () => {
  const { user } = useAuth();

  const userName = user?.name || "User";
  const userRole = user?.role || "Employee";

  return (
    <header className="header bg-white d-flex justify-content-between align-items-center px-4 py-3 shadow-sm">
      <h5 className="mb-0 header-welcome">
        Welcome, {userName}
      </h5>

      <div className="d-flex align-items-center gap-3 header-right">
        <FaBell
          size={20}
          className="text-secondary header-bell"
        />

        <div className="d-flex align-items-center gap-2 header-user">
          <FaUserCircle
            size={28}
            className="text-primary header-user-icon"
          />

          <div className="header-user-info">
            <div className="fw-semibold small header-user-name">
              {userName}
            </div>

            <div className="text-muted small text-capitalize">
              {userRole}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
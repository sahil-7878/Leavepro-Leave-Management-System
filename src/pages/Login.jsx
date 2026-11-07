import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Enter email and password");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const user = await loginUser(email.trim(), password);

      setUser(user);
      toast.success(`Welcome ${user.name}`);

      navigate(user.role === "manager" ? "/manager" : "/dashboard", {
        replace: true
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const fill = (role) => {
    setEmail(
      role === "manager"
        ? "manager@company.com"
        : "employee@company.com"
    );
    setPassword("123456");
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="card shadow-lg login-card">
        <div className="card-body p-3 p-sm-4">
          <h3 className="text-center mb-1">
            <span className="text-primary">Leave</span>Pro
          </h3>

          <p className="text-center text-muted mb-4">
            Employee Leave Management
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope />
                </span>

                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>

                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="d-flex flex-column flex-sm-row gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => fill("employee")}
            >
              Demo Employee
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => fill("manager")}
            >
              Demo Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
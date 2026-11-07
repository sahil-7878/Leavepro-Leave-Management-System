import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getLeaveRequests, getUsers } from "../services/api";
import { formatDate, getId } from "../utils/leaveUtils";
import StatusBadge from "../components/StatusBadge";

const ManagerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [requestData, userData] = await Promise.all([
          getLeaveRequests(),
          getUsers()
        ]);

        setRequests(Array.isArray(requestData) ? requestData : []);
        setUsers(Array.isArray(userData) ? userData : []);
      } catch (error) {
        console.error(
          "Manager dashboard error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to load manager dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const getUserName = (id) => {
    return (
      users.find((user) => getId(user) === getId(id))?.name || "Unknown"
    );
  };

  const cards = [
    {
      label: "Total",
      value: requests.length,
      color: "primary"
    },
    {
      label: "Pending",
      value: requests.filter((r) => r.status === "Pending").length,
      color: "warning"
    },
    {
      label: "Approved",
      value: requests.filter((r) => r.status === "Approved").length,
      color: "success"
    },
    {
      label: "Rejected",
      value: requests.filter((r) => r.status === "Rejected").length,
      color: "danger"
    }
  ];

  const recent = [...requests]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt || 0) -
        new Date(a.created_at || a.createdAt || 0)
    )
    .slice(0, 5);

  return (
    <>
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 className="mb-0">Manager Dashboard</h4>

        <Link
          to="/leave-requests"
          className="btn btn-primary btn-sm dashboard-action-btn"
        >
          View All Requests
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div className="col-6 col-md-3" key={card.label}>
            <div
              className={`card stat-card border-0 bg-${card.color} text-white shadow-sm h-100`}
            >
              <div className="card-body">
                <div className="small opacity-75">
                  {card.label}
                </div>

                <div className="fs-3 fw-bold">
                  {card.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <h5 className="mb-3">Recent Requests</h5>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {recent.length > 0 ? (
                recent.map((request) => (
                  <tr key={getId(request)}>
                    <td>{getUserName(request.employee_id)}</td>

                    <td>{formatDate(request.start_date)}</td>

                    <td>{formatDate(request.end_date)}</td>

                    <td>{request.total_days ?? "-"}</td>

                    <td>
                      <StatusBadge status={request.status} />
                    </td>

                    <td>
                      <Link
                        to={`/leave-details/${getId(request)}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-muted"
                  >
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getLeaveTypes, getLeaveRequests } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  computeStats,
  computeBalance,
  formatDate,
  getLeaveType,
  getId
} from "../utils/leaveUtils";
import LeaveBalanceCard from "../components/LeaveBalanceCard";
import StatusBadge from "../components/StatusBadge";
import LeaveTypeBadge from "../components/LeaveTypeBadge";

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [typeData, requestData] = await Promise.all([
          getLeaveTypes(),
          getLeaveRequests()
        ]);

        setTypes(Array.isArray(typeData) ? typeData : []);
        setRequests(Array.isArray(requestData) ? requestData : []);
      } catch (error) {
        console.error(
          "Employee dashboard error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to load dashboard"
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

  const employeeId = user?.id || user?._id;

  const myRequests = requests.filter(
    (request) => getId(request.employee_id) === getId(employeeId)
  );

  const stats = computeStats(types, requests, employeeId);
  const balances = computeBalance(types, requests, employeeId);

  const recent = [...myRequests]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt)
    )
    .slice(0, 5);

  const cards = [
    { label: "Total Leaves", value: stats.total, color: "primary" },
    { label: "Used Leaves", value: stats.used, color: "danger" },
    { label: "Remaining", value: stats.remaining, color: "success" },
    { label: "Pending", value: stats.pending, color: "warning" }
  ];

  return (
    <>
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 className="mb-0">Employee Dashboard</h4>

        <div className="d-flex gap-2 flex-wrap dashboard-actions">
          <Link to="/apply-leave" className="btn btn-primary btn-sm">
            + Apply Leave
          </Link>

          <Link
            to="/leave-history"
            className="btn btn-outline-primary btn-sm"
          >
            History
          </Link>
        </div>
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

      {/* Leave Balance */}
      <h5 className="mb-3">Leave Balance</h5>

      <div className="row g-3 mb-4">
        {balances.map((balance) => (
          <div className="col-12 col-sm-6 col-lg-3" key={getId(balance)}>
            <LeaveBalanceCard type={balance} />
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
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-muted py-4"
                  >
                    No requests yet
                  </td>
                </tr>
              ) : (
                recent.map((request) => (
                  <tr key={getId(request)}>
                    <td>
                      <LeaveTypeBadge
                        type={getLeaveType(types, request.leave_type_id)}
                      />
                    </td>

                    <td>{formatDate(request.start_date)}</td>

                    <td>{formatDate(request.end_date)}</td>

                    <td>{request.total_days}</td>

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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getLeaveRequests,
  getUsers,
  updateLeaveStatus,
} from "../services/api";
import { formatDate, getId } from "../utils/leaveUtils";
import StatusBadge from "../components/StatusBadge";

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [requestData, userData] = await Promise.all([
        getLeaveRequests(),
        getUsers(),
      ]);

      setRequests(Array.isArray(requestData) ? requestData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error("Leave requests error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to load leave requests"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getEmployeeName = (employeeId) => {
    const employee = users.find(
      (item) => getId(item) === getId(employeeId)
    );

    return employee?.name || "Unknown";
  };

  const handleStatus = async (request, status) => {
    if (actionId) return;

    const requestId = getId(request);

    if (!requestId) {
      toast.error("Invalid leave request");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${status.toLowerCase()} this leave request?`
    );

    if (!confirmed) return;

    try {
      setActionId(requestId);

      await updateLeaveStatus(requestId, status);

      toast.success(`Leave ${status.toLowerCase()} successfully`);
      await loadData();
    } catch (error) {
      console.error("Status update error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to update leave status"
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredRequests =
    filter === "All"
      ? requests
      : requests.filter((request) => request.status === filter);

  const sortedRequests = [...filteredRequests].sort(
    (a, b) =>
      new Date(b.created_at || b.createdAt || 0) -
      new Date(a.created_at || a.createdAt || 0)
  );

  const statuses = ["All", "Pending", "Approved", "Rejected"];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h4 className="mb-0">Leave Requests</h4>

        <button
          className="btn btn-outline-primary btn-sm"
          onClick={loadData}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {statuses.map((status) => (
          <button
            key={status}
            className={`btn btn-sm ${
              filter === status
                ? "btn-primary"
                : "btn-outline-secondary"
            }`}
            onClick={() => setFilter(status)}
          >
            {status} (
            {status === "All"
              ? requests.length
              : requests.filter((r) => r.status === status).length}
            )
          </button>
        ))}
      </div>

      <div className="card shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-2 mb-0">
              Loading leave requests...
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedRequests.length > 0 ? (
                  sortedRequests.map((request) => {
                    const requestId = getId(request);
                    const processing = actionId === requestId;

                    return (
                      <tr key={requestId}>
                        <td>{getEmployeeName(request.employee_id)}</td>
                        <td>{formatDate(request.start_date)}</td>
                        <td>{formatDate(request.end_date)}</td>
                        <td>{request.total_days ?? "-"}</td>
                        <td>
                          <span
                            className="d-inline-block text-truncate"
                            style={{ maxWidth: "150px" }}
                            title={request.reason || ""}
                          >
                            {request.reason || "-"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={request.status} />
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            <Link
                              to={`/leave-details/${requestId}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>

                            {request.status === "Pending" && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  disabled={!!actionId}
                                  onClick={() =>
                                    handleStatus(request, "Approved")
                                  }
                                >
                                  {processing ? "..." : "Approve"}
                                </button>

                                <button
                                  className="btn btn-sm btn-danger"
                                  disabled={!!actionId}
                                  onClick={() =>
                                    handleStatus(request, "Rejected")
                                  }
                                >
                                  {processing ? "..." : "Reject"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-muted"
                    >
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveRequests;
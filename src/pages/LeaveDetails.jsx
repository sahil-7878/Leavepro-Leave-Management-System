import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getLeaveRequestById,
  getLeaveTypes,
  getUsers,
  updateLeaveStatus,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, getLeaveType, getId } from "../utils/leaveUtils";
import StatusBadge from "../components/StatusBadge";
import LeaveTypeBadge from "../components/LeaveTypeBadge";

const LeaveDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [types, setTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [requestData, typeData, userData] = await Promise.all([
        getLeaveRequestById(id),
        getLeaveTypes(),
        getUsers(),
      ]);

      setRequest(requestData || null);
      setTypes(Array.isArray(typeData) ? typeData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error("Leave details error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to load leave details"
      );
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (status) => {
    const requestId = getId(request);

    if (!requestId || actionLoading) return;

    if (
      !window.confirm(
        `Are you sure you want to ${status.toLowerCase()} this leave?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await updateLeaveStatus(requestId, status);

      toast.success(`Leave ${status.toLowerCase()} successfully`);
      await load();
    } catch (error) {
      console.error("Leave status update error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to update leave status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2 mb-0">Loading leave details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="alert alert-danger">
        Leave request not found.
        <button
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const employee = users.find(
    (u) => getId(u) === getId(request.employee_id)
  );

  const approver = users.find(
    (u) => getId(u) === getId(request.approved_by)
  );

  const leaveType = getLeaveType(types, request.leave_type_id);

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          {user?.role === "manager" && request.status === "Pending" && (
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-success btn-sm"
                disabled={actionLoading}
                onClick={() => act("Approved")}
              >
                {actionLoading ? "Processing..." : "Approve"}
              </button>

              <button
                className="btn btn-danger btn-sm"
                disabled={actionLoading}
                onClick={() => act("Rejected")}
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>
            </div>
          )}
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2 p-3">
            <h5 className="mb-0 text-break">
              Leave Request #{getId(request)}
            </h5>
            <StatusBadge status={request.status} />
          </div>

          <div className="card-body p-3 p-sm-4">
            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <small className="text-muted d-block">Employee</small>
                <strong>
                  {employee?.name || "Employee details unavailable"}
                </strong>
                <div className="text-muted small text-break">
                  {employee?.email || ""}
                </div>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <small className="text-muted d-block">Leave Type</small>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  {leaveType && <LeaveTypeBadge type={leaveType} />}
                  <span>{leaveType?.name || "Unknown"}</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4 mb-3">
                <small className="text-muted d-block">Start Date</small>
                <strong>{formatDate(request.start_date)}</strong>
              </div>

              <div className="col-12 col-sm-6 col-md-4 mb-3">
                <small className="text-muted d-block">End Date</small>
                <strong>{formatDate(request.end_date)}</strong>
              </div>

              <div className="col-12 col-sm-6 col-md-4 mb-3">
                <small className="text-muted d-block">Total Days</small>
                <strong>{request.total_days ?? "-"}</strong>
              </div>

              <div className="col-12 mb-3">
                <small className="text-muted d-block">Reason</small>
                <p className="mb-0 text-break">
                  {request.reason || "-"}
                </p>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <small className="text-muted d-block">Applied On</small>
                <strong>
                  {formatDate(request.created_at || request.createdAt)}
                </strong>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <small className="text-muted d-block">Last Updated</small>
                <strong>
                  {formatDate(request.updated_at || request.updatedAt)}
                </strong>
              </div>

              {approver && (
                <div className="col-12">
                  <small className="text-muted d-block">Approver</small>
                  <strong>{approver.name}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getLeaveRequestById, getLeaveTypes, getUsers, updateLeaveStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, getLeaveType } from "../utils/leaveUtils";
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
  const load = () => { setLoading(true); Promise.all([getLeaveRequestById(id), getLeaveTypes(), getUsers()]).then(([r, t, u]) => { setRequest(r); setTypes(t); setUsers(u); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [id]);
  const act = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()}?`)) return;
    try { await updateLeaveStatus(request.id, status, user.id); toast.success(`Leave ${status.toLowerCase()}`); load(); }
    catch { toast.error("Action failed"); }
  };
  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!request) return <div className="alert alert-danger">Not found</div>;
  const employee = users.find(u => u.id === request.employee_id);
  const approver = users.find(u => u.id === request.approved_by);
  const lt = getLeaveType(types, request.leave_type_id);
  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
          {user.role === "manager" && request.status === "Pending" && (
            <div className="d-flex gap-2">
              <button className="btn btn-success btn-sm" onClick={() => act("Approved")}>Approve</button>
              <button className="btn btn-danger btn-sm" onClick={() => act("Rejected")}>Reject</button>
            </div>
          )}
        </div>
        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Leave Request #{request.id}</h5>
            <StatusBadge status={request.status} />
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3"><small className="text-muted d-block">Employee</small><strong>{employee?.name}</strong><div className="text-muted small">{employee?.email}</div></div>
              <div className="col-md-6 mb-3"><small className="text-muted d-block">Leave Type</small><LeaveTypeBadge type={lt} /> <span className="ms-2">{lt?.name}</span></div>
              <div className="col-md-4 mb-3"><small className="text-muted d-block">Start Date</small><strong>{formatDate(request.start_date)}</strong></div>
              <div className="col-md-4 mb-3"><small className="text-muted d-block">End Date</small><strong>{formatDate(request.end_date)}</strong></div>
              <div className="col-md-4 mb-3"><small className="text-muted d-block">Total Days</small><strong>{request.total_days}</strong></div>
              <div className="col-12 mb-3"><small className="text-muted d-block">Reason</small><p className="mb-0">{request.reason}</p></div>
              <div className="col-md-6 mb-3"><small className="text-muted d-block">Applied On</small><strong>{formatDate(request.created_at)}</strong></div>
              <div className="col-md-6 mb-3"><small className="text-muted d-block">Last Updated</small><strong>{formatDate(request.updated_at)}</strong></div>
              {approver && <div className="col-12"><small className="text-muted d-block">Approver</small><strong>{approver.name}</strong></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeaveDetails;

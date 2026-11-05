import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaveRequests, getLeaveTypes } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, getLeaveType } from "../utils/leaveUtils";
import StatusBadge from "../components/StatusBadge";
import LeaveTypeBadge from "../components/LeaveTypeBadge";
const SIZE = 5;
const LeaveHistory = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    Promise.all([getLeaveRequests(), getLeaveTypes()]).then(([r, t]) => {
      setRequests(r);
      setTypes(t);
    });
  }, []);
  const filtered = useMemo(
    () =>
      requests
        .filter((r) => r.employee_id === user.id)
        .filter((r) => (typeFilter ? r.leave_type_id === Number(typeFilter) : true))
        .filter((r) => (statusFilter ? r.status === statusFilter : true))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [requests, typeFilter, statusFilter, user.id]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / SIZE));
  const paged = filtered.slice((page - 1) * SIZE, page * SIZE);
  useEffect(() => setPage(1), [typeFilter, statusFilter]);
  return (
    <>
      <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
        <h4 className="mb-0">My Leave History</h4>
        <Link to="/apply-leave" className="btn btn-primary btn-sm">+ Apply Leave</Link>
      </div>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            </div>
            <div className="col-md-6">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th><th>Applied</th><th></th></tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted py-4">No records</td></tr>
              )}
              {paged.map((r) => (
                <tr key={r.id}>
                  <td><LeaveTypeBadge type={getLeaveType(types, r.leave_type_id)} /></td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>
                  <td>{r.total_days}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{formatDate(r.created_at)}</td>
                  <td><Link to={`/leave-details/${r.id}`} className="btn btn-sm btn-outline-primary">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer d-flex justify-content-between">
          <small className="text-muted">Page {page} of {totalPages}</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
};
export default LeaveHistory;

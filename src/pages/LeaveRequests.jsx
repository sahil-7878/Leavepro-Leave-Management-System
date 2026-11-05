import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaveRequests, getLeaveTypes, getUsers, updateLeaveStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, getLeaveType } from "../utils/leaveUtils";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import LeaveTypeBadge from "../components/LeaveTypeBadge";
const SIZE = 5;
const LeaveRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const load = () => {
    Promise.all([getLeaveRequests(), getLeaveTypes(), getUsers()]).then(([r, t, u]) => {
      setRequests(r);
      setTypes(t);
      setUsers(u);
    });
  };
  useEffect(() => { load(); }, []);
  const getName = (id) => users.find((u) => u.id === id)?.name || "Unknown";
  const filtered = useMemo(
    () =>
      requests
        .filter((r) => {
          const emp = getName(r.employee_id).toLowerCase();
          const lt = (getLeaveType(types, r.leave_type_id)?.name || "").toLowerCase();
          const q = search.toLowerCase();
          return !q || emp.includes(q) || lt.includes(q);
        })
        .filter((r) => (statusFilter ? r.status === statusFilter : true))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [requests, types, users, search, statusFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / SIZE));
  const paged = filtered.slice((page - 1) * SIZE, page * SIZE);
  useEffect(() => setPage(1), [search, statusFilter]);
  const act = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()}?`)) return;
    try {
      await updateLeaveStatus(id, status, user.id);
      toast.success(`Leave ${status.toLowerCase()}`);
      load();
    } catch {
      toast.error("Action failed");
    }
  };
  return (
    <>
      <h4 className="mb-4">Leave Requests</h4>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Search by employee or leave type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
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
              <tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted py-4">No matching requests</td></tr>
              )}
              {paged.map((r) => (
                <tr key={r.id}>
                  <td>{getName(r.employee_id)}</td>
                  <td><LeaveTypeBadge type={getLeaveType(types, r.leave_type_id)} /></td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>
                  <td>{r.total_days}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/leave-details/${r.id}`} className="btn btn-sm btn-outline-primary">View</Link>
                      {r.status === "Pending" && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => act(r.id, "Approved")}>&#10003;</button>
                          <button className="btn btn-sm btn-danger" onClick={() => act(r.id, "Rejected")}>&#10005;</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer d-flex justify-content-between">
          <small className="text-muted">Page {page} of {totalPages} ({filtered.length} results)</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
};
export default LeaveRequests;

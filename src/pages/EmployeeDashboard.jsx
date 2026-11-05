import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaveTypes, getLeaveRequests } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { computeStats, computeBalance, formatDate, getLeaveType } from "../utils/leaveUtils";
import LeaveBalanceCard from "../components/LeaveBalanceCard";
import StatusBadge from "../components/StatusBadge";
import LeaveTypeBadge from "../components/LeaveTypeBadge";
const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([getLeaveTypes(), getLeaveRequests()]).then(([t, r]) => { setTypes(t); setRequests(r); }).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-center py-5">Loading...</div>;
  const stats = computeStats(types, requests, user.id);
  const balances = computeBalance(types, requests, user.id);
  const recent = requests.filter(r => r.employee_id === user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const cards = [
    { label: "Total Leaves", value: stats.total, color: "primary" },
    { label: "Used Leaves", value: stats.used, color: "danger" },
    { label: "Remaining", value: stats.remaining, color: "success" },
    { label: "Pending", value: stats.pending, color: "warning" }
  ];
  return (
    <>
      <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
        <h4 className="mb-0">Employee Dashboard</h4>
        <div className="d-flex gap-2">
          <Link to="/apply-leave" className="btn btn-primary btn-sm">+ Apply Leave</Link>
          <Link to="/leave-history" className="btn btn-outline-primary btn-sm">History</Link>
        </div>
      </div>
      <div className="row g-3 mb-4">
        {cards.map(c => (
          <div className="col-6 col-md-3" key={c.label}>
            <div className={`card stat-card border-0 bg-${c.color} text-white shadow-sm`}>
              <div className="card-body"><div className="small opacity-75">{c.label}</div><div className="fs-3 fw-bold">{c.value}</div></div>
            </div>
          </div>
        ))}
      </div>
      <h5 className="mb-3">Leave Balance</h5>
      <div className="row g-3 mb-4">
        {balances.map(b => (<div className="col-12 col-sm-6 col-lg-3" key={b.id}><LeaveBalanceCard type={b} /></div>))}
      </div>
      <h5 className="mb-3">Recent Requests</h5>
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light"><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No requests yet</td></tr>}
              {recent.map(r => (
                <tr key={r.id}>
                  <td><LeaveTypeBadge type={getLeaveType(types, r.leave_type_id)} /></td>
                  <td>{formatDate(r.start_date)}</td><td>{formatDate(r.end_date)}</td><td>{r.total_days}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td><Link to={`/leave-details/${r.id}`} className="btn btn-sm btn-outline-primary">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default EmployeeDashboard;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaveRequests, getUsers } from "../services/api";
import { formatDate } from "../utils/leaveUtils";
import StatusBadge from "../components/StatusBadge";
const ManagerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([getLeaveRequests(), getUsers()]).then(([r, u]) => { setRequests(r); setUsers(u); }).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-center py-5">Loading...</div>;
  const getUserName = (id) => users.find(u => u.id === id)?.name || "Unknown";
  const cards = [
    { label: "Total", value: requests.length, color: "primary" },
    { label: "Pending", value: requests.filter(r => r.status === "Pending").length, color: "warning" },
    { label: "Approved", value: requests.filter(r => r.status === "Approved").length, color: "success" },
    { label: "Rejected", value: requests.filter(r => r.status === "Rejected").length, color: "danger" }
  ];
  const recent = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  return (
    <>
      <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
        <h4 className="mb-0">Manager Dashboard</h4>
        <Link to="/leave-requests" className="btn btn-primary btn-sm">View All Requests</Link>
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
      <h5 className="mb-3">Recent Requests</h5>
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light"><tr><th>Employee</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id}>
                  <td>{getUserName(r.employee_id)}</td>
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
export default ManagerDashboard;

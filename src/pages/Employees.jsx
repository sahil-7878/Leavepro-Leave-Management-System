import { useEffect, useMemo, useState } from "react";
import { getUsers, getDepartments } from "../services/api";
const Employees = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  useEffect(() => { Promise.all([getUsers(), getDepartments()]).then(([u, d]) => { setUsers(u); setDepartments(d); }); }, []);
  const getDeptName = (id) => departments.find(d => d.id === id)?.name || "-";
  const filtered = useMemo(() => users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).filter(u => deptFilter ? u.department_id === Number(deptFilter) : true), [users, search, deptFilter]);
  return (
    <>
      <h4 className="mb-4">Employees</h4>
      <div className="card shadow-sm mb-3"><div className="card-body"><div className="row g-2">
        <div className="col-md-8"><input className="form-control" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="col-md-4"><select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
      </div></div></div>
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td className="text-capitalize">{u.role}</td>
                  <td>{getDeptName(u.department_id)}</td>
                  <td><span className={`badge ${u.status === "active" ? "bg-success" : "bg-secondary"}`}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default Employees;

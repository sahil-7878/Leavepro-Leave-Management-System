import { useEffect, useState } from "react";
import { getDepartments, getUsers } from "../services/api";
const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => { Promise.all([getDepartments(), getUsers()]).then(([d, u]) => { setDepartments(d); setUsers(u); }); }, []);
  const count = (id) => users.filter(u => u.department_id === id).length;
  return (
    <>
      <h4 className="mb-4">Departments</h4>
      <div className="row g-3">
        {departments.map(d => (
          <div className="col-12 col-md-6 col-lg-4" key={d.id}>
            <div className="card shadow-sm h-100"><div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <h5 className="mb-0">{d.name}</h5>
                <span className="badge bg-primary">{count(d.id)} employees</span>
              </div>
              <div className="text-muted small">Status: {d.status}</div>
            </div></div>
          </div>
        ))}
      </div>
    </>
  );
};
export default Departments;

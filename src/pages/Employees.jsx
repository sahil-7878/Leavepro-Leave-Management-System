import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getUsers, getDepartments } from "../services/api";
import { getId } from "../utils/leaveUtils";

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [userData, departmentData] = await Promise.all([
          getUsers(),
          getDepartments()
        ]);

        setUsers(Array.isArray(userData) ? userData : []);
        setDepartments(
          Array.isArray(departmentData) ? departmentData : []
        );
      } catch (error) {
        console.error(
          "Employees loading error:",
          error.response?.data || error
        );
        toast.error(
          error.response?.data?.message || "Failed to load employees"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getDeptName = (departmentId) => {
    const department = departments.find(
      (d) => getId(d) === getId(departmentId)
    );

    return department?.name || "-";
  };

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((employee) => {
      const name = employee.name || "";
      const email = employee.email || "";

      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue);

      const matchesDepartment = deptFilter
        ? getId(employee.department_id) === deptFilter
        : true;

      return matchesSearch && matchesDepartment;
    });
  }, [users, search, deptFilter]);

  return (
    <>
      <h4 className="mb-4">Employees</h4>

      <div className="card shadow-sm mb-3">
        <div className="card-body p-3 p-sm-4">
          <div className="row g-2">
            <div className="col-12 col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>

                {departments.map((department) => (
                  <option
                    key={getId(department)}
                    value={getId(department)}
                  >
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-2 mb-0">
              Loading employees...
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-4 text-muted"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((employee) => (
                    <tr key={getId(employee)}>
                      <td>{employee.name || "-"}</td>
                      <td className="text-break">
                        {employee.email || "-"}
                      </td>
                      <td className="text-capitalize">
                        {employee.role || "-"}
                      </td>
                      <td>
                        {getDeptName(employee.department_id)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            employee.status?.toLowerCase() === "active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {employee.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Employees;
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getDepartments, getUsers } from "../services/api";
import { getId } from "../utils/leaveUtils";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [departmentData, userData] = await Promise.all([
          getDepartments(),
          getUsers()
        ]);

        setDepartments(
          Array.isArray(departmentData) ? departmentData : []
        );
        setUsers(Array.isArray(userData) ? userData : []);
      } catch (error) {
        console.error(
          "Department loading error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.message || "Failed to load departments"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const count = (departmentId) => {
    return users.filter(
      (user) =>
        user.role === "employee" &&
        getId(user.department_id) === getId(departmentId)
    ).length;
  };

  return (
    <>
      <h4 className="mb-4">Departments</h4>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 mb-0">
            Loading departments...
          </p>
        </div>
      ) : departments.length === 0 ? (
        <div className="alert alert-info">
          No departments found.
        </div>
      ) : (
        <div className="row g-3">
          {departments.map((department) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={getId(department)}
            >
              <div className="card shadow-sm h-100">
                <div className="card-body p-3 p-sm-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                    <h5 className="mb-0 text-break">
                      {department.name}
                    </h5>

                    <span className="badge bg-primary flex-shrink-0">
                      {count(department)} employees
                    </span>
                  </div>

                  <div className="text-muted small">
                    Status: {department.status || "Active"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Departments;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getLeaveTypes, createLeaveRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { calcTotalDays } from "../utils/leaveUtils";

const init = {
  leave_type_id: "",
  start_date: "",
  end_date: "",
  reason: "",
  half_day: false
};

// Format date using local timezone
const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Get date four months ahead
const getFourMonthsAhead = () => {
  const date = new Date();
  const originalDay = date.getDate();

  date.setDate(1);
  date.setMonth(date.getMonth() + 4);

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  date.setDate(Math.min(originalDay, lastDay));

  return date;
};

// Last day of current financial year
const getFinancialYearEnd = () => {
  const today = new Date();
  const year = today.getFullYear();
  const startYear = today.getMonth() >= 3 ? year : year - 1;

  return new Date(startYear + 1, 2, 31);
};

const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(init);
  const [types, setTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const today = formatDateInput(new Date());

  const fourMonthsDate = getFourMonthsAhead();
  const financialYearEnd = getFinancialYearEnd();

  const maxDate = formatDateInput(
    fourMonthsDate < financialYearEnd
      ? fourMonthsDate
      : financialYearEnd
  );

  useEffect(() => {
    const loadLeaveTypes = async () => {
      try {
        const data = await getLeaveTypes();
        setTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Leave types error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to load leave types"
        );
      } finally {
        setLoadingTypes(false);
      }
    };

    loadLeaveTypes();
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: ""
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.leave_type_id) {
      newErrors.leave_type_id = "Please select leave type";
    }

    if (!form.start_date) {
      newErrors.start_date = "Please select start date";
    } else if (form.start_date < today || form.start_date > maxDate) {
      newErrors.start_date = "Please select a date within the allowed range";
    }

    if (!form.end_date) {
      newErrors.end_date = "Please select end date";
    } else if (form.end_date < today || form.end_date > maxDate) {
      newErrors.end_date = "Please select a date within the allowed range";
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      newErrors.end_date = "End date cannot be before start date";
    }

    if (!form.reason.trim()) {
      newErrors.reason = "Please enter reason";
    }

    if (form.half_day && form.start_date !== form.end_date) {
      newErrors.half_day = "Half day leave must be for a single date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    if (!(user?.id || user?._id)) {
      toast.error("Please login again");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        employee_id: user.id || user._id,
        leave_type_id: form.leave_type_id,
        start_date: form.start_date,
        end_date: form.end_date,
        total_days: calcTotalDays(
          form.start_date,
          form.end_date,
          form.half_day
        ),
        reason: form.reason.trim(),
        half_day: form.half_day
      };

      await createLeaveRequest(payload);

      toast.success("Leave applied successfully!");

      setForm(init);
      setErrors({});

      navigate("/leave-history");
    } catch (error) {
      const errorData = error.response?.data;

      console.error(
        "Leave submission error:",
        errorData || error
      );

      toast.error(
        errorData?.message ||
        errorData?.error ||
        "Failed to submit leave. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(init);
    setErrors({});
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <div className="card shadow-sm border-0">
          <div className="card-body p-3 p-sm-4">
            <h4 className="mb-4">Apply for Leave</h4>

            <form onSubmit={submit} noValidate>
              {/* Leave Type */}
              <div className="mb-3">
                <label htmlFor="leaveType" className="form-label">
                  Leave Type *
                </label>

                <select
                  id="leaveType"
                  className={`form-select ${
                    errors.leave_type_id ? "is-invalid" : ""
                  }`}
                  value={form.leave_type_id}
                  onChange={(e) =>
                    update("leave_type_id", e.target.value)
                  }
                  disabled={loadingTypes || submitting}
                >
                  <option value="">
                    {loadingTypes
                      ? "Loading leave types..."
                      : "-- Select --"}
                  </option>

                  {types.map((type) => (
                    <option
                      key={type.id || type._id}
                      value={type.id || type._id}
                    >
                      {type.name} ({type.code})
                    </option>
                  ))}
                </select>

                {errors.leave_type_id && (
                  <div className="invalid-feedback">
                    {errors.leave_type_id}
                  </div>
                )}
              </div>

              {/* Start and End Dates */}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="startDate" className="form-label">
                    Start Date *
                  </label>

                  <input
                    id="startDate"
                    type="date"
                    className={`form-control ${
                      errors.start_date ? "is-invalid" : ""
                    }`}
                    value={form.start_date}
                    min={today}
                    max={maxDate}
                    onChange={(e) => {
                      const value = e.target.value;

                      update("start_date", value);

                      if (form.end_date && form.end_date < value) {
                        setForm((prev) => ({
                          ...prev,
                          start_date: value,
                          end_date: ""
                        }));
                      }
                    }}
                    disabled={submitting}
                  />

                  {errors.start_date && (
                    <div className="invalid-feedback">
                      {errors.start_date}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="endDate" className="form-label">
                    End Date *
                  </label>

                  <input
                    id="endDate"
                    type="date"
                    className={`form-control ${
                      errors.end_date ? "is-invalid" : ""
                    }`}
                    value={form.end_date}
                    min={form.start_date || today}
                    max={maxDate}
                    onChange={(e) =>
                      update("end_date", e.target.value)
                    }
                    disabled={submitting}
                  />

                  {errors.end_date && (
                    <div className="invalid-feedback">
                      {errors.end_date}
                    </div>
                  )}
                </div>
              </div>

              {/* Half Day */}
              <div className="mb-3 mt-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="hd"
                    checked={form.half_day}
                    onChange={(e) =>
                      update("half_day", e.target.checked)
                    }
                    disabled={submitting}
                  />

                  <label htmlFor="hd" className="form-check-label">
                    Half Day
                  </label>
                </div>

                {errors.half_day && (
                  <div className="text-danger small mt-1">
                    {errors.half_day}
                  </div>
                )}
              </div>

              {/* Reason */}
              <div className="mb-3">
                <label htmlFor="reason" className="form-label">
                  Reason *
                </label>

                <textarea
                  id="reason"
                  rows="3"
                  className={`form-control ${
                    errors.reason ? "is-invalid" : ""
                  }`}
                  value={form.reason}
                  onChange={(e) =>
                    update("reason", e.target.value)
                  }
                  disabled={submitting}
                  placeholder="Enter your reason for leave"
                />

                {errors.reason && (
                  <div className="invalid-feedback">
                    {errors.reason}
                  </div>
                )}
              </div>

              {/* Total Days */}
              <div className="alert alert-info py-2">
                <strong>Total Days:</strong>{" "}
                {calcTotalDays(
                  form.start_date,
                  form.end_date,
                  form.half_day
                )}

                <div className="small mt-1">
                  You can apply for leave up to 4 months in advance,
                  subject to the current financial year.
                </div>
              </div>

              {/* Form Actions */}
              <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    submitting ||
                    loadingTypes ||
                    types.length === 0
                  }
                >
                  {submitting ? "Submitting..." : "Apply Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
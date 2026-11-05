import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getLeaveTypes, createLeaveRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { calcTotalDays } from "../utils/leaveUtils";
const init = { leave_type_id: "", start_date: "", end_date: "", reason: "", half_day: false };
const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(init);
  const [types, setTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { getLeaveTypes().then(setTypes); }, []);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const validate = () => {
    const e = {};
    if (!form.leave_type_id) e.leave_type_id = "Required";
    if (!form.start_date) e.start_date = "Required";
    if (!form.end_date) e.end_date = "Required";
    if (!form.reason.trim()) e.reason = "Required";
    if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) e.end_date = "End date before start date";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error("Fix validation errors");
    try {
      setSubmitting(true);
      const today = new Date().toISOString().split("T")[0];
      await createLeaveRequest({ employee_id: user.id, leave_type_id: Number(form.leave_type_id), start_date: form.start_date, end_date: form.end_date, total_days: calcTotalDays(form.start_date, form.end_date, form.half_day), reason: form.reason, status: "Pending", approved_by: null, created_at: today, updated_at: today });
      toast.success("Leave applied successfully");
      navigate("/leave-history");
    } catch { toast.error("Failed to submit"); }
    finally { setSubmitting(false); }
  };
  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h4 className="mb-4">Apply for Leave</h4>
            <form onSubmit={submit} noValidate>
              <div className="mb-3"><label className="form-label">Leave Type *</label>
                <select className={`form-select ${errors.leave_type_id ? "is-invalid" : ""}`} value={form.leave_type_id} onChange={e => update("leave_type_id", e.target.value)}>
                  <option value="">-- Select --</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                </select>
                {errors.leave_type_id && <div className="invalid-feedback">{errors.leave_type_id}</div>}
              </div>
              <div className="row">
                <div className="col-md-6 mb-3"><label className="form-label">Start Date *</label>
                  <input type="date" className={`form-control ${errors.start_date ? "is-invalid" : ""}`} value={form.start_date} onChange={e => update("start_date", e.target.value)} />
                  {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                </div>
                <div className="col-md-6 mb-3"><label className="form-label">End Date *</label>
                  <input type="date" className={`form-control ${errors.end_date ? "is-invalid" : ""}`} value={form.end_date} onChange={e => update("end_date", e.target.value)} />
                  {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
                </div>
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="hd" checked={form.half_day} onChange={e => update("half_day", e.target.checked)} />
                <label htmlFor="hd" className="form-check-label">Half Day</label>
              </div>
              <div className="mb-3"><label className="form-label">Reason *</label>
                <textarea rows="3" className={`form-control ${errors.reason ? "is-invalid" : ""}`} value={form.reason} onChange={e => update("reason", e.target.value)} />
                {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
              </div>
              <div className="alert alert-info py-2"><strong>Total Days:</strong> {calcTotalDays(form.start_date, form.end_date, form.half_day)}</div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(init)}>Reset</button>
                <button className="btn btn-primary" disabled={submitting}>{submitting ? "Submitting..." : "Apply Leave"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ApplyLeave;

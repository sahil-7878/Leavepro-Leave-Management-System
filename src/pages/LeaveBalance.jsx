import { useEffect, useState } from "react";
import { getLeaveTypes, getLeaveRequests } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { computeBalance } from "../utils/leaveUtils";
import LeaveBalanceCard from "../components/LeaveBalanceCard";

const LeaveBalance = () => {
  const { user } = useAuth();

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const financialYearStart =
    currentDate.getMonth() >= 3 ? currentYear : currentYear - 1;
  const financialYear = `${financialYearStart}-${String(
    financialYearStart + 1
  ).slice(-2)}`;

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError("");

        const [types, requests] = await Promise.all([
          getLeaveTypes(),
          getLeaveRequests()
        ]);

        setBalances(
          computeBalance(types, requests, user?.id || user?._id)
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load leave balance."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || user?._id) {
      fetchBalance();
    }
  }, [user?.id, user?._id]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h4 className="mb-0">Leave Balance ({financialYear})</h4>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 mb-0">
            Loading leave balance...
          </p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {balances.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info mb-0">
                  No leave balance records found.
                </div>
              </div>
            ) : (
              balances.map((balance) => (
                <div
                  className="col-12 col-sm-6 col-lg-3"
                  key={balance.id}
                >
                  <LeaveBalanceCard type={balance} />
                </div>
              ))
            )}
          </div>

          <div className="alert alert-info mb-0">
            <strong>Leave Balance Policy:</strong>{" "}
            Leave balance is updated only after manager approval.
          </div>
        </>
      )}
    </>
  );
};

export default LeaveBalance;
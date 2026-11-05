import { useEffect, useState } from "react";
import { getLeaveTypes, getLeaveRequests } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { computeBalance } from "../utils/leaveUtils";
import LeaveBalanceCard from "../components/LeaveBalanceCard";
const LeaveBalance = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  useEffect(() => {
    Promise.all([getLeaveTypes(), getLeaveRequests()]).then(([t, r]) => setBalances(computeBalance(t, r, user.id)));
  }, [user.id]);
  return (
    <>
      <h4 className="mb-4">Leave Balance ({new Date().getFullYear()})</h4>
      <div className="row g-3 mb-4">
        {balances.map(b => (<div className="col-12 col-sm-6 col-lg-3" key={b.id}><LeaveBalanceCard type={b} /></div>))}
      </div>
      <div className="alert alert-info"><strong>Leave Balance Policy:</strong> Leave balance is updated only after manager approval.</div>
    </>
  );
};
export default LeaveBalance;

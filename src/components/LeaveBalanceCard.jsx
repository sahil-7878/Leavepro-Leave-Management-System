
import { ProgressBar } from "react-bootstrap";

const LeaveBalanceCard = ({ type }) => {
  const limit = Number(type.annual_limit || 0);
  const used = Number(type.used || 0);
  const remaining = Number(type.remaining || 0);

  const percent = limit > 0
    ? Math.min(100, (used / limit) * 100)
    : 0;

  const variant =
    percent > 80 ? "danger" :
    percent > 50 ? "warning" :
    "success";

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <h6 className="mb-0">{type.name}</h6>
          <span className="badge bg-secondary">{type.code}</span>
        </div>

        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>Used: {used}</span>
          <span>Total: {limit}</span>
        </div>

        <ProgressBar now={percent} variant={variant} />

        <div className="mt-2 text-end fw-bold text-primary">
          {remaining} days left
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;

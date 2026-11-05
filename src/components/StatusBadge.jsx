const StatusBadge = ({ status }) => {
  const map = { Pending: "bg-warning text-dark", Approved: "bg-success", Rejected: "bg-danger" };
  return <span className={`badge ${map[status] || "bg-secondary"}`}>{status}</span>;
};
export default StatusBadge;

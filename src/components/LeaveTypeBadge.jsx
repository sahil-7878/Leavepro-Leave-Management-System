const LeaveTypeBadge = ({ type }) => {
  const colors = { CL: "bg-info text-dark", SL: "bg-danger", EL: "bg-primary", PL: "bg-secondary" };
  return <span className={`badge ${colors[type?.code] || "bg-secondary"}`}>{type?.code || "-"}</span>;
};
export default LeaveTypeBadge;

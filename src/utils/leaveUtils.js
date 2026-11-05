export const calcTotalDays = (start, end, half = false) => {
  if (half) return 0.5;
  if (!start || !end) return 0;
  const s = new Date(start), e = new Date(end);
  if (e < s) return 0;
  return Math.round((e - s) / 86400000) + 1;
};
export const computeBalance = (types, requests, empId) =>
  types.map(lt => {
    const used = requests.filter(r => r.employee_id === empId && r.status === "Approved" && r.leave_type_id === lt.id).reduce((s, r) => s + Number(r.total_days), 0);
    return { ...lt, used, remaining: lt.annual_limit - used };
  });
export const computeStats = (types, requests, empId) => {
  const mine = requests.filter(r => r.employee_id === empId);
  const used = mine.filter(r => r.status === "Approved").reduce((s, r) => s + Number(r.total_days), 0);
  const total = types.reduce((s, t) => s + t.annual_limit, 0);
  return { total, used, remaining: total - used, pending: mine.filter(r => r.status === "Pending").length };
};
export const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
export const getLeaveType = (types, id) => types.find(t => t.id === id);

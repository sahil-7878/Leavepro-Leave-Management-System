export const getId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
};

// Calculate total leave days
export const calcTotalDays = (start, end, half = false) => {
  if (half) return 0.5;

  if (!start || !end) return 0;

  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate < startDate
  ) {
    return 0;
  }

  return Math.round((endDate - startDate) / 86400000) + 1;
};

// Calculate leave balance for each leave type
export const computeBalance = (types, requests, empId) => {
  return types.map((leaveType) => {
    const used = requests
      .filter(
        (request) =>
          getId(request.employee_id) === getId(empId) &&
          request.status === "Approved" &&
          getId(request.leave_type_id) === getId(leaveType)
      )
      .reduce(
        (total, request) => total + Number(request.total_days || 0),
        0
      );

    const annualLimit = Number(leaveType.annual_limit || 0);

    return {
      ...leaveType,
      used,
      remaining: Math.max(0, annualLimit - used),
    };
  });
};

// Calculate employee dashboard statistics
export const computeStats = (types, requests, empId) => {
  const myRequests = requests.filter(
    (request) => getId(request.employee_id) === getId(empId)
  );

  const used = myRequests
    .filter((request) => request.status === "Approved")
    .reduce(
      (total, request) => total + Number(request.total_days || 0),
      0
    );

  const total = types.reduce(
    (sum, type) => sum + Number(type.annual_limit || 0),
    0
  );

  const pending = myRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  return {
    total,
    used,
    remaining: Math.max(0, total - used),
    pending,
  };
};

// Format date
export const formatDate = (date) => {
  if (!date) return "-";

  const datePart = String(date).slice(0, 10);
  const parsedDate = new Date(`${datePart}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

// Find leave type by ID
export const getLeaveType = (types, id) => {
  return types.find((type) => getId(type) === getId(id));
};
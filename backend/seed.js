const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();


const User = require("./models/user");
const Department = require("./models/Department");
const LeaveType = require("./models/LeaveType");
const LeaveRequest = require("./models/LeaveRequest");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // 1. Departments
    const departmentData = [
      { name: "Engineering" },
      { name: "Human Resources" },
      { name: "Sales & Marketing" }
    ];

    const departments = {};

    for (const item of departmentData) {
      const department = await Department.findOneAndUpdate(
        { name: item.name },
        { $setOnInsert: item },
        { upsert: true, new: true }
      );

      departments[item.name] = department._id;
    }

    console.log("Departments ready");

    // 2. Leave Types
    const leaveTypeData = [
      { name: "Casual Leave", code: "CL", annual_limit: 7 },
      { name: "Sick Leave", code: "SL", annual_limit: 5 },
      { name: "Earned Leave", code: "EL", annual_limit: 10 },
      { name: "Privilege Leave", code: "PL", annual_limit: 5 }
    ];

    const leaveTypes = {};

    for (const item of leaveTypeData) {
      const leaveType = await LeaveType.findOneAndUpdate(
        { code: item.code },
        { $setOnInsert: item },
        { upsert: true, new: true }
      );

      leaveTypes[item.code] = leaveType._id;
    }

    console.log("Leave types ready");

    // 3. Users
    const passwordHash = await bcrypt.hash("123456", 10);

    const userData = [
      {
        name: "Sahil Nerpagar",
        email: "manager@company.com",
        role: "manager",
        department: "Engineering"
      },
      {
        name: "Priya Sharma",
        email: "employee@company.com",
        role: "employee",
        department: "Engineering"
      },
      {
        name: "Rahul Verma",
        email: "rahul@company.com",
        role: "employee",
        department: "Human Resources"
      },
      {
        name: "Sneha Patel",
        email: "sneha@company.com",
        role: "employee",
        department: "Engineering"
      },
      {
        name: "Amit Kumar",
        email: "amit@company.com",
        role: "employee",
        department: "Sales & Marketing"
      },
      {
        name: "Neha Singh",
        email: "neha@company.com",
        role: "employee",
        department: "Human Resources"
      },
      {
        name: "Vikram Joshi",
        email: "vikram@company.com",
        role: "employee",
        department: "Engineering"
      },
      {
        name: "Anjali Desai",
        email: "anjali@company.com",
        role: "employee",
        department: "Sales & Marketing"
      },
      {
        name: "Rohan Kapoor",
        email: "rohan@company.com",
        role: "employee",
        department: "Engineering"
      },
      {
        name: "Kavita Iyer",
        email: "kavita@company.com",
        role: "employee",
        department: "Human Resources"
      },
      {
        name: "Suresh Menon",
        email: "suresh@company.com",
        role: "employee",
        department: "Sales & Marketing"
      }
    ];

    const users = {};

    for (const item of userData) {
      const user = await User.findOneAndUpdate(
        { email: item.email },
        {
          $setOnInsert: {
            name: item.name,
            email: item.email,
            password: passwordHash,
            role: item.role,
            department_id: departments[item.department],
            status: "active"
          }
        },
        { upsert: true, new: true }
      );

      users[item.email] = user._id;
    }

    console.log("Users ready");

    // 4. Leave Requests
    const leaveData = [
      {
        employee: "employee@company.com",
        type: "CL",
        start: "2026-07-01",
        end: "2026-07-03",
        days: 3,
        reason: "Family function",
        status: "Approved",
        created: "2026-06-25"
      },
      {
        employee: "employee@company.com",
        type: "SL",
        start: "2026-08-10",
        end: "2026-08-11",
        days: 2,
        reason: "Fever",
        status: "Pending",
        created: "2026-08-01"
      },
      {
        employee: "rahul@company.com",
        type: "EL",
        start: "2026-06-15",
        end: "2026-06-20",
        days: 6,
        reason: "Vacation",
        status: "Approved",
        created: "2026-06-01"
      },
      {
        employee: "rahul@company.com",
        type: "CL",
        start: "2026-09-05",
        end: "2026-09-06",
        days: 2,
        reason: "Personal work",
        status: "Pending",
        created: "2026-08-25"
      },
      {
        employee: "sneha@company.com",
        type: "PL",
        start: "2026-05-10",
        end: "2026-05-12",
        days: 3,
        reason: "Wedding",
        status: "Approved",
        created: "2026-04-28"
      },
      {
        employee: "amit@company.com",
        type: "CL",
        start: "2026-10-01",
        end: "2026-10-02",
        days: 2,
        reason: "Festival",
        status: "Pending",
        created: "2026-09-20"
      },
      {
        employee: "neha@company.com",
        type: "SL",
        start: "2026-07-20",
        end: "2026-07-21",
        days: 2,
        reason: "Medical checkup",
        status: "Approved",
        created: "2026-07-10"
      },
      {
        employee: "vikram@company.com",
        type: "EL",
        start: "2026-11-01",
        end: "2026-11-05",
        days: 5,
        reason: "Diwali vacation",
        status: "Pending",
        created: "2026-10-15"
      },
      {
        employee: "anjali@company.com",
        type: "CL",
        start: "2026-12-20",
        end: "2026-12-22",
        days: 3,
        reason: "Christmas",
        status: "Approved",
        created: "2026-12-01"
      },
      {
        employee: "rohan@company.com",
        type: "SL",
        start: "2026-08-05",
        end: "2026-08-06",
        days: 2,
        reason: "Sick",
        status: "Rejected",
        created: "2026-07-30"
      },
      {
        employee: "kavita@company.com",
        type: "PL",
        start: "2026-09-10",
        end: "2026-09-12",
        days: 3,
        reason: "Family trip",
        status: "Pending",
        created: "2026-08-30"
      },
      {
        employee: "suresh@company.com",
        type: "EL",
        start: "2026-06-01",
        end: "2026-06-03",
        days: 3,
        reason: "Personal",
        status: "Approved",
        created: "2026-05-20"
      }
    ];

    let insertedLeaves = 0;

    for (const item of leaveData) {
      const employeeId = users[item.employee];
      const leaveTypeId = leaveTypes[item.type];

      const leaveDate = new Date(`${item.start}T00:00:00.000Z`);
      const financialYearStart = new Date(
        Date.UTC(
          leaveDate.getUTCMonth() >= 3
            ? leaveDate.getUTCFullYear()
            : leaveDate.getUTCFullYear() - 1,
          3,
          1
        )
      );

      const leave = await LeaveRequest.findOneAndUpdate(
        {
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          start_date: new Date(`${item.start}T00:00:00.000Z`),
          end_date: new Date(`${item.end}T00:00:00.000Z`),
          reason: item.reason
        },
        {
          $setOnInsert: {
            employee_id: employeeId,
            leave_type_id: leaveTypeId,
            start_date: new Date(`${item.start}T00:00:00.000Z`),
            end_date: new Date(`${item.end}T00:00:00.000Z`),
            total_days: item.days,
            reason: item.reason,
            status: item.status,
            approved_by: item.status === "Approved" || item.status === "Rejected"
              ? users["manager@company.com"]
              : null,
            half_day: false,
            created_at: new Date(`${item.created}T00:00:00.000Z`),
            updated_at: new Date(`${item.created}T00:00:00.000Z`)
          }
        },
        { upsert: true, new: true }
      );

      if (leave) insertedLeaves++;
    }

    console.log("Leave requests ready");

    console.log("\n========== SEED SUMMARY ==========");
    console.log("Departments:", await Department.countDocuments());
    console.log("Leave Types:", await LeaveType.countDocuments());
    console.log("Users:", await User.countDocuments());
    console.log("Leave Requests:", await LeaveRequest.countDocuments());
    console.log("==================================");
    console.log("Database seed completed successfully!");
    console.log("Demo login password for newly created users: 123456");
    console.log("==================================\n");

  } catch (error) {
    console.error("Seed Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();

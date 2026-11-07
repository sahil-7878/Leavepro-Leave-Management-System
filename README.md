
# ✨ LeavePro

### Employee Leave Management System

<p align="center">
  <strong>Smart Leave Management. Simplified Workflows.</strong><br/>
  A modern, responsive HR application built with React.js.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React.js-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React.js" />
  <img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Axios-API%20Integration-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
</p>

---

## 📌 About the Project

LeavePro is a web-based Employee Leave Management System designed to make leave applications and approvals simple, organized, and efficient.

Employees can apply for leave, monitor their leave balance, and track request status. Managers can review applications, approve or reject requests, and manage employee leave information.

The project demonstrates practical React.js development through reusable components, API integration, responsive design, and role-based workflows.

## 🚀 Key Features

| 👨‍💻 Employee Portal | 👨‍💼 Manager Portal |
|---|---|
| Employee dashboard | Manager dashboard |
| Apply for leave | Review leave applications |
| View leave history | Approve or reject requests |
| Track leave balance | Search and filter requests |
| View leave details | View employee information |

### Additional Highlights

- Responsive desktop and mobile interface
- Role-based login and dashboard navigation
- Leave request status tracking
- Leave balance and summary cards
- Form validation and error handling
- REST API integration using Axios

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| JavaScript ES6+ | Application logic |
| Vite | Development and build tooling |
| Axios | API communication |
| CSS | Responsive UI styling |
| JSON Server / Mock API | Development data and API endpoints |

## 📂 Project Structure

```text
LeavePro/
├── public/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── LeaveCard.jsx
│   │   └── LeaveTable.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── ManagerDashboard.jsx
│   │   ├── ApplyLeave.jsx
│   │   ├── LeaveHistory.jsx
│   │   └── LeaveBalance.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## ⚡ Getting Started

### Prerequisites

- Node.js and npm
- Git
- Configured backend API

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Backend

Start your configured backend or mock API server. Ensure the API is accessible through the `/api` proxy configured in Vite.

### 4. Start the Frontend

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## 🔐 Demo Login Credentials

Explore the application using the following demo accounts.

| Role | Email | Password |
|---|---|---|
| Manager | manager@company.com | 123456 |
| Employee | employee@company.com | 123456 |

These credentials are intended for the development environment only.

## 🔄 Application Workflow

```text
       Employee Login
              │
              ▼
      Employee Dashboard
              │
              ▼
        Apply for Leave
              │
              ▼
       Request: Pending
              │
              ▼
       Manager Reviews
              │
         ┌────┴────┐
         ▼         ▼
      Approve    Reject
         │         │
         └────┬────┘
              ▼
      Updated Leave Status
```

## 📊 Leave Policy

The project uses the following sample annual leave allocation.

| Leave Type | Code | Annual Allocation |
|---|---|---:|
| Casual Leave | CL | 7 days |
| Sick Leave | SL | 5 days |
| Earned Leave | EL | 10 days |
| Privilege Leave | PL | 5 days |

Leave balance is updated after approval. Pending and rejected requests are not counted as used leave.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Retrieve users |
| GET | `/departments` | Retrieve departments |
| GET | `/leaveTypes` | Retrieve leave types |
| GET | `/leaveRequests` | Retrieve leave requests |
| GET | `/leaveRequests/:id` | Retrieve a leave request |
| POST | `/leaveRequests` | Create a leave request |
| PATCH | `/leaveRequests/:id` | Update leave status |

## 🌟 Future Enhancements

- Secure authentication and password hashing
- Role-based access control
- Employee and department management
- Leave balance reporting
- Approval and rejection notifications
- Enhanced form validation and error handling

## 👨‍💻 Author

**Sahil Nerpagar**

MCA Student | Aspiring Full Stack Developer

[GitHub Profile](https://github.com/sahil-7878)

---

<p align="center">
  <strong>LeavePro</strong><br/>
  Making Employee Leave Management Simple & Efficient.
</p>
=======
# Leavepro---Leave-Management-System
>>>>>>> 295f8874d857f4fcea9b7ae17c5f0c2073caf4a6

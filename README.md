# 📋 Task Management System (TMS) — Planora

A full-stack task management application built with Node.js/Express backend and React (Vite) frontend. Organize, track, and manage your tasks with ease.

**Department of Industrial Management — University of Kelaniya**
**INTE 21323 — Web Application Development (Level 2, Semester 1)**

---

## 🌐 Live Links

| Resource              | URL                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Production App**    | [https://www.planora.page](https://www.planora.page)                                                               |
| **Azure Temp Domain** | [https://tms-frontend-group10.azurewebsites.net](https://tms-frontend-group10.azurewebsites.net)                   |
| **Swagger API Docs**  | [https://tms-backend-group10.azurewebsites.net/api/docs/](https://tms-backend-group10.azurewebsites.net/api/docs/) |

---

## Project Overview

The Task Management System (TMS) — branded as **Planora** — is a full-stack web application designed to help teams organize, track, and manage their daily tasks efficiently. The project follows a modern three-tier architecture using the Node.js, Express, React, and MySQL stack with a Cloud Database hosted on Microsoft Azure.

### Technical Stack

- **Frontend:** React.js with Vite (ESM), served via Nginx
- **Backend:** Node.js & Express.js
- **Database:** Azure Database for MySQL (Flexible Server)
- **ORM:** Sequelize
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt for password hashing
- **Container Registry:** Azure Container Registry (`tmsgroup10registry.azurecr.io`)
- **Hosting:** Azure App Service (Linux containers)
- **Domain & DNS:** planora.page via Name.com (CNAME record)

---

## 🚀 Features

- Create, read, update, and delete tasks
- File attachment support via uploads
- Environment-based configuration (.env)
- Fast frontend powered by Vite + React
- RESTful API backend with Express
- Modular component-based UI architecture
- Context API for global state management
- Custom React hooks for reusable logic
- Interactive API documentation via Swagger UI

---

## 🏗️ Deployment Architecture

The application is deployed using a containerized workflow on Microsoft Azure.

```
Local laptop (Docker build, Windows/Ubuntu)
        |
        | docker push
        ▼
Azure Container Registry (tmsgroup10registry.azurecr.io)
        |                          |
        | pulls image              | pulls image
        ▼                          ▼
tms-backend-group10         tms-frontend-group10
Node.js, port 5000          React, Nginx, port 80
App Service (Linux)         App Service (Linux)
        |                          |
        | SQL queries              | HTTPS
        ▼                          ▼
Azure MySQL Flexible        planora.page
group10-tms / port 3306     CNAME via Name.com DNS
                                   |
                                   ▼
                             Browser
                        www.planora.page/login
```

### Deployment Steps (CI Summary)

1. Build Docker images locally on Windows/Ubuntu.
2. Push images to **Azure Container Registry** (`tmsgroup10registry.azurecr.io`).
3. Azure App Service pulls the backend image → runs Node.js on port 5000.
4. Azure App Service pulls the frontend image → serves React via Nginx on port 80.
5. Backend connects to **Azure MySQL Flexible Server** (port 3306, SSL enforced).
6. Frontend is accessible via the custom domain `planora.page` (CNAME via Name.com DNS).

---

## 🗂️ Project Structure

The repository is organized into a **Monorepo** structure for independent scaling of the frontend and backend.

```
task-management-system/
│
├── backend/
│ ├── src/
│ │ ├── config/         # DB connection & app config
│ │ ├── controllers/    # Route handler logic
│ │ ├── middleware/     # Auth & role-guard middleware
│ │ ├── models/         # Sequelize models (DB schema)
│ │ ├── routes/         # Express route definitions
│ │ └── utils/          # Helper functions & utilities
│ ├── uploads/          # Uploaded file storage
│ ├── seedAdmin.ts      # Admin user seeder script
│ ├── server.ts         # App entry point
│ ├── .env              # Backend environment variables
│ ├── package.json
│ └── tsconfig.json
│
├── frontend/
│ ├── public/           # Static assets
│ ├── src/
│ │ ├── api/            # Axios/fetch API service functions
│ │ ├── assets/         # Images, icons, fonts
│ │ ├── components/     # Reusable UI components
│ │ ├── context/        # React Context providers (Auth, Role)
│ │ ├── hooks/          # Custom React hooks
│ │ ├── pages/
│ │ │ ├── AnalyticsPage.jsx
│ │ │ ├── ChangePasswordPage.jsx
│ │ │ ├── ForgotPasswordPage.jsx
│ │ │ ├── HomePage.jsx
│ │ │ ├── IntroPage.jsx
│ │ │ ├── LoginPage.jsx
│ │ │ ├── NotFoundPage.jsx
│ │ │ ├── ResetPasswordPage.jsx
│ │ │ ├── TaskDetailPage.jsx
│ │ │ ├── TasksPage.jsx
│ │ │ ├── TeamPage.jsx
│ │ │ └── UsersPage.jsx
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── .env
│ ├── index.html
│ └── vite.config.js
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔐 Security & Performance

- Passwords hashed with **Bcrypt** (configurable rounds via `BCRYPT_ROUNDS`)
- Routes protected via **JWT middleware**
- Role-based authorization enforced on every protected endpoint
- **SSL/TLS enforced** on all Azure MySQL connections (`DB_SSL=true`)
- Sensitive credentials stored in `.env` and excluded via `.gitignore`

---

## Getting Started

### 1. Prerequisites

- Node.js (v24 or higher)
- npm
- MySQL (or Azure Access)
- Docker (for containerized deployment)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/task-management-sys.git
cd task-management-sys
```

### 3. Backend Setup

```bash
cd backend
npm install
npm start
```

> A `.env` file is required in the `backend/` folder with Azure DB credentials.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Ports Configuration

Both the frontend and backend ports are configurable via `.env` files.

| Service          | Variable            | Default |
| ---------------- | ------------------- | ------- |
| Backend          | `PORT`              | `5000`  |
| Frontend         | `VITE_PORT`         | `5173`  |
| Frontend API URL | `VITE_API_BASE_URL` | —       |

> If you change the backend port, make sure to update `VITE_API_BASE_URL` in `frontend/.env` accordingly.

---

## 📖 API Documentation

Interactive API documentation is available via Swagger UI:

**[https://tms-backend-group10.azurewebsites.net/api/docs/](https://tms-backend-group10.azurewebsites.net/api/docs/)**

The Swagger UI documents all available REST endpoints, request/response schemas, and authentication requirements.

---

## 🔑 Role-Based Access Control (RBAC)

The system implements three user roles with different levels of access.

### Roles Overview

| Role        | Description                                              |
| ----------- | -------------------------------------------------------- |
| **Admin**   | Full system access — manages users, teams, and all tasks |
| **Manager** | Creates and manages tasks; oversees team members         |
| **Member**  | Views and updates tasks assigned to them only            |

### Permission Matrix

| Action                  | Admin | Manager | Member |
| ----------------------- | :---: | :-----: | :----: |
| View all tasks          |  ✅   |   ✅    |   ❌   |
| View assigned tasks     |  ✅   |   ✅    |   ✅   |
| Create tasks            |  ✅   |   ✅    |   ❌   |
| Edit any task           |  ✅   |   ❌    |   ❌   |
| Edit own/assigned task  |  ✅   |   ✅    |   ❌   |
| Delete tasks            |  ✅   |   ✅    |   ❌   |
| Upload file attachments |  ✅   |   ✅    |   ✅   |
| View analytics          |  ✅   |   ❌    |   ❌   |
| Manage users            |  ✅   |   ❌    |   ❌   |
| Manage teams            |  ✅   |   ✅    |   ❌   |
| Change own password     |  ✅   |   ✅    |   ✅   |

---

## 👥 Team Contributions

**Group 10 — INTE 21323**

| Name | Student ID | Role & Contributions |
|------|-----------|----------------------|
| **DISSANAYAKE D.T.** | IM/2023/024 |  Team Lead / Backend — Project architecture, API design, Docker setup, deployment, environment config |
| **MUTHUKUMARANA N.H.** | IM/2023/013 |  Backend Developer — Task CRUD, middleware, error handling |
| **SATHSARANI K.G.A.S.** | IM/2023/031 |  Frontend Developer — React pages, routing, UI/UX, authentication |
| **VITHANACHCHI B.K.Y.M.** | IM/2023/034 |  Database Management — ER diagram, MySQL schema, migrations |

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

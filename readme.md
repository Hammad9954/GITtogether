# Git Together

> **Find your people. Build something great.**

Git Together is a full-stack student collaboration, team-formation, and campus hackathon platform. It connects university students by matching complementary technical skills, project passions, and availability using an explainable 0–100 compatibility scoring engine.

---

## 📋 Table of Contents
1. [Overview & Features](#-overview--implemented-features)
2. [Architecture & Technology Stack](#-architecture--technology-stack)
3. [Repository Folder Structure](#-repository-folder-structure)
4. [Prerequisites](#-prerequisites)
5. [MongoDB Atlas Setup](#-mongodb-atlas-setup)
6. [Environment Variables](#-environment-variables)
7. [Installation & Quickstart](#-installation--quickstart)
8. [Available Scripts](#-available-scripts)
9. [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
10. [Explainable Matching Engine](#-explainable-matching-engine)
11. [REST API Documentation (`/api/v1`)](#-rest-api-documentation-apiv1)
12. [Security Architecture](#-security-architecture)
13. [Troubleshooting Guide](#-troubleshooting-guide)
14. [Production Deployment](#-production-deployment)

---

## ✨ Overview & Implemented Features

- **Authentication & Security:** University registration, JWT stored securely in HTTP-only cookies, bcrypt password hashing, 6-digit email verification workflow, role-based authorization (`student`, `admin`), rate limiting, Helmet headers, and CORS security.
- **Student Profiles:** Customizable profiles with universities, course, year, bio, skills, interests, portfolio links, availability, preferred roles, reputation score, and avatar image uploads.
- **Project Discovery & Management:** Create, edit, publish, pause, and close projects; category filters, required skill tags, open positions with filled counts, deadlines, repository/demo links.
- **Application & Team Provisioning:** Students apply with custom pitches; project owners accept or reject applications; accepting an application automatically adds the applicant to the team workspace and shared chat room.
- **Team Workspaces:** Team leaders, member role delegation, permission management, member removal, and workspace resource links.
- **Explainable Skill-Based Matching:** Deterministic 0–100 compatibility score showing transparent reasons (skill overlap, complementary missing skills, shared interests, availability, preferred role).
- **Hackathons:** Browse hackathons, participant lists, countdown timers, register individual attendance, and register teams.
- **Real-Time Messaging:** Private direct messaging and team group chats powered by Socket.IO with authorization checks, unread counters, and typing indicators.
- **Notifications:** Real-time bell notifications and database persistence for applications, team invitations, reviews, and messages.
- **Peer Skill Sharing:** Offer skills, request 1-on-1 peer learning sessions, accept/reject requests, exchange meeting links, and earn reputation boosts upon completion.
- **Peer Reviews & Anti-Fraud:** 5-star ratings and feedback with sub-ratings (collaboration, communication, punctuality); duplicate reviews are blocked, and reviews are strictly restricted to students who actively collaborated on a team project.
- **Admin Panel & Moderation:** System analytics, user suspension/reactivation, role management, and resolution of user/project moderation reports.
- **Modern Responsive UI:** Glassmorphism dashboard, dark/light theme toggle, mobile drawer sidebar, and toast notifications.

---

## 📐 Architecture & Technology Stack

```
Git Together Architecture
├── Frontend (Vite 6 + React 18 SPA)
│   ├── State: ThemeContext, AuthContext, SocketContext, ToastContext
│   ├── Styling: Tailwind CSS 3 (curated slate/indigo palette, full dark mode)
│   ├── Charts: Recharts
│   └── Icons: Lucide React
│
└── Backend (Node.js + Express 4 REST API + Socket.IO 4)
    ├── Models: Mongoose schemas with compound indexes & validation
    ├── Validation: Zod schemas
    ├── Security: Helmet, Express Rate Limit, Cookie-Parser, Bcrypt, JWT
    └── Real-time: Authenticated Socket.IO rooms for users & conversations
```

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite 6 | Fast single-page application with React Router v6 |
| **Styling** | Tailwind CSS 3 | Modern typography (Inter), glassmorphism, responsive layouts |
| **Backend** | Node.js, Express.js | Modular controller-service-route MVC pattern |
| **Database** | MongoDB Atlas / Mongoose | Production-grade document database with schema constraints |
| **Real-Time** | Socket.IO | WebSockets with cookie-based handshake authentication |
| **Testing** | Vitest, RTL, Supertest | 28 automated tests across frontend and backend |

---

## 📂 Repository Folder Structure

```
GITtogether/
├── package.json              # Root unified scripts (setup, dev, test, build, seed)
├── package-lock.json
├── .env.example              # Root environment template
├── .gitignore                # Excludes node_modules, .env, build artifacts, uploads
├── readme.md                 # Complete project documentation
├── backend/
│   ├── package.json          # Backend dependencies & test scripts
│   ├── .env.example          # Backend-specific environment template
│   ├── uploads/              # Uploaded user avatars & attachments
│   ├── src/
│   │   ├── server.js         # HTTP server & Socket.IO initialization
│   │   ├── app.js            # Express app configuration & middleware
│   │   ├── config/           # Database connection & environment variables
│   │   ├── controllers/      # Route handler controllers (auth, projects, teams, etc.)
│   │   ├── middleware/       # JWT auth, role checks, upload filters, errorHandler
│   │   ├── models/           # Mongoose schemas (User, Project, Team, etc.)
│   │   ├── routes/           # Versioned API routes under /api/v1
│   │   ├── seed/             # Realistic database seeder
│   │   ├── services/         # Matching engine, Socket.IO, notifications, email
│   │   ├── utils/            # JWT helpers, uniform API response formatters
│   │   └── validators/       # Zod request body validation schemas
│   └── tests/                # Automated backend integration & security tests
└── frontend/
    ├── package.json          # Frontend dependencies & test scripts
    ├── index.html            # HTML entry point with Inter typography
    ├── vite.config.js        # Vite config with proxy to backend & Vitest setup
    ├── tailwind.config.js    # Custom brand color tokens & dark mode configuration
    └── src/
        ├── App.jsx           # Master route hierarchy & ProtectedRoute guards
        ├── main.jsx          # React DOM entry point with all context providers
        ├── api/              # Axios-like Fetch client with cookie credentials
        ├── components/       # Layout, Navbar, Sidebar, Modal, Badges, Rating
        ├── context/          # AuthContext, SocketContext, ThemeContext, ToastContext
        ├── pages/            # 19 full-page views (Dashboard, Projects, Teams, etc.)
        └── test/             # Frontend Vitest suites
```

---

## 💻 Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node v20 & v24)
- **npm**: `v9.0.0` or higher
- **MongoDB Atlas** account (or local MongoDB daemon; in-memory fallback is automatically available for development/testing if no URI is supplied)

---

## 🍃 MongoDB Atlas Setup

Git Together is built to store all data in **MongoDB Atlas**:

1. Log in to your [MongoDB Atlas Console](https://www.mongodb.com/cloud/atlas).
2. Create a new free cluster (M0 or higher).
3. Under **Database Access**, create a database user with read/write privileges and note the password.
4. Under **Network Access**, add an IP access list entry:
   - For local development: Click **Add Current IP Address** or use `0.0.0.0/0` (allow access from anywhere).
5. Click **Connect** > **Drivers** (Node.js) and copy the connection string.
6. Replace `<username>` and `<password>` with your credentials, and specify the database name `gittogether`:
   ```ini
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gittogether?retryWrites=true&w=majority
   ```
7. Paste this URI into your `.env` file.

> **Note on Local Development & In-Memory Fallback:**
> If `MONGODB_URI` is omitted during local development or automated testing, Git Together explicitly boots an ephemeral in-memory MongoDB instance (`mongodb-memory-server`) with a clear notice in the terminal. In production mode (`NODE_ENV=production`), `MONGODB_URI` is strictly required and the application will fail safely if connection fails.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env`:

```bash
# Windows PowerShell
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Express backend server |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for Vite frontend |
| `MONGODB_URI` | `""` | MongoDB Atlas connection string |
| `JWT_SECRET` | `gittogether_dev_jwt_secret_...` | Minimum 32-character secret for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiration period |
| `COOKIE_SECRET` | `gittogether_dev_cookie_secret_...`| Secret for signing HTTP-only cookies |
| `RATE_LIMIT_MAX` | `500` | Max requests per IP within the 15-minute window |
| `EMAIL_FROM` | `Git Together <no-reply@gittogether.edu>` | Display name and sender for verification emails |
| `SMTP_HOST` | `""` | (Optional) SMTP host for production email delivery |
| `SMTP_USER` | `""` | (Optional) SMTP username |
| `SMTP_PASS` | `""` | (Optional) SMTP password |

---

## ⚡ Installation & Quickstart

### 1. Install Dependencies
Run the unified setup script from the repository root:

```bash
# Windows
npm.cmd run setup

# macOS / Linux
npm run setup
```

### 2. Seed Realistic Demo Data
Populate the database with verified student accounts, sample projects, teams, hackathons, and chat conversations:

```bash
# Windows
npm.cmd run seed

# macOS / Linux
npm run seed
```

### 3. Run Development Servers
Start both backend (port 5000) and frontend (port 5173) together:

```bash
# Windows
npm.cmd run dev

# macOS / Linux
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📜 Available Scripts

All scripts can be invoked directly from the root repository:

| Command | Action |
|---|---|
| `npm run setup` | Installs root, backend, and frontend dependencies |
| `npm run dev` | Runs backend (`localhost:5000`) and frontend (`localhost:5173`) concurrently |
| `npm run dev:backend` | Starts backend in hot-reload mode via nodemon |
| `npm run dev:frontend`| Starts frontend Vite development server |
| `npm run seed` | Seeds realistic demo data into the configured database |
| `npm test` | Runs both backend and frontend test suites sequentially |
| `npm run test:backend` | Executes backend Vitest integration & security tests |
| `npm run test:frontend`| Executes frontend component unit tests |
| `npm run build` | Compiles frontend for production into `frontend/dist` |

*(On Windows PowerShell, use `npm.cmd <command>` if execution policy restricts PowerShell scripts).*

---

## 👥 Pre-Seeded Demo Accounts

When you run `npm run seed`, the following accounts are created:

| Role | Email | Password | What You Can Test |
|---|---|---|---|
| **Admin** | `admin@gittogether.edu` | `Password123!` | Moderate reports, suspend/reactivate users, view analytics |
| **Student (Lead)** | `alex@mit.edu` | `Password123!` | Project creator, manage team workspace, review applications |
| **Student (ML)** | `priya@stanford.edu` | `Password123!` | Browse projects, apply with match score, hackathon team member |
| **Student (UI/UX)** | `marcus@berkeley.edu` | `Password123!` | Offer Figma mentorship, peer skill sessions, peer reviews |

---

## 🧠 Explainable Matching Engine

Git Together does not use opaque AI claims. It uses an explainable deterministic mathematical model that awards up to 100 points:

$$\text{Match Score} = \text{Skill Overlap (45)} + \text{Complementary Skills (25)} + \text{Interests (15)} + \text{Availability (10)} + \text{Preferred Role (5)}$$

1. **Direct Skill Overlap (Max 45 pts):** Intersection between candidate skills and required project skills.
2. **Complementary Skills (Max 25 pts):** Awards points when a candidate brings unique skills that existing team members lack.
3. **Domain Interests (Max 15 pts):** Jaccard index similarity of tags (e.g. AI/ML, FinTech, Web3, Open Source).
4. **Availability Alignment (Max 10 pts):** Direct alignment between project expectations and candidate availability.
5. **Preferred Role Fit (Max 5 pts):** Match with open position titles.

Every match returns an explicit list of reasons shown directly in the UI hover tooltip.

---

## 📡 REST API Documentation (`/api/v1`)

All endpoints return a uniform JSON structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Human-readable status"
}
```

### 1. Authentication (`/api/v1/auth`)
- `POST /auth/register` — Register student; hashes password and issues verification token/code.
- `POST /auth/login` — Authenticate and set HTTP-only cookie.
- `POST /auth/logout` — Clear auth cookie.
- `POST /auth/verify-email` — Verify college email via code or link token.
- `GET /auth/me` — Retrieve logged-in session user (`Protected`).

### 2. Projects (`/api/v1/projects`)
- `GET /projects` — Search projects with pagination, category, skill, and status filters.
- `POST /projects` — Create project; automatically provisions a Team workspace and Chat room (`Protected`).
- `GET /projects/:id` — Get project details, required skills, and team composition.
- `PUT /projects/:id` — Update project information (`Owner or Admin`).
- `DELETE /projects/:id` — Remove project and clean up related records (`Owner or Admin`).
- `GET /projects/:id/recommendations` — Fetch candidate students ranked by 0–100% compatibility (`Owner`).

### 3. Applications (`/api/v1/applications`)
- `POST /applications/:projectId` — Apply to an open position (`Protected`).
- `GET /applications/my` — View your submitted applications (`Protected`).
- `GET /applications/project/:projectId` — View applications submitted to your project (`Owner`).
- `PUT /applications/:id/status` — Accept or reject an application; accepting automatically adds the student to the team workspace (`Owner`).
- `PUT /applications/:id/withdraw` — Withdraw a pending application (`Applicant`).

### 4. Teams & Workspace (`/api/v1/teams`)
- `GET /teams` — List teams you belong to (`Protected`).
- `GET /teams/:id` — Access team workspace, members, and resources (`Member`).
- `POST /teams/:teamId/invitations` — Invite a student to join team (`Leader`).
- `PUT /teams/:teamId/members/:memberUserId` — Update role or permissions (`Leader`).
- `DELETE /teams/:teamId/members/:memberUserId` — Remove member (`Leader`).
- `POST /teams/:teamId/leave` — Leave a team (`Member`).
- `PUT /teams/:teamId/links` — Update repository, document, or board links (`Member`).

### 5. Messages (`/api/v1/messages`)
- `GET /messages/conversations` — List direct & team conversation threads (`Protected`).
- `POST /messages/conversations/private` — Open or retrieve direct conversation (`Protected`).
- `GET /messages/conversations/:conversationId/messages` — Paginated chat messages (`Authorized Participant`).
- `POST /messages/conversations/:conversationId/messages` — Send message; broadcast in real-time (`Authorized Participant`).
- `PUT /messages/conversations/:conversationId/read` — Mark conversation as read (`Participant`).

### 6. Hackathons (`/api/v1/hackathons`)
- `GET /hackathons` — List hackathons with mode (`Online`/`In-Person`/`Hybrid`) and status filters.
- `GET /hackathons/:id` — View hackathon details, participants, and registered teams.
- `POST /hackathons` — Create hackathon (`Protected`).
- `POST /hackathons/:id/join` — Register individual participation (`Protected`).
- `POST /hackathons/:id/teams` — Register an entire team for the hackathon (`Team Leader`).

### 7. Skill Sharing (`/api/v1/skills`)
- `GET /skills/sessions` — List requested and provided sessions (`Protected`).
- `GET /skills/mentors` — Discover peer students offering skills (`Protected`).
- `POST /skills/sessions` — Request a 1-on-1 mentorship session (`Protected`).
- `PUT /skills/sessions/:id/respond` — Accept or decline request (`Mentor`).
- `PUT /skills/sessions/:id/complete` — Complete session and apply reputation score boost (`Participant`).

### 8. Peer Reviews (`/api/v1/reviews`)
- `POST /reviews` — Submit a collaboration review; verified against team history (`Collaborator`).
- `GET /reviews/user/:userId` — Fetch reviews and aggregate rating stats.

### 9. Administration & Moderation (`/api/v1/admin`)
- `GET /admin/analytics` — Platform metrics and breakdown (`Admin`).
- `GET /admin/users` — Paginated user directory (`Admin`).
- `PATCH /admin/users/:userId/suspend` — Suspend or reactivate user (`Admin`).
- `PATCH /admin/users/:userId/role` — Update user role (`Admin`).
- `GET /admin/reports` — Moderation reports queue (`Admin`).
- `PATCH /admin/reports/:reportId/resolve` — Resolve report and execute content/user actions (`Admin`).

---

## 🔒 Security Architecture

1. **Zero Client-Trust Authorization:** All ownership checks (projects, teams, applications, reviews) are strictly enforced in server middleware.
2. **HTTP-Only Cookies:** Authentication tokens are stored in `httpOnly`, `sameSite: 'lax'`, `secure` (in production) cookies to prevent XSS credential exfiltration.
3. **Privilege Escalation Protection:** User `role` is stripped from registration and profile update payloads; role transitions require admin endpoints.
4. **Socket.IO Room Authorization:** Sockets verify participant membership in `Conversation` records before allowing clients into conversation rooms.
5. **Anti-Fraud Review Verification:** Students can only review peers with whom they shared an accepted project team collaboration.
6. **MIME & Path-Traversal Upload Protection:** Uploads are checked against strict MIME types (`image/jpeg`, `image/png`, `image/webp`), sanitized with random suffixes, and size-capped at 5MB.
7. **Production Database Safety:** In production mode, the server strictly refuses to start if `MONGODB_URI` is missing or fails to connect.

---

## 🛠️ Troubleshooting Guide

- **PowerShell Execution Policy Error (`PSSecurityException`):**
  If Windows blocks running npm scripts directly in PowerShell, prefix commands with `npm.cmd`:
  ```powershell
  npm.cmd run dev
  npm.cmd test
  ```
- **MongoDB Connection Error:**
  Ensure your IP address is whitelisted in MongoDB Atlas under **Network Access** > **Add IP Address**. If developing offline, clear `MONGODB_URI` from `.env` to allow the automated in-memory database to activate.
- **Port Conflicts:**
  If port 5000 or 5173 is in use, modify `PORT` in `.env` or pass `--port` to Vite in `frontend/package.json`.
- **Upload Directory Permissions:**
  The server automatically creates `backend/uploads/` on boot. Ensure the Node process has write permissions in the repository folder.

---

## 🚀 Production Deployment

### Frontend (e.g. Vercel)
1. Import repository and set Root Directory to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_API_URL=https://your-backend-api.onrender.com`
   - `VITE_SOCKET_URL=https://your-backend-api.onrender.com`

### Backend (e.g. Render, Railway, Fly.io)
1. Set Root Directory to `backend`.
2. Build Command: `npm install`.
3. Start Command: `node src/server.js`.
4. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `CLIENT_URL=https://your-git-together-frontend.vercel.app`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/gittogether?retryWrites=true&w=majority`
   - `JWT_SECRET=<strong-random-32-byte-hex-string>`
   - `COOKIE_SECRET=<strong-random-32-byte-hex-string>`

---

## 📄 License
MIT License. Built for university student teams, campus hackathons, and open-source collaboration.

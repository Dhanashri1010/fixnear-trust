# FixNear Trust — Verified Local Home Services Marketplace

FixNear Trust is an enterprise-grade, transparent home services marketplace platform designed for three distinct user roles: **Customer**, **Service Provider (Technician)**, and **Platform Administrator**.

Built with a modern full-stack architecture:
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT in `httpOnly` secure cookies, Razorpay Payment Gateway, Nodemailer SMTP, and Cloudinary.
- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, and Vanilla CSS custom properties design tokens with complete English, Hindi, and Marathi localization (`i18n`).

---

## 🌟 Key Highlights & Core Architectural Principles

1. **Multi-Portal Role Isolation**:
   - **Customer Portal**: Service catalog browsing, background-verified technician matching, 5-step booking flow, live progress tracking via Socket.io, extra quotation authorization, digital invoice variance review, online Razorpay checkout / cash settlement, and dispute mediation lodging.
   - **Technician Partner Console**: Real-time incoming job offer radar with 60s atomic countdown, step-by-step pipeline transitions (*On the Way*, *Start Work*), in-progress extra quotation dispatch, 4-digit finish code verification, cash collection confirmation, and financial earnings ledger.
   - **Administrator Oversight Desk**: Live operational KPI analytics, 7-day volume chart, candidate approval queue with private KYC document signed-URL viewer, provider directory with low-rating auto-flagging, append-only audit logging, catalog and rate card manager, question bank editor, dispute mediation desk, and review moderation.

2. **Server-Side Source of Truth**:
   - **Pricing & Fees**: Base service price, extra quotations, and platform convenience fee snapshot are strictly computed and verified on the server. Request bodies cannot manipulate bill totals.
   - **Skill Verification Anti-Cheat**: Assessment questions are randomized and graded exclusively on the server. Correct answer indices (`correctIndex`) and rationales are stripped from provider responses and client bundles. Features a server-enforced **24-hour cooldown** after failed attempts and **15-minute countdown limit**.
   - **Finish Code Security**: 4-digit completion code is held securely on the server; after 5 wrong attempts, job completion is blocked for 30 minutes, alerting both the customer and administration.

3. **Atomic Concurrency & Resilient Dispatch**:
   - **Fair Job Dispatch**: Job offers are matched to the nearest online, verified specialist with matching skills, giving each 60 seconds to accept or decline. Atomic database conditions prevent race conditions, duplicate assignments, or double-expiry.
   - **Last Admin Protection**: Atomic conditional checks guarantee the platform's last active administrator can never be deactivated or locked out.
   - **Append-Only Audit Log**: Every administrative action (approvals, suspensions, rate card edits, dispute settlements) is immutably recorded in the `AuditLog` collection, where updates and deletions are programmatically rejected at the database driver layer.

4. **Payments & Invoicing**:
   - Integrated with **Razorpay Checkout** (supporting Test and Live modes) with cryptographic HMAC-SHA256 signature verification and idempotency safeguards.
   - Supports both online digital settlement and verified cash-on-service delivery with official tax invoice generation (`INV-YYYY-XXXX`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Node.js (v18+), Express.js, Socket.io, Mongoose, Zod Validation, Helmet, Express Rate Limit, Mongo Sanitize |
| **Database** | MongoDB Atlas / Local MongoDB with compound indexes for fast geospatial and operational querying |
| **Authentication** | JSON Web Tokens (JWT) transmitted exclusively via `httpOnly`, `SameSite=Strict` secure cookies |
| **Payments** | Razorpay Node.js SDK + Client Checkout with HMAC-SHA256 signature verification |
| **Storage & Documents**| Cloudinary (Public service assets & Private KYC authenticated signed URLs) |
| **Email Service** | Nodemailer with automatic retry, timeout recovery, and plain-language transactional templates |
| **Frontend Core** | React 18, Vite 6, `react-router-dom` v6, `lucide-react` |
| **Styling & Design System** | Pure CSS Custom Properties with Warm White (`#fcfbf9`), Forest Green (`#1b4332`), and Muted Sage |
| **Localization (i18n)** | Native dictionary matrices for **English (`en`)**, **Hindi (`hi` — हिंदी)**, and **Marathi (`mr` — मराठी)** |
| **Testing Suite** | Vitest, Supertest, MongoDB Memory Server (Zero external dependencies) |

---

## 📁 Repository Directory Structure

```
fixnear-trust/
├── server/                           # Backend API Server (Express + MongoDB)
│   ├── config/                       # Database, Cloudinary, and Socket.io configuration
│   ├── controllers/                  # Controller actions (Admin, Auth, Booking, Payment, Provider, etc.)
│   ├── data/                         # Question bank and seed data
│   ├── middleware/                   # JWT auth, role validation, rate limiting, error handling
│   ├── models/                       # Mongoose Schemas (AuditLog, Booking, Dispute, Payment, User, etc.)
│   ├── routes/                       # Express route declarations with Zod request schemas
│   ├── scripts/                      # CLI tools (createAdmin, createTestProvider, loadData, approveProvider)
│   ├── tests/                        # Vitest automated test suites (api.test.js, e2eJourney.test.js)
│   ├── utils/                        # Email helpers, audit logger, regex sanitizer, signed URLs
│   ├── .env.example                  # Backend environment variable template
│   ├── package.json
│   ├── server.js                     # Express entry point and Socket.io server
│   └── vitest.config.js              # Test configuration with pre-loaded environment
├── src/                              # Frontend Application (React 18 + Vite)
│   ├── components/
│   │   ├── admin/                    # Admin portal desks (Approvals, Bookings, Disputes, AuditLog, etc.)
│   │   ├── common/                   # Shared UI (Navbar, Footer, ProtectedRoute, AvatarDropdown)
│   │   └── customer/                 # Customer views (BookingFlow, Tracking, Quotation, DisputeModal)
│   ├── context/
│   │   ├── AuthContext.jsx           # Global multi-role session state and profile cache
│   │   └── ToastContext.jsx          # Toast notification provider
│   ├── i18n/
│   │   └── translations.js           # Multi-language translation matrices (EN, HI, MR)
│   ├── pages/
│   │   ├── admin/                    # Admin dashboard and desk containers
│   │   ├── auth/                     # LoginPage, SignUpPage, ChangePasswordPage, ResetPasswordPage
│   │   ├── customer/                 # HomePage, CatalogPage, MyBookingsPage, InvoicePage
│   │   └── provider/                 # ProviderDashboardPage, ProviderRegisterPage, ProviderSkillTestPage
│   ├── services/
│   │   └── api.js                    # Axios API client with credentials, interceptors, and error handling
│   ├── utils/
│   │   └── razorpay.js               # Dynamic Razorpay checkout script loader
│   ├── App.jsx                       # Master client routes and layout wrapper
│   ├── index.css                     # Design tokens, typography, mobile audit, and print styles
│   └── main.jsx
├── .env.example                      # Frontend environment variable template
├── package.json
├── README.md
├── SECURITY.md                       # Security architecture, vulnerability policies, and controls
└── vite.config.js
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.x or v20.x installed (`node -v`)
- **npm**: v9.x or later installed (`npm -v`)
- **MongoDB**: A running local instance (`mongodb://127.0.0.1:27017/fixnear`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

### 1. Clone the Repository
```bash
git clone https://github.com/Dhanashri1010/fixnear-trust.git
cd fixnear-trust
```

### 2. Configure Environment Files

#### Frontend Configuration (`.env`)
Create `.env` in the root directory:
```bash
cp .env.example .env
```
Default contents:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=
```

#### Backend Configuration (`server/.env`)
Create `server/.env` inside the `server/` folder:
```bash
cp server/.env.example server/.env
```
Ensure the following key variables are set:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/fixnear
JWT_SECRET=super_secure_random_64_character_hex_secret_key_fixnear_trust_2026
ADMIN_EMAIL=admin@fixnear.com
ADMIN_PASSWORD=AdminSecurePass123!
TEST_PROVIDER_EMAIL=provider.test@fixnear.com
TEST_PROVIDER_PASSWORD=ProviderSecure123!
TEST_PROVIDER_CITY=Mumbai
RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourTestKeySecretHere
```

### 3. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 4. Seed Seed Data & Bootstrap Administrative Accounts
Run the automated seed and bootstrap utilities from the `server` directory:
```bash
cd server

# 1. Seed Categories, Services, Default Platform Settings, and Assessment Questions
npm run load-data

# 2. Create the Primary Platform Administrator Account
npm run create-admin

# 3. (Optional for local testing) Create a Verified Online Test Provider in Mumbai
npm run create-test-provider

cd ..
```

### 5. Launch the Development Environment
Run both backend and frontend concurrently:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🛠️ CLI Operations & Utility Commands

| Command | Working Directory | Description |
| :--- | :--- | :--- |
| `npm run dev` | `root` | Starts Vite development server for the customer/provider/admin client. |
| `npm run build` | `root` | Runs type checks and bundles the client for production into `dist/`. |
| `npm run preview` | `root` | Serves the production build locally for verification. |
| `npm run dev` | `server/` | Starts Express server with `nodemon` live-reloading. |
| `npm test` | `server/` | Executes Vitest automated test suite with in-memory MongoDB. |
| `npm run create-admin` | `server/` | Idempotently creates an admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. |
| `npm run create-test-provider` | `server/` | Creates an approved, online technician in Mumbai for instant booking tests. Refuses to run in production. |
| `npm run approve-provider` | `server/` | Interactively approves a pending provider account via CLI. |
| `npm run load-data` | `server/` | Seeds default categories, rate cards, questions, and system settings. |

---

## 🔐 Environment Variables Dictionary

### Backend (`server/.env`)

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `5000` | Port for the Express server to listen on. |
| `NODE_ENV` | **Yes** | `development` / `production` | Environment mode; controls cookie security, mock fallbacks, and log verbosity. |
| `CLIENT_URL` | **Yes** | `http://localhost:5173` | Allowed CORS origin and Socket.io client domain. |
| `MONGODB_URI` | **Yes** | `mongodb+srv://...` | Connection URI for MongoDB Atlas or local MongoDB instance. |
| `JWT_SECRET` | **Yes** | `64+ character random string` | Secret used to sign and verify HMAC-SHA256 JWT auth tokens. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token expiration duration. |
| `ADMIN_EMAIL` | **Yes** | `admin@fixnear.com` | Email address for initial admin bootstrapping. |
| `ADMIN_PASSWORD` | **Yes** | `AdminSecurePass123!` | Password for initial admin account (min 8 chars, letter + number). |
| `TEST_PROVIDER_EMAIL` | Optional | `provider.test@fixnear.com` | Email used by `npm run create-test-provider`. |
| `TEST_PROVIDER_PASSWORD`| Optional | `ProviderSecure123!` | Password used by `npm run create-test-provider`. |
| `TEST_PROVIDER_CITY` | Optional | `Mumbai` | Service territory city for test provider. |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_...` | Public key ID for Razorpay online payment integration. |
| `RAZORPAY_KEY_SECRET` | Optional | `...` | Secret key used for Razorpay order generation & HMAC-SHA256 signature checks. |
| `CLOUDINARY_CLOUD_NAME`| Optional | `fixnear-cloud` | Cloudinary cloud identifier for image assets and document storage. |
| `CLOUDINARY_API_KEY` | Optional | `123456789012345` | Cloudinary API access key. |
| `CLOUDINARY_API_SECRET`| Optional | `...` | Cloudinary API access secret. |
| `SMTP_HOST` | Optional | `smtp.gmail.com` | SMTP relay server for sending transactional emails. |
| `SMTP_PORT` | Optional | `587` | SMTP port (587 for TLS, 465 for SSL). |
| `SMTP_USER` | Optional | `alerts@fixnear.com` | SMTP authentication username. |
| `SMTP_PASS` | Optional | `...` | SMTP authentication password or application-specific password. |
| `EMAIL_FROM` | Optional | `"FixNear Trust" <no-reply@fixnear.com>` | Sender header on outgoing transaction emails. |

### Frontend (`.env`)

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:5000/api` | Base URL endpoint for REST API calls. |
| `VITE_SOCKET_URL` | **Yes** | `http://localhost:5000` | Target URL for real-time Socket.io connections. |
| `VITE_RAZORPAY_KEY_ID` | Optional | `rzp_test_...` | Fallback Razorpay Key ID (API also serves this dynamically from `/api/payments/config`). |

---

## 💳 Razorpay Payments Integration (Test vs Live Mode)

FixNear Trust supports end-to-end digital escrow payments through Razorpay:

### 1. Generating API Keys
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings** -> **API Keys**.
3. Under the **Key Generation** tab, generate keys in **Test Mode** for local testing.

### 2. Transitioning from Test Mode to Live Mode
To switch the platform to live real-money payments:
1. Complete your business KYC in the Razorpay Dashboard.
2. In the top-right toggle, switch the Razorpay Dashboard from **Test Mode** to **Live Mode**.
3. Generate new **Live API Keys** (`rzp_live_...`).
4. Update your production server environment variables:
   ```env
   RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
   ```
5. Restart your backend server. The `/api/payments/config` endpoint will automatically distribute the new public Key ID to client checkouts.

---

## 💾 MongoDB Atlas Setup, Automated Backups & Disaster Recovery

### Connecting to MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, whitelist your server's public IP address (or `0.0.0.0/0` during development).
3. Under **Database Access**, create a user with `readWriteAnyDatabase` privileges.
4. Copy the connection string into `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/fixnear?retryWrites=true&w=majority
   ```

### Automated Atlas Backups
1. On your MongoDB Atlas cluster dashboard, navigate to the **Backup** tab.
2. Ensure **Cloud Backup** is enabled (available on M10+ dedicated clusters, or scheduled via Atlas Serverless).
3. Set a backup snapshot schedule (e.g., Daily snapshots with 7-day retention).

### Manual Backups & Point-in-Time Recovery via CLI

#### Creating a Full Database Backup (`mongodump`)
```bash
mongodump --uri="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/fixnear" --out="./backups/fixnear-$(date +%F)"
```

#### Restoring from a Backup Snapshot (`mongorestore`)
```bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/fixnear" --drop "./backups/fixnear-2026-11-08/fixnear"
```

---

## 📋 Production Readiness & Deployment Checklist

Before deploying FixNear Trust to a live cloud environment:

- [ ] **Node Environment**: Set `NODE_ENV=production` on the production server.
- [ ] **HTTPS / TLS Certificate**: Enforce SSL encryption so cookies are marked `Secure` and `SameSite=None` or `SameSite=Lax`.
- [ ] **Strong Secrets**: Ensure `JWT_SECRET` is at least 64 random hex characters (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- [ ] **CORS Whitelisting**: Set `CLIENT_URL` strictly to your production domain (e.g., `https://fixnear.com`).
- [ ] **MongoDB Atlas IP Access List**: Restrict database access to your production application IP addresses only.
- [ ] **AuditLog Immutability**: Verify that append-only database hooks are functioning and audit logs cannot be purged.
- [ ] **Cloudinary Authentication**: Supply valid Cloudinary credentials so identity proofs and qualification certificates use secure, short-lived signed URLs.
- [ ] **SMTP Email Relay**: Verify SMTP credentials to ensure customers receive receipts, dispute updates, and assignment alerts.
- [ ] **Rate Limiting**: Confirm rate limiters are active on `/api/auth/login`, `/api/auth/register`, and `/api/skill-test`.
- [ ] **Frontend Build Verification**: Run `npm run build` to confirm 0 compilation errors and confirm no secrets exist in the `dist/` bundle.

---

## 🧪 Automated Testing Suite

FixNear Trust features a comprehensive automated test suite powered by **Vitest** and **Supertest**, backed by an isolated **in-memory MongoDB engine** that executes identically across Windows, macOS, and Linux without requiring a pre-installed database:

```bash
cd server
npm test
```

### Test Coverage Highlights
- **Authentication & Security**: Strong password policies (minimum 8 characters, letter + number), `httpOnly` cookie isolation, `passwordChangedAt` token invalidation, and `mustChangePassword` account quarantining.
- **Atomic Dispatch**: Atomic job acceptance, nearest technician matching, race condition mitigation, and 60-second offer expiry rotation.
- **Finish Code Security**: Verification of the 4-digit completion code, 5-attempt lockout enforcement for 30 minutes, and complete concealment from technician responses.
- **Quotations**: Validation of items (1-10), description length, amount bounds (₹1 - ₹50,000), total cap (₹100,000), and max 3 approved revisions per job.
- **Payments (Phase E)**: Server-side bill computation, Razorpay HMAC-SHA256 signature verification, and idempotent verify handling.
- **Admin & Audit Governance**: Append-only audit logs, protection of the last remaining admin against deactivation, and dispute resolution logic.
- **End-to-End Journey Test**: Complete 11-step simulation spanning registration, skill testing, admin verification, booking, quotation approval, completion code validation, online payment, review submission, and dispute refund resolution.

---

## 🧭 Step-by-Step Manual Testing Walkthrough

Follow this scenario guide to manually verify the platform end-to-end:

### Scenario 1: Customer Booking & Technician Dispatch
1. **Open Customer Portal**: Go to `http://localhost:5173`.
2. **Sign Up / Log In**: Register as a customer with email and a strong password (e.g., `Customer123!`).
3. **Browse Services**: Select a service (e.g., *Ceiling Fan Repair & Installation* under *Electricals*).
4. **Complete Booking**: Select date, time slot, and enter an address in **Mumbai**.
5. **Observe Dispatch**: The booking enters `REQUESTED` status. The system searches for the nearest online verified technician matching the category.
6. **Technician Acceptance**: Log in to the Technician Portal (`provider.test@fixnear.com` / `ProviderSecure123!`). The incoming job radar displays the offer with a 60-second countdown. Click **Accept Job**.
7. **Customer View**: The customer's tracking screen immediately reflects *Technician Assigned* via real-time Socket.io, displaying the specialist's name and contact number.

### Scenario 2: Service Execution, Extra Quotation & OTP Completion
1. **Pipeline Transitions**: In the Technician Portal, advance the booking from `ACCEPTED` $\rightarrow$ `ON_THE_WAY` $\rightarrow$ `WORKING`.
2. **Submit Extra Quotation**: In the Technician Portal, create an extra quotation (e.g., "Heavy-duty capacitor replacement" for ₹350).
3. **Customer Approval**: On the Customer's tracking screen, an alert notifies them of the quotation. Review and click **Approve Quotation**.
4. **Finish Code Verification**:
   - The customer's screen displays a secure 4-digit completion code (e.g., `4821`).
   - The technician enters the code in their dashboard and clicks **Verify & Complete**.
   - Upon verification, the job status moves to `COMPLETED`.

### Scenario 3: Payment Settlement, Review & Dispute Resolution
1. **Online Payment (Customer)**:
   - The customer's screen displays the updated invoice breakdown: Base Price (₹350) + Approved Quotation (₹350) + Convenience Fee (₹20) = **₹720**.
   - Click **Pay Online via Razorpay** to trigger the checkout modal.
   - Upon successful payment verification, the status changes to `PAID` with an official invoice number (`INV-2026-XXXX`).
2. **Review Submission**: The customer rates the technician 5 stars with a comment.
3. **File a Dispute**: Click **File a Dispute / Complaint**, enter details, and submit.
4. **Admin Mediation**:
   - Log in to the Admin Portal at `http://localhost:5173/admin/login` (`admin@fixnear.com` / `AdminSecurePass123!`).
   - Navigate to the **Disputes** desk.
   - Review evidence and click **Resolve Ticket**. Select *Refund Customer* (₹200) and *Pay Technician* (₹520).
   - Enter mediation notes and submit. Both customer and technician receive immediate real-time notifications and confirmation emails.
   - Check the **Audit Log** desk to see the immutable event record.

---

## 🔒 Security Architecture

For detailed information regarding FixNear Trust's threat models, password policies, append-only audit structures, and vulnerability reporting protocols, please review our comprehensive **[SECURITY.md](SECURITY.md)** specification.

---

## 📄 License
This project is developed for educational and academic capstone demonstration purposes. All rights reserved.

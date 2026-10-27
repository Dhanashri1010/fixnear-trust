# FixNear Trust — Verified Home Services Marketplace

> **Academic Final-Year B.Tech Capstone Project**  
> A transparent, full-stack home services marketplace (similar to Urban Company / Ola) designed for three distinct user roles: **Customer**, **Service Provider (Technician)**, and **Platform Administrator**.

Built with **React 18**, **Vite**, **React Router v6**, **Vanilla CSS Custom Properties**, and powered by **Firebase** (Authentication, Real-time Firestore `onSnapshot`, Firebase Cloud Storage, and Secure Cloud Functions).

---

## 🌟 Key Highlights & Architectural Pillars

1. **Multi-Portal Architecture**:
   - **Customer Portal**: Service catalog, technician profiles, 5-step booking flow, live tracking, extra quotation authorization, invoice variance comparison, and dispute lodging.
   - **Technician Partner Console**: Real-time incoming job radar with 60s countdown, pipeline progress transitions (*On the Way*, *Start Work*), in-progress extra quotation dispatch, OTP job completion, and financial earnings ledger.
   - **Administrator Oversight Desk**: Live KPI analytics, 7-day volume chart, candidate approval queue with high-resolution document viewer, provider directory with low-rating auto-flagging, binding dispute resolution desk, catalog rate card manager, question bank editor, and review moderation.

2. **Practical Safety Skill Verification & Anti-Cheat**:
   - Technicians must pass a category-specific practical exam before onboarding.
   - Questions are sanitized server-side; correct answers and explanations are **never sent to the client browser**.
   - Server-enforced **24-hour cooldown** after failed attempts and strict **15-minute countdown limit**.
   - Anti-cheat tracking logs unauthorized browser tab switches directly to Firestore.

3. **Escrow Financial Protection & Strict OTP Verification**:
   - Base booking fees and approved extra quotes are held safely in escrow.
   - Jobs can only be completed when the customer provides a secure 4-digit OTP upon doorstep inspection.

4. **Transparent Dispute Resolution Desk**:
   - Customers can lodge disputes directly from their booking dossier.
   - Administrators review side-by-side evidence, timeline history, and quotation vs final invoice, issuing binding rulings (*Refund Customer*, *Pay Provider*, or *Partial Split*).

5. **Internationalization (i18n)**:
   - Full translation matrices for **English (`en`)**, **Hindi (`hi` — हिंदी)**, and **Marathi (`mr` — मराठी)**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 18, Vite 6, `react-router-dom` v6, `lucide-react` |
| **Styling & Design System** | Pure Vanilla CSS with tokens in `src/index.css` (Warm White, Forest Green, Muted Sage) |
| **Authentication** | Firebase Authentication (Email/Password, Google OAuth, and Instant Evaluator Accounts) |
| **Database** | Cloud Firestore with real-time `onSnapshot` subscriptions |
| **Cloud Storage** | Firebase Cloud Storage with strict 5 MB file size and KYC role-based rules |
| **Backend & Cloud Functions**| Node.js Firebase Functions for server-side grading and exam sanitization |

---

## 📁 Repository Folder Structure

```
fixnear-trust/
├── firestore.rules          # Granular security rules for all 10 collections
├── storage.rules            # 5 MB file size limit and KYC access protections
├── functions/               # Firebase Cloud Functions (skill exam evaluator)
│   ├── index.js             # Secure question sanitizer & exam grading functions
│   └── package.json
├── src/
│   ├── components/
│   │   ├── admin/           # Admin desk views (Approvals, Providers, Disputes, etc.)
│   │   ├── common/          # Shared components (Navbar, Footer, RoleSwitcher, ProtectedRoute)
│   │   ├── customer/        # Customer views (BookingFlow, Tracking, Quotation, DisputeModal)
│   │   └── provider/        # Provider views (TechnicianRoadmapPreview, etc.)
│   ├── context/
│   │   ├── AuthContext.jsx  # Multi-role authentication & session state
│   │   ├── StoreContext.jsx # Real-time reactive data store & action dispatchers
│   │   └── ToastContext.jsx # Global notification toasts
│   ├── data/
│   │   └── sampleData.js    # Fallback catalog & customer testimonials
│   ├── i18n/
│   │   └── translations.js  # Internationalization matrix (English, Hindi, Marathi)
│   ├── pages/
│   │   ├── admin/           # AdminDashboardPage.jsx
│   │   ├── auth/            # LoginPage.jsx, SignUpPage.jsx
│   │   ├── customer/        # HomePage, CatalogPage, BookingPage, TrackingPage, etc.
│   │   └── provider/        # ProviderDashboardPage, ProviderRegisterPage, ProviderSkillTestPage
│   ├── services/
│   │   ├── firebase/        # firebase.js, seedData.js, questionBankSeed.js
│   │   └── skillTestService.js # Client exam security mediator
│   ├── App.jsx              # Main router & provider wrapper
│   ├── index.css            # Tokenized design system, mobile audit & accessibility rules
│   └── main.jsx
├── .env.example             # Template for Firebase credentials & demo flags
├── package.json
├── README.md                # Project documentation & test scripts
└── vite.config.js
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or later)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Dhanashri1010/fixnear-trust.git
cd fixnear-trust
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and provide your Firebase project credentials (from the Firebase Console -> *Project Settings* -> *General* -> *Your Apps* -> *Web App*):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=fixnear-trust.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fixnear-trust
VITE_FIREBASE_STORAGE_BUCKET=fixnear-trust.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:...

# Evaluator Flag: Set to true to display the 1-click role switcher demo toolbar
VITE_DEMO_MODE=true
VITE_ENABLE_DEV_DEMO_SWITCHER=true
```

> **Note**: Even if you do not have a live Firebase project connected immediately, FixNear Trust runs seamlessly in **Local Demonstration Mode** with memory-backed state and real-time simulations.

### 3. Deploy Security Rules (Optional for Live Firebase)
To deploy Firestore security rules and Storage security rules:
```bash
npm install -g firebase-tools
firebase login
firebase use --add <your-firebase-project-id>
firebase deploy --only firestore:rules,storage
```

### 4. Deploy Cloud Functions (Optional for Server Evaluation)
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 5. Seed Firestore with Initial Data
Run the local seed script:
```bash
npm run seed
```
*Or* click the green **Seed DB** button on the bottom evaluator toolbar inside the app.

### 6. Start the Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 👥 Evaluator Demo Accounts

When testing authentication via `/login`, you can either click the **1-click Quick Demo Account buttons** or log in with these credentials:

| Role | Email Address | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@fixnear.demo` | `Demo@1234` | Browse services, schedule bookings, live track jobs, approve extra quotes, rate technicians, lodge disputes. |
| **Service Provider** | `provider@fixnear.demo` | `Demo@1234` | Receive incoming jobs, progress job stages, submit extra quotations, verify completion OTP, view earnings. |
| **Administrator** | `admin@fixnear.demo` | `Demo@1234` | Candidate approval desk, provider suspension, dispute rulings, service rate cards, question bank, review moderation. |

---

## 🧪 Comprehensive End-to-End Test Script

Follow this step-by-step walkthrough to test the complete lifecycle across all three portals:

### Step 1: Register a New Technician Partner
1. Go to `/provider/register`.
2. Fill in Step 1 (Personal Details) and Step 2 (Trade Skills & Years of Experience).
3. On Step 3 (Identity Verification), upload an Aadhaar / Voter ID proof file (JPG, PNG, or PDF up to 5 MB).
4. Submit the registration. You are redirected to the **Mandatory Skill Verification Test** (`/provider/test`).

### Step 2: Pass the Practical Skill Test
1. Click **Start 15-Minute Exam**.
2. Notice the live 15-minute timer and shuffled questions without embedded answers.
3. Switch browser tabs once: observe the **Anti-Cheat Warning** alert.
4. Complete the 10 questions and submit.
5. If score $\ge 70\%$, status becomes `under_review` (pending Admin approval).

### Step 3: Admin Review & Approval
1. Use the bottom toolbar to switch to **Admin** (or navigate to `/admin/approvals`).
2. Open the newly registered technician's application dossier.
3. Click **View ID Proof** to inspect the uploaded document in the high-resolution preview modal.
4. Click **Approve Application**. The technician is now officially active and listed in the public catalog.

### Step 4: Customer Books a Service
1. Switch role to **Customer** and navigate to the catalog (`/services`).
2. Select **AC Deep Jet Service** and click **Book Service**.
3. Complete the 5-step scheduling flow (address, preferred slot, issue description, and optional photo).
4. Click **Confirm Appointment**. You are redirected to the **Live Job Tracking** console (`/track/:id`).

### Step 5: Provider Accepts the Booking
1. Switch role to **Provider** (`/provider`).
2. An alert shows the incoming booking with a 60-second response radar.
3. Click **Accept Job**. The booking advances to your **Active Jobs** queue.

### Step 6: On the Way & Extra Quotation
1. On the provider active job card, click **I'm On The Way** $\rightarrow$ customer sees live transit update.
2. Click **Start Diagnostics & Work**.
3. Click **Send Extra Quotation**: add a replacement capacitor (₹650) + labor (₹200) with a photo note.
4. Switch to Customer view: notice the quotation approval card. Click **Approve Additional Quotation**. The escrow hold updates dynamically.

### Step 7: OTP Completion & Escrow Payout
1. On the customer's tracking screen, view the secure 4-digit **Completion OTP** (e.g., `8421`).
2. In the provider dashboard, click **Complete Job (Enter OTP)** and enter the 4 digits.
3. The job completes, and escrow payment is transferred to the technician's earnings balance.

### Step 8: Rating & Review
1. On the completed booking tracking page, the customer rates the service (5 stars) and writes feedback.
2. Submit the review: the technician's public profile dynamically updates with the new average rating.

### Step 9: Raising & Resolving a Dispute
1. On a completed or active booking, click **Report Issue / Raise Dispute**.
2. Select *"Poor Cooling After Repair"*, describe the issue, and submit the dispute.
3. Switch to **Admin** $\rightarrow$ **Disputes Desk** (`/admin/disputes`).
4. Review the timeline, quotation, final invoice, and customer statement.
5. Issue a **Partial Split** ruling (e.g., refund ₹500 to customer, pay balance to provider) with an admin note.
6. Both customer and technician consoles instantly reflect the binding ruling.

---

## 🔒 Security Rules & Production Safety

- **Firebase Firestore Rules (`firestore.rules`)**:
  - Customers can only read and update their own bookings.
  - Providers cannot self-edit their status, verified skills, rating average, or jobs completed.
  - Only users with the `admin` role can approve providers, resolve disputes, toggle services, or moderate reviews.
- **Firebase Storage Rules (`storage.rules`)**:
  - KYC identification documents can only be written by the authenticated owner (up to 5 MB).
  - Only the provider and platform admins can read uploaded KYC documents.
- **Production Guard (`VITE_DEMO_MODE`)**:
  - In production (`VITE_DEMO_MODE=false`), the bottom Evaluator Dev Toolbar and Database Seeder are completely removed from the DOM.
  - Database seeding requires verified administrator authorization.

---

## ⚠️ Known Limitations

In accordance with academic scope and free-tier infrastructure, the following features are intentionally simulated:
1. **Payments & Escrow**: Payment gateways (Razorpay/Stripe) and escrow accounts operate via an in-memory transactional ledger without requiring live bank merchant accounts.
2. **Maps & Turn-by-Turn GPS**: Real-time technician movement uses simulated distance progression and status transitions rather than paid Google Maps Geocoding API subscriptions.
3. **SMS Gateway**: OTP verification displays the 4-digit security code directly in the customer portal rather than sending real SMS messages via paid Twilio/Fast2SMS APIs.

---

## 📄 License & Attribution

This project is submitted as an academic final-year engineering capstone project. Designed and built with a focus on usability, accessibility, and trustworthy home service commerce.

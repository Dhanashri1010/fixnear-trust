# FixNear Trust - Security Architecture & Policy

FixNear Trust is a security-first, verified local home services platform. This document outlines our core security controls, threat mitigations, data protection measures, and vulnerability disclosure process.

---

## 1. Authentication & Session Security

- **Password Policy Enforced at Boundary**:
  - Minimum 8 characters.
  - At least one letter and at least one number.
  - Validated with Zod schemas and tested at the API gateway layer.
- **HttpOnly Secure Cookie Authentication**:
  - JWT tokens are issued strictly in `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
  - Token values are never transmitted in response bodies, completely immunizing against browser XSS token theft.
- **Session Revocation via `passwordChangedAt`**:
  - When a user changes their password, the server updates `passwordChangedAt`.
  - All existing tokens issued prior to that timestamp (`decoded.iat < passwordChangedAt`) are rejected with `401 Unauthorized`.
- **Mandatory Password Change Lockdown**:
  - Accounts flagged with `mustChangePassword: true` (e.g. newly provisioned administrators) are restricted strictly to:
    - `PATCH /api/auth/change-password`
    - `POST /api/auth/logout`
    - `GET /api/auth/me`
  - Any attempt to access business logic routes returns `403 Forbidden` (`code: MUST_CHANGE_PASSWORD`).
- **Brute-Force & Rate Limiting Controls**:
  - `authRateLimiter`: 5 attempts per 15 minutes for login and registration.
  - `authActionRateLimiter`: 5 attempts per 15 minutes for password change and reset.
  - `paymentRateLimiter`: 10 requests per 5 minutes for payment order creation and verification.
  - `uploadRateLimiter`: 10 file uploads per 10 minutes.
  - `testSubmitRateLimiter`: 2 submissions per 15 minutes.

---

## 2. Role Isolation & Information Privacy

- **Strict Role-Based Access Control (RBAC)**:
  - Express middleware (`authenticate`, `authorize('customer' | 'provider' | 'admin')`) guards every private route.
  - Providers cannot access customer billing data or administrative configurations. Customers cannot access technician credentials or platform settings.
- **Privacy Masking Before Offer Acceptance**:
  - Customer's full address and contact telephone number are withheld from technicians until the technician explicitly accepts the job offer.
  - Provider's name and telephone are withheld from the customer until acceptance.
- **Completion Finish Code Secrecy**:
  - The finish code is shown only to the customer who owns the booking and must never appear in any provider response, notification text or data export.
  - The 4-digit completion code (`completionOtp`) is configured with `select: false` on the Mongoose schema, preventing unintended exposure in database projections.
  - It is displayed only in the customer's portal and stripped from every provider response (`.select('-completionOtp')`).
  - Technicians must obtain the code verbally from the customer after inspecting completed work.
- **Finish Code Brute-Force Lockout**:
  - Each incorrect finish code attempt increments `failedFinishCodeAttempts`.
  - Upon 5 incorrect attempts, verification is locked for 30 minutes (`finishCodeBlockedUntil`).
  - Immediate automated security alerts are dispatched to the customer and administrator desk.

---

## 3. Financial Integrity & Payment Gateway Safety

- **Server-Authoritative Pricing**:
  - Booking totals are calculated strictly by the server:
    $$\text{Total} = \text{Base Price} + \text{Approved Quotations} + \text{Platform Fee Snapshot}$$
  - Client-passed prices, amounts, or fee adjustments in request bodies are ignored.
- **Historical Fee & Commission Snapshots**:
  - Every booking records `platformFeeSnapshot` and `commissionRateSnapshot` at creation time.
  - Subsequent admin changes to global platform fees never alter historical bookings or technician earnings.
- **Cryptographic Timing-Safe HMAC-SHA256 Signature Verification**:
  - Online payments through Razorpay require verifying the cryptographic signature:
    $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
  - Signatures are compared using `crypto.timingSafeEqual` with byte-length checks to eliminate timing side-channel attacks.
- **Production Payment Capture Verification**:
  - In production mode, the server communicates directly with the Razorpay API to fetch the transaction record, verifying that its status is `captured` and that its captured amount matches the order total before transitioning booking state.
- **Atomic Concurrency & Single Earnings Credit**:
  - State transition to `PAID` is guarded by an atomic conditional query:
    $$\{ \_id: \text{bookingId}, \text{paymentStatus}: \{ \$ne: \text{'PAID'} \} \}$$
  - Provider earnings are credited, invoices generated, and confirmation emails dispatched strictly if and only if the atomic update matched, ensuring provider balances cannot be credited twice even under simultaneous verification calls.
- **Byte-Exact Raw Webhook Verification**:
  - Razorpay Webhooks are processed via `express.raw({ type: 'application/json' })` mounted prior to `express.json()`.
  - The HMAC-SHA256 signature is verified against the raw binary request payload using `RAZORPAY_WEBHOOK_SECRET` (with no fallback to key secrets).
  - Webhooks support `payment.captured`, `order.paid`, and `refund.processed` events with strict idempotency.
- **Cash Payment Confirmation Lock**:
  - Technicians cannot confirm cash payments if an online payment was `INITIATED` within the preceding 15 minutes, preventing accidental double billing.
  - When cash is confirmed, an immediate notification is pushed to the customer so they can contest unauthorized confirmations.
- **Dispute Settlement Safety**:
  - Admin dispute resolutions are atomic and permitted only once per dispute (`status: 'OPEN'`). Duplicate attempts return `409 Conflict`.
  - Server validates that `refundAmount + providerPayout <= booking.invoice.totalAmount`.

---

## 4. Data Integrity & System Hardening

- **Append-Only Audit Log**:
  - The `AuditLog` collection records administrative actions (who, what, when, old and new values).
  - Mongoose pre-mutation hooks on `updateOne`, `updateMany`, `findOneAndUpdate`, `deleteOne`, `deleteMany`, `findOneAndDelete`, and `findOneAndRemove` reject all modifications, ensuring the audit trail is immutable.
- **Atomic Last-Administrator Protection**:
  - The database maintains an active admin counter (`Setting.activeAdminCount`).
  - Deactivation utilizes an atomic conditional decrement (`{ activeAdminCount: { $gt: 1 } }`), making it mathematically impossible to deactivate the final remaining active administrator even under concurrent requests.
- **Hardened Administrative Bootstrapping**:
  - Scripts `createAdmin.js` and `createTestProvider.js` mandate `ADMIN_PASSWORD` / `TEST_PROVIDER_PASSWORD` with a minimum of 12 characters including letters, numbers, and symbols.
  - Known weak or default example passwords are explicitly rejected at the CLI boundary.
- **Production Secret Validation**:
  - The server inspects `JWT_SECRET` on boot and refuses to start in production mode if it matches any known weak, default, or example strings.
- **Injection & ReDoS Prevention**:
  - `express-mongo-sanitize` scrubs all incoming `req.body`, `req.query`, and `req.params` against NoSQL operator injections (`$`, `.`).
  - `escapeRegex` utility neutralizes special regex metacharacters across all search and filtering queries.
- **HTTP Header Security**:
  - `helmet` is configured with strict Content Security Policy (CSP), frameguard, DNS prefetch control, and HSTS headers.
  - Razorpay checkout scripts (`https://checkout.razorpay.com`) and frame ancestors are whitelisted explicitly.
- **Private Document Protection**:
  - Sensitive files (Government ID proofs and trade certificates) are stored in private Cloudinary storage or access-controlled local disk storage.
  - Technicians and administrators view documents only through short-lived, time-limited signed URLs (`/api/providers/documents/:type`).

---

## 5. Dependency Audit & Vulnerability Summary

- **Frontend (`fixnear-trust`)**:
  - `npm audit`: **0 vulnerabilities** (clean).
- **Backend (`server`)**:
  - `npm audit`: **0 vulnerabilities** (clean).
  - Dependencies: `nodemailer` is upgraded to the latest secure release (`10.3.1`) and `zod` is updated to the latest patched version.
  - Zero high or critical vulnerabilities exist across the active dependency trees.

---

## 6. Vulnerability Disclosure

If you discover a security vulnerability in FixNear Trust:
1. Do **not** open a public issue.
2. Email the core security team at `security@fixnear.com`.
3. Provide full reproduction steps and environment context.
4. We acknowledge reports within 24 hours and issue patches within 72 hours.


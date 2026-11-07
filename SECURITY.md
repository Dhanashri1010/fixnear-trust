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
  - The 4-digit completion code (`completionOtp`) is generated cryptographically on the server.
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
- **Cryptographic HMAC-SHA256 Signature Verification**:
  - Online payments through Razorpay require verifying the cryptographic signature:
    $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
  - Altered or missing signatures return `400 Bad Request`.
- **Idempotent Payment Handling**:
  - Payment order creation reuses existing unexpired orders for the same booking to prevent duplicate order generation.
  - Verification calls and webhook deliveries check `booking.paymentStatus === 'PAID'` and return existing receipts safely without double-marking earnings or sending duplicate emails.
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
  - `npm audit`: **0 vulnerabilities**.
- **Backend (`server`)**:
  - Production security dependencies: `express-mongo-sanitize`, `helmet`, `cors`, `bcryptjs`, `jsonwebtoken`, `zod`, `express-rate-limit`.
  - As of Phase E, standard `npm audit` reports 2 dependency tree advisories:
    1. `nodemailer` (under review for upcoming v7 transition).
    2. `zod` (v3 to v4 migration scheduled).
  - Neither advisory exposes exploitable vectors in FixNear's sandboxed, sanitized API pipeline.

---

## 6. Vulnerability Disclosure

If you discover a security vulnerability in FixNear Trust:
1. Do **not** open a public issue.
2. Email the core security team at `security@fixnear.com`.
3. Provide full reproduction steps and environment context.
4. We acknowledge reports within 24 hours and issue patches within 72 hours.


# FixNear Trust — Production Launch Checklist & Runbook

This runbook outlines all mandatory operational, security, compliance, and infrastructure readiness criteria before taking **FixNear Trust** live to external customers and technician partners.

---

## 1. Required Accounts, Credentials & Service Keys

Prior to deployment, provision production accounts for the following services and store credentials exclusively in your cloud secrets manager (e.g., AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault):

| Service | Purpose | Required Secrets / Config Values |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Primary Document Database | `MONGODB_URI` (cluster connection string with auth credentials) |
| **Razorpay** | Payment Gateway & Invoicing | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| **Cloudinary** | KYC Document & Image Storage | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **SMTP Provider** (AWS SES, Resend, SendGrid) | Transactional Emails | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` |
| **Domain Registrar & DNS** (Cloudflare, Route53) | DNS & TLS Termination | SSL/TLS certificates, CAA records, DNS A/CNAME pointers |
| **Sentry** (Optional) | Real-time Error Monitoring | `SENTRY_DSN` |

---

## 2. Strong Secret Generation Commands

Never reuse example or development secrets in production. Generate cryptographically random, collision-resistant secrets using Node.js built-in `crypto`:

```bash
# 1. Generate 64-character hex JWT_SECRET (256-bit entropy)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Generate 48-character hex RAZORPAY_WEBHOOK_SECRET
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"

# 3. Generate initial production ADMIN_PASSWORD (min 16 chars with letters, numbers & symbols)
node -e "console.log(require('crypto').randomBytes(16).toString('base64url') + '!A1')"

# 4. Generate initial TEST_PROVIDER_PASSWORD
node -e "console.log(require('crypto').randomBytes(16).toString('base64url') + '!P9')"
```

---

## 3. MongoDB Atlas Network & User Access Rules

Ensure least-privilege access and zero-trust network boundaries on MongoDB Atlas:

1. **Database Users (Least Privilege)**:
   - Create a dedicated application user (e.g., `fixnear_app_prod`).
   - Assign the **`readWrite`** role restricted exclusively to the `fixnear` database.
   - **Never** grant `atlasAdmin`, `readWriteAnyDatabase`, or cluster management roles to the application.
2. **Network Security & IP Access Lists**:
   - **Never permit `0.0.0.0/0` (Anywhere) in production**.
   - Whitelist only the fixed public Elastic IPs (EIPs) or outbound NAT Gateway IPs of your backend container/VM instances.
   - For enterprise VPC environments, configure **VPC Peering** or **AWS PrivateLink** / **GCP Private Service Connect** so traffic never traverses the public internet.
3. **Transport Security**:
   - Enforce **TLS 1.2+** encryption on all connections (`ssl=true`).
   - Use SCRAM-SHA-256 password hashing or X.509 client certificates for database authentication.

---

## 4. Automated Backup Settings & Disaster Recovery

Configure automated snapshot policies in MongoDB Atlas to guard against accidental deletion or ransomware:

1. **Continuous Cloud Backups (PITR)**:
   - Enable **Point-in-Time Recovery (PITR)** to allow restoring database state to any exact minute within the last 7 days.
2. **Snapshot Retention Policy**:
   - **Daily Snapshots**: Retained for 7 days.
   - **Weekly Snapshots**: Retained for 30 days.
   - **Monthly Snapshots**: Retained for 365 days (for tax and audit compliance).
3. **Offsite Cold Backups via CLI (`mongodump`)**:
   Schedule an automated weekly cron job on an isolated backup machine to dump collections and upload them to an immutable, versioned bucket (e.g., AWS S3 with Object Lock or GCP Cloud Storage Bucket Lock):
   ```bash
   mongodump --uri="$MONGODB_URI" --gzip --archive="./backups/fixnear-$(date +%F).archive"
   aws s3 cp "./backups/fixnear-$(date +%F).archive" s3://fixnear-immutable-backups/ --sse AES256
   ```

---

## 5. Razorpay Live Mode Steps & Webhook Configuration

Follow this checklist to activate live billing:

1. **Account Activation**:
   - Complete business KYC, bank account verification, and merchant categorization in the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. **Generate Live Keys**:
   - In Dashboard, switch toggle from **Test Mode** to **Live Mode**.
   - Go to **Settings $\rightarrow$ API Keys $\rightarrow$ Generate Key**.
   - Copy `rzp_live_...` and store as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. **Configure Production Webhook**:
   - Navigate to **Settings $\rightarrow$ Webhooks $\rightarrow$ Add New Webhook**.
   - **Webhook URL**: `https://api.yourdomain.com/api/payments/webhook`
   - **Secret**: Copy your generated `RAZORPAY_WEBHOOK_SECRET`.
   - **Alert Email**: Enter engineering incident email (e.g., `ops@yourdomain.com`).
   - **Active Events**:
     - `payment.captured`
     - `order.paid`
     - `refund.processed`
4. **Validation Test**:
   - Execute a live ₹1 or ₹10 test transaction using a live credit/debit card or UPI ID.
   - Verify that the webhook signature validates using byte-exact raw HMAC SHA-256 and marks the booking `PAID` with sequential invoice number `INV-YYYY-XXXXXX`.

---

## 6. Domain, HTTPS & Transport Security

Enforce end-to-end encrypted transit:

1. **TLS / SSL Certificates**:
   - Enforce **TLS 1.3** (minimum TLS 1.2) via Let's Encrypt / Certbot, Cloudflare, or AWS Certificate Manager (ACM).
   - Configure automatic certificate renewal (e.g., 60 days before expiration).
2. **HTTP Redirection**:
   - Force all port 80 HTTP traffic to permanently redirect (301) to HTTPS.
3. **Security Headers**:
   - FixNear Trust backend includes `helmet` configured with:
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS).
     - `X-Content-Type-Options: nosniff`.
     - `X-Frame-Options: SAMEORIGIN` (permitting Razorpay checkout iframe).
     - `Content-Security-Policy` restricting script sources to `'self'` and Razorpay checkout assets.

---

## 7. Production Cookie Configuration

The authentication system issues JWT tokens in `httpOnly` cookies. Verify these environment flags before launch:

```javascript
const cookieOptions = {
  httpOnly: true,                                       // Prevents JavaScript access (mitigates XSS token theft)
  secure: process.env.NODE_ENV === 'production',        // Enforces HTTPS-only transmission
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site API, 'strict' if same-origin
  domain: process.env.COOKIE_DOMAIN || undefined,      // e.g., '.yourdomain.com' for subdomain sharing
  maxAge: 7 * 24 * 60 * 60 * 1000,                     // 7 days expiration
};
```

- When running frontend on `app.fixnear.com` and backend on `api.fixnear.com`, ensure `COOKIE_DOMAIN=.fixnear.com` and `sameSite='none'` with `secure=true`.

---

## 8. Legal Pages That a Qualified Lawyer Must Review

Before onboarding public users and processing real consumer payments, legal counsel must review and localize:

1. **Terms of Service (`/terms`)**:
   - Clarification that FixNear is an intermediary marketplace platform and technicians are independent contractors, not direct employees.
   - Limitation of liability for indirect, incidental, or third-party home damage.
   - Customer cancellation rules, late fee policies, and dispute arbitration jurisdiction.
2. **Privacy Policy (`/privacy`)**:
   - Compliance with the Indian **Digital Personal Data Protection (DPDP) Act, 2023** and GDPR data subject rights.
   - Clear disclosure of collected KYC credentials, technician background check retention, and customer address handling.
   - Right to Erasure / "Delete My Account" and Data Portability / "Download My Data" specifications.
3. **Refund, Cancellation & Dispute Policy (`/refund-policy`)**:
   - Concrete timelines for dispute filing (e.g., within 5 days of completion).
   - Rules on customer refunds vs. technician payouts upon administrative dispute resolution.
   - Razorpay transaction chargeback and dispute mediation procedures.

---

## 9. Provider Payout Architecture Plan (Implementation Roadmap)

*Currently, technician earnings ledger balances are accumulated accurately on the server after platform commission deductions. For production payout disbursement, evaluate the following three models:*

### Option A: RazorpayX Automated Disbursals (Recommended for Scale)
- **Mechanism**: Connect FixNear backend to RazorpayX Payouts API. Each approved technician provides bank account details (Account Number + IFSC) or a verified UPI VPA during onboarding.
- **Settlement Timing**: Automatic instant settlement via IMPS or UPI once a booking reaches `COMPLETED` and the customer dispute window (e.g., 24 hours) clears without complaints.
- **Benefits**: Zero manual intervention; instant partner gratification; webhook notifications on payout success or bank rejection.

### Option B: Batch Bank File Payouts (Ideal for Initial Launch)
- **Mechanism**: Weekly or bi-weekly financial settlement cycle. The admin downloads a consolidated payout CSV from the Admin Dashboard containing approved technician names, bank account numbers, IFSC codes, and net earnings.
- **Settlement Timing**: Finance officer uploads the CSV batch to corporate banking portals (e.g., HDFC, ICICI, or SBI CMS) for bulk NEFT processing.
- **Benefits**: Maximum human oversight during early launch phase; gives administrators time to resolve disputes before funds leave platform custody; no third-party payout API transaction fees.

### Option C: Virtual Accounts & Auto-Split Routes (Razorpay Route)
- **Mechanism**: Razorpay Route splits incoming customer payments at the time of online checkout into platform convenience fee (credited to FixNear master merchant account) and technician earnings (transferred directly into technician's linked Razorpay account).
- **Settlement Timing**: T+1 or T+2 days automated rolling settlement managed natively by Razorpay.
- **Benefits**: FixNear avoids holding technician payouts in its own bank account, simplifying marketplace escrow compliance.

---

## 10. Known Platform Limits & Phase Roadmap

Be aware of the following deliberate boundaries currently present in the system:

1. **City-Level Matching (Not Street-Level GPS Geofencing)**:
   - Technicians are currently matched by city-wide operational coverage, rating, verified skill category, and online status.
   - *Roadmap*: Future update will integrate real-time mobile GPS coordinates, Turf.js bounding boxes, and Google Maps Distance Matrix API for dynamic transit time routing.
2. **Regex Phone Verification (No Live SMS OTP Gateway)**:
   - Customer and technician phone numbers are currently validated using strict Indian 10-digit mobile regex (`^[6-9]\d{9}$`).
   - *Roadmap*: Live SMS gateway integration (e.g., MSG91, Twilio, or Firebase Phone Auth) to enforce one-time SMS verification during signup.
3. **Mock Cloudinary Fallback in Development**:
   - If Cloudinary credentials are not provided in non-production environments, documents are routed to a local git-ignored directory (`uploads-private`).
   - *Production Mandate*: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` must be set in production; the server will return 503 if private upload credentials are missing.


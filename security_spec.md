# Security & Defense Specification — ARAAIN BANNU

## 1. Threat Models & Attack Surfaces
- **Threat A: External Flood & Denial-of-Wallet (DoS)**:
  - *Vector*: Attackers automating scripts to repeatedly POST arbitrary registrations or fake donation verification records.
  - *Mitigations*:
    1. **Invisible Anti-Bot Honeypots**: Traps bot automations on registration and donation forms (`user_confirm_hp`, `user_msg_hp`).
    2. **Sliding-Window Rate Limiting**: Client-side throttle allowing a maximum of 3 submissions per 60 seconds.
    3. **Cloud Rules Gate**: Firestore security rules restrict creation fields, require valid string types with size bounds, and cap photo payload to 700KB.
- **Threat B: Privilege Escalation & Self-Approval**:
  - *Vector*: Malicious clients directly sending Firestore writes attempting to set `status: "approved"` on registrations or `status: "verified"` on donations, or self-assigning council card IDs (`cardId`).
  - *Mitigations*:
    1. `firestore.rules` enforces `request.resource.data.status == 'new'` on registration creation.
    2. `firestore.rules` prohibits `'cardId' in request.resource.data` on creation.
    3. `firestore.rules` enforces `request.resource.data.status == 'unverified'` on donation creation.
    4. Status update and card ID issuance are strictly restricted to authenticated administrators: `isAdmin() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'cardId'])`.
- **Threat C: Personally Identifiable Information (PII) & Financial Exfiltration**:
  - *Vector*: Unauthenticated visitors or competitors attempting to query member applications (containing CNIC, phone numbers, addresses, photos) or donation transaction slips.
  - *Mitigations*:
    1. `registrations` collection read permission requires `isAdmin()`.
    2. `donations` collection read permission requires `isAdmin()`.
    3. Admin authorization enforces verified email or password provider credentials belonging to authorized administrators.
- **Threat D: CMS Tampering & Defacement**:
  - *Vector*: Unauthorized modification of site settings, programs, leadership, or events.
  - *Mitigations*:
    1. `siteConfig/{docId}` write permission is restricted to `isAdmin()`.
    2. Document IDs are validated using regex (`^[a-zA-Z0-9_\-]+$`) to prevent path traversal or ID poisoning.
- **Threat E: Credential Stuffing & Admin Brute-Force Attacks**:
  - *Vector*: Dictionary attacks against administrator login.
  - *Mitigations*:
    1. Exponential brute-force lockout: after 5 failed password attempts, the admin portal enforces a 60-second cooldown timer.
    2. Input sanitization on all credentials.
    3. Immediate password memory zeroing upon completion.
- **Threat F: XSS & Malicious Protocol Execution**:
  - *Vector*: Injecting `<script>` or `javascript:` URLs in fields, social links, or messages.
  - *Mitigations*:
    1. Input sanitization stripping HTML tags, control characters, and dangerous URI schemes.
    2. Enforced `rel="noopener noreferrer"` on all external links.
    3. HTTP Security Headers in `vercel.json`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.

## 2. Invariants
1. `registrations.status` on creation **MUST ALWAYS** be `'new'`.
2. `registrations.cardId` **MUST NEVER** be writable by public users.
3. `donations.status` on creation **MUST ALWAYS** be `'unverified'`.
4. `registrations` and `donations` read access **MUST ALWAYS** require an authenticated admin session.
5. All external URLs **MUST ALWAYS** be filtered to prevent `javascript:` execution.

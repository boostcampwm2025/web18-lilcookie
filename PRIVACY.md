# Privacy Policy for TeamStash Browser Extension

**Last Updated:** February 3, 2026

**Effective Date:** February 3, 2026

---

## Summary

TeamStash is a browser extension that helps you save and organize bookmarks with your team. This privacy policy explains what data we collect, why we collect it, and your rights regarding your data.

**Key Points:**
- We only collect data necessary to provide bookmark storage and team collaboration
- You control your data and can delete it at any time
- We use encryption to protect your data
- We comply with GDPR and respect your privacy rights
- Contact us at: lilcookie.team.stash@gmail.com

---

## 1. Data Controller

**Identity:** TeamStash Project  
**Contact:** lilcookie.team.stash@gmail.com  
**Website:** https://docs.teamstash.eupthere.uk  
**GitHub:** https://github.com/boostcampwm2025/web18-lilcookie

---

## 2. What Data We Collect and Why

### 2.1 Authentication Data

**Data Collected:**
- Email address (from OAuth provider)
- Username/nickname (from OAuth provider)
- User unique identifier (UUID)
- OAuth access and refresh tokens
- Authentication timestamps

**Purpose:** To authenticate your identity and maintain your login session across browser restarts.

**Legal Basis:** Contract performance (GDPR Art. 6.1.b) - necessary to provide the service you requested.

**Retention Period:** 
- Active sessions: Until you log out or tokens expire (access tokens: 1 hour, refresh tokens: 30 days)
- After logout: Tokens are immediately deleted from local storage
- User account data: Retained on server until you delete your account + 30 days for backup recovery

**Where Stored:** 
- Tokens: Locally in your browser's extension storage (not encrypted)
- Account data: TeamStash backend server

---

### 2.2 Bookmark Data

**Data Collected:**
- URL of saved pages
- Page titles
- User-created tags
- User-created summaries/comments
- AI-generated summaries (if you use the AI feature)
- Favicon URLs
- Timestamps (when bookmarks were created/modified)
- Folder assignments

**Purpose:** To store and organize your bookmarks, enable team sharing, and provide AI-powered content summarization.

**Legal Basis:** Contract performance (GDPR Art. 6.1.b) - this is the core functionality you signed up for.

**Retention Period:** 
- Active bookmarks: Retained until you delete them or delete your account
- Deleted bookmarks: Permanently removed within 24 hours
- After account deletion: All bookmarks permanently deleted within 30 days

**Where Stored:** TeamStash backend server and database

---

### 2.3 Team Collaboration Data

**Data Collected:**
- Team memberships (which teams you belong to)
- Selected team and folder preferences
- Team member information visible to you (other members' names/emails within your team)
- Sharing permissions

**Purpose:** To enable bookmark sharing with your team members and maintain your workspace preferences.

**Legal Basis:** Contract performance (GDPR Art. 6.1.b) - necessary to provide team collaboration features.

**Retention Period:**
- While you're a team member: Retained for active use
- After leaving a team: Your personal preference data deleted immediately; bookmarks you created remain visible to team unless you delete them before leaving
- After account deletion: All team associations removed within 30 days

**Where Stored:** TeamStash backend server

---

### 2.4 Page Content (Temporary)

**Data Collected:**
- Readable text content extracted from web pages (using Mozilla Readability library)
- Only when you click the "AI Generate" button
- Truncated to first 2000 characters for AI processing

**Purpose:** To generate AI-powered summaries and tags for your bookmarks.

**Legal Basis:** Consent (GDPR Art. 6.1.a) - only collected when you explicitly click the AI generation button.

**Retention Period:** 
- Stored temporarily in browser session storage
- Automatically cleared when you close the tab or browser
- Not transmitted to server except for AI processing
- AI processing request data not retained after summary generation

**Where Stored:** 
- Temporarily in browser session storage (your device only)
- Sent to backend AI service for processing, then immediately discarded

---

### 2.5 Notification & Polling Data

**Data Collected:**
- Timestamp of last bookmark check
- Count of unseen notifications
- Team bookmark creation metadata (who created, when)

**Purpose:** To notify you when team members add new bookmarks and clear notifications when you visit the dashboard.

**Legal Basis:** Legitimate interest (GDPR Art. 6.1.f) - providing timely notifications enhances the collaborative experience you signed up for.

**Retention Period:** 
- Last check timestamp: Continuously updated, stored until logout
- Notification count: Reset when you visit dashboard or logout
- Cleared from storage on logout

**Where Stored:** Local browser extension storage

---

### 2.6 Browser Activity Data

**Data Collected:**
- Current tab URL, title, and favicon (only when you open the extension popup)
- Tab activation events (to extract content for AI summarization)
- Dashboard visit detection (to clear notification badges)

**Purpose:** To pre-fill the bookmark save form with current page information and enable AI content extraction.

**Legal Basis:** Legitimate interest (GDPR Art. 6.1.f) - essential for core bookmark-saving functionality.

**Retention Period:** Real-time access only; not persistently stored.

**Where Stored:** Not stored; accessed in real-time via browser APIs.

---

## 3. How We Share Your Data

### 3.1 Within Your Team

**What's Shared:** Bookmarks you save to team folders, your username/email (visible to team members), timestamps.

**Why:** To enable team collaboration features.

**Control:** You choose which bookmarks to save to team folders vs. personal folders.

---

### 3.2 Third-Party Service Providers

We share data with the following service providers who process data on our behalf:

| Service Provider | Purpose | Data Shared | Privacy Policy |
|-----------------|---------|-------------|----------------|
| **Authentik (OAuth Provider)** | User authentication | Email, username, authentication requests | Self-hosted: Operated by TeamStash (same data controller) |
| **Backend API Server** | Bookmark storage, AI processing | All bookmark and authentication data | Operated by TeamStash (same data controller) |
| **Naver Cloud Platform Server** | Infrastructure hosting | All data stored on servers | [Naver Cloud Corp Privacy Policy](https://privacy.navercloudcorp.com/en/PrivacyPolicy/ncs) |
| **Naver Cloud Platform Clova AI** | Content summarization | Page content (first 2000 chars), truncated for processing | [Naver Cloud Corp Privacy Policy](https://privacy.navercloudcorp.com/en/PrivacyPolicy/ncs) |

**Legal Safeguards:** All service providers act as data processors under our instructions and are bound by data processing agreements.

---

### 3.3 Legal Requirements

We may disclose your data if required by law, court order, or to protect our legal rights, prevent fraud, or ensure user safety.

---

## 4. International Data Transfers

Your data may be transferred to and processed in the **Republic of Korea**, where our servers are located.

**Legal Basis for Transfer:**
The European Commission has recognized the Republic of Korea as providing an **adequate level of data protection** under GDPR Article 45 (Adequacy Decision). This means that data can be transferred from the EU/EEA to South Korea without requiring additional safeguards such as Standard Contractual Clauses.

**EU Commission Adequacy Decision:**
- South Korea received adequacy status, confirming its data protection framework meets EU standards
- This allows free flow of personal data between the EU/EEA and South Korea
- South Korean law provides equivalent protections to GDPR

**Your Rights:** 
You maintain all GDPR rights regardless of where your data is processed. You have the right to obtain information about the adequacy decision and how your data is protected in South Korea.

---

## 5. Data Security

We implement the following technical and organizational measures to protect your data:

### **Authentication & Authorization**
- **OAuth 2.0 with PKCE**: Secure authentication via Authentik identity provider using Proof Key for Code Exchange (PKCE) to prevent authorization code interception
- **JWT Token Validation**: All API requests validated using signed JWT tokens with issuer and audience verification
- **Token Expiration**: Access tokens expire after 1 hour; refresh tokens expire after 30 days
- **Automatic Token Refresh**: Frontend automatically refreshes expired tokens to maintain secure sessions

### **Access Controls**
- **Team-Based Isolation**: Users can only access bookmarks and data belonging to their teams
- **Role-Based Permissions (RBAC)**: Two roles implemented:
  - **Owner**: Full administrative control over team resources (webhooks, member management)
  - **Member**: Standard access to team bookmarks and folders
- **Resource-Level Authorization**: Every API endpoint verifies team membership before granting access

### **Encryption in Transit**
- **HTTPS/TLS**: All data transmitted between your browser and our servers uses HTTPS encryption via Caddy reverse proxy
- **Automatic Certificate Management**: TLS certificates automatically generated and renewed
- **Secure Cookies**: Authentication tokens stored in cookies with security flags:
  - SameSite=Strict (prevents CSRF attacks)
  - Secure flag enabled (HTTPS only, except localhost)

### **Input Validation & Injection Protection**
- **Server-Side Validation**: All API inputs validated using DTO (Data Transfer Object) schemas with class-validator
- **SQL Injection Protection**: Parameterized queries via Prisma ORM (no raw SQL)
- **Unknown Property Rejection**: API automatically rejects requests with unexpected fields

### **Data Storage**
- **Database**: SQLite database with Prisma ORM
- **Token Storage**: OAuth tokens stored in browser extension local storage and frontend cookies
- **AI Token Usage Limits**: Per-team daily limits (50,000 tokens/day default) to prevent abuse

### **What We Currently DO NOT Have**
To be transparent, the following security measures are **not currently implemented**:

- **Database encryption at rest** - SQLite database file is not encrypted
- **Encrypted token storage** - Browser extension storage does not encrypt tokens
- **Multi-factor authentication (MFA)** - Only single-factor OAuth authentication
- **API rate limiting** - No request throttling on endpoints (except AI token limits)
- **Security headers** - HSTS, CSP, X-Frame-Options not configured
- **Automated security audits** - No regular penetration testing or vulnerability scanning
- **Audit logging** - No comprehensive logging of security events (login attempts, permission denials)

### **Security Limitations & Recommendations**
As an open-source project developed by individual developers, we implement security best practices within our resource constraints. However:

- **No system is 100% secure** - We cannot guarantee absolute protection against all threats
- **Sensitive data warning** - Do not store highly sensitive information (passwords, financial data, health information) in bookmarks
- **Strong authentication** - Use a strong, unique password for your Authentik authentication account
- **Public bookmarks** - Assume team members can see all bookmarks saved to shared folders

### **GDPR Compliance Statement**
Our security measures comply with GDPR Article 32 ("Security of processing"), which requires security "appropriate to the risk" considering:
- **Nature of data**: Bookmarks are low-sensitivity data (not health, financial, or special category data)
- **State of the art**: We use modern authentication (OAuth 2.0 + PKCE), HTTPS encryption, and industry-standard frameworks
- **Costs of implementation**: As individual developers, we balance security with available resources
- **Risk level**: The risk to users' rights and freedoms from bookmark data is significantly lower than sensitive personal data

**Result**: Our implemented security measures (authentication, authorization, encryption in transit, access controls, input validation) are appropriate and proportionate to the risk level of bookmark management services.

### **Reporting Security Vulnerabilities**
If you discover a security vulnerability, please report it responsibly:
- **Email**: lilcookie.team.stash@gmail.com
- **Subject**: "Security Vulnerability Report"
- We will respond within 48 hours and work to address confirmed issues promptly

---

## 6. Your Rights Under GDPR

You have the following rights regarding your personal data:

### 6.1 Right to Access (Art. 15)
Request a copy of all personal data we hold about you.

### 6.2 Right to Rectification (Art. 16)
Correct inaccurate or incomplete data.

### 6.3 Right to Erasure / "Right to be Forgotten" (Art. 17)
Request deletion of your data when:
- No longer necessary for the purpose collected
- You withdraw consent (for consent-based processing)
- You object to processing (for legitimate interest-based processing)
- Data was unlawfully processed

### 6.4 Right to Restriction of Processing (Art. 18)
Request we limit processing while verifying accuracy or assessing objections.

### 6.5 Right to Data Portability (Art. 20)
Receive your data in a machine-readable format (JSON) and transmit it to another service.

### 6.6 Right to Object (Art. 21)
Object to processing based on legitimate interests.

### 6.7 Right to Withdraw Consent (Art. 7.3)
Withdraw consent at any time for consent-based processing (e.g., AI summarization feature).

### 6.8 Right to Lodge a Complaint (Art. 77)
File a complaint with your national data protection authority if you believe we've violated GDPR.

**Find Your Data Protection Authority:** [https://edpb.europa.eu/about-edpb/board/members_en](https://edpb.europa.eu/about-edpb/board/members_en)

---

## 7. How to Exercise Your Rights

**Contact Methods:**
- **Email:** lilcookie.team.stash@gmail.com
- **Subject Line:** "GDPR Data Request - [Your Request Type]"

**What to Include:**
- Your registered email address
- Specific right you wish to exercise
- Any additional details to help us locate your data

**Response Time:** We will respond within **30 days** (1 month). For complex requests, we may extend by an additional 60 days and will inform you.

**Verification:** We may request proof of identity to prevent unauthorized access.

**No Fees:** Exercising your rights is free unless requests are manifestly unfounded or excessive.

---

## 8. Data Retention Summary

| Data Type | Retention Period |
|-----------|------------------|
| OAuth Access Tokens | 1 hour (or until logout) |
| OAuth Refresh Tokens | 30 days (or until logout) |
| Active Bookmarks | Until user deletes or account deletion |
| Deleted Bookmarks | Permanently removed within 24 hours |
| Team Memberships | While you're a member or until account deletion |
| Session Storage (Page Content) | Until tab/browser closes |
| Notification Data | Until dashboard visit or logout |
| Deleted Accounts | 30 days (for recovery), then permanent deletion |
| Server Backups | Deleted data removed from backups within 90 days |

---

## 9. Cookies and Local Storage

**Browser Extension Storage:**
The extension uses browser local storage and session storage APIs (not cookies) to store:
- Authentication tokens (local storage)
- User preferences (local storage)
- Temporary page content (session storage)

**Website Cookies (if applicable):**
If you visit our website (https://docs.teamstash.eupthere.uk or https://app.teamstash.eupthere.uk), separate cookie policies may apply. See website-specific privacy policies.

---

## 10. Children's Privacy

TeamStash is not intended for users under 16 years of age. We do not knowingly collect data from children under 16. If we discover we have collected data from a child under 16, we will delete it immediately.

---

## 11. Changes to This Privacy Policy

We may update this privacy policy to reflect changes in our practices or legal requirements.

**Notification Method:**
- Updated "Last Updated" date at the top
- Notification within the extension (for material changes)
- Email notification (for significant changes affecting your rights)

**Your Continued Use:** Continued use of the extension after changes constitutes acceptance of the updated policy.

**Version History:** Previous versions available upon request.

---

## 12. Open Source and Transparency

TeamStash is an open-source project. You can review our code at:
**GitHub Repository:** [https://github.com/boostcampwm2025/web18-lilcookie](https://github.com/boostcampwm2025/web18-lilcookie)

This transparency allows you to verify our data handling practices.

---

## 13. Chrome Web Store Compliance

This extension complies with Chrome Web Store Developer Program Policies regarding user data:

**Limited Use Policy:**
- Personal and sensitive data is used solely to provide bookmark storage and team collaboration features
- Data is not used for advertising, retargeting, or sold to third parties
- Data is not used to determine creditworthiness

**Prominent Disclosure:**
All data collection purposes are clearly described in this policy and within the extension interface.

---

## 14. Contact Information

**For Privacy Inquiries:**
- Email: lilcookie.team.stash@gmail.com
- Response Time: Within 48 hours for initial contact, 30 days for formal GDPR requests

**For General Support:**
- GitHub Issues: https://github.com/boostcampwm2025/web18-lilcookie/issues

---

## 15. Legal Basis Summary Table

| Processing Activity | Data Types | Legal Basis | Your Rights |
|---------------------|-----------|-------------|-------------|
| User Authentication | Email, username, tokens | Contract (Art. 6.1.b) | Access, rectification, erasure, portability |
| Bookmark Storage | URLs, titles, tags, summaries | Contract (Art. 6.1.b) | Access, rectification, erasure, portability |
| Team Collaboration | Team memberships, shared bookmarks | Contract (Art. 6.1.b) | Access, rectification, restriction, portability |
| AI Summarization | Page content (first 2000 chars) | Consent (Art. 6.1.a) | Withdraw consent, access, erasure |
| Notifications | Bookmark metadata, timestamps | Legitimate Interest (Art. 6.1.f) | Object, access, restriction |
| Tab Information | Current tab URL/title | Legitimate Interest (Art. 6.1.f) | Object (by not using extension) |

---

## 16. Definitions

**Personal Data:** Any information relating to an identified or identifiable natural person.

**Data Controller:** The entity that determines the purposes and means of processing personal data (TeamStash).

**Data Processor:** An entity that processes data on behalf of the controller (e.g., cloud hosting providers).

**Data Subject:** You, the individual whose personal data is processed.

---

## Acknowledgments

This privacy policy complies with:
- **General Data Protection Regulation (GDPR)** - EU Regulation 2016/679
- **Chrome Web Store Developer Program Policies**
- **ePrivacy Directive** (where applicable)

---

**By using TeamStash, you acknowledge that you have read and understood this Privacy Policy.**

---

*This privacy policy was last reviewed and updated on February 3, 2026.*

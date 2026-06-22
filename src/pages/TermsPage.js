// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      <Header />
      <main className="container" style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          </div>
          <h1 style={{ color: "#bfa24f", fontSize: "1.6rem", margin: 0, padding: "18px 0" }}>
            SHIELD‑AUTHENTICATOR — Terms of Use
          </h1>
          <p className="meta" style={{ color: "#a6a6a6", fontSize: ".95rem", marginBottom: 16 }}>
            Effective Date: 13 June 2026<br />
            Product: SHIELD‑AUTHENTICATOR (the "Software" or "Service")<br />
            Provider: SHIELD Intelligence (the "Provider", "we", "us")<br />
            Contact: <a href="mailto:shield@shieldintelligence.in">shield@shieldintelligence.in</a>
          </p>
          <p>
            By installing, accessing, or using SHIELD‑AUTHENTICATOR, you ("User", "You") accept these Terms. If you do not agree, do not use the Software. These Terms constitute a binding legal agreement.
          </p>
          <div className="card" style={{ background: "#13151a", border: "1px solid #1f2230", borderRadius: 12, padding: 18 }}>
            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>1. Definitions</h2>
            <p><strong>Software / Service:</strong> SHIELD‑AUTHENTICATOR in any form, including web app, Android app, PWA, APIs, and supporting scripts.</p>
            <p><strong>Account Data:</strong> Includes email, password, account names, and encrypted TOTP keys.</p>
            <p><strong>TOTP:</strong> Time-Based One-Time Passwords generated from encrypted secrets using the otplib library. Codes refresh every 30 seconds with a visible countdown.</p>
            <p><strong>Vault Passphrase:</strong> A passphrase chosen by the User and used on the User's device to derive an encryption key for protecting TOTP secrets ("End‑to‑End Encryption" / "E2EE"). The Provider does not receive the Vault Passphrase.</p>
            <p><strong>End‑to‑End Encryption (E2EE):</strong> A design where TOTP secrets are encrypted on the User's device before being stored in Firebase Firestore and can only be decrypted on the User's device after the User provides the Vault Passphrase.</p>
            <p><strong>Vault Master Key:</strong> A randomly generated AES-256 key that encrypts all account secrets. It is itself encrypted ("wrapped") by keys derived from your Vault Passphrase and optionally your recovery answers. The master key never leaves your device in plaintext.</p>
            <p><strong>Recovery Questions:</strong> Optional security questions whose answers are used to derive a recovery key that can unwrap the Vault Master Key, enabling passphrase reset without data loss.</p>
            <p><strong>Offline Mode:</strong> The ability to generate TOTP codes from locally cached encrypted account data without an active internet connection.</p>
            <p><strong>Rooted Device:</strong> A device with escalated privileges (e.g., Android root access) that may weaken built-in security protections.</p>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>2. License Grant</h2>
            <ul>
              <li>Install and use the Software on personal devices.</li>
              <li>Generate and manage TOTP codes for accounts you are authorized to access.</li>
              <li>Use QR scanning (via camera or image upload) to add accounts you control.</li>
              <li>Import and export accounts via encrypted CSV backup files.</li>
              <li>Redistribution of the source code or modified copies (including public forks) is prohibited unless you have explicit written permission.</li>
              <li>You may modify the source code for personal/internal use as permitted by the repository license.</li>
              <li>Exploiting vulnerabilities in the Software or associated services is prohibited.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>3. Account Data & Encryption</h2>
            <ul>
              <li><strong>E2EE:</strong> All TOTP secrets are encrypted locally on your device before being stored in Firebase Firestore.</li>
              <li><strong>Key Derivation:</strong> Vault keys are derived using Argon2id, a memory-hard key derivation function.</li>
              <li><strong>Master Key Architecture:</strong> A random AES-256 master key encrypts all account secrets. The master key is wrapped (encrypted) by keys derived from your Vault Passphrase and optionally your recovery answers. This allows passphrase changes and recovery without re-encrypting every account.</li>
              <li>Decryption happens only on your device after you provide your Vault Passphrase.</li>
              <li>The Provider cannot decrypt your stored TOTP secrets without your Vault Passphrase.</li>
              <li><strong>No Recovery if Forgotten:</strong> If you forget your Vault Passphrase and have not configured recovery questions, your encrypted secrets cannot be recovered by the Provider.</li>
              <li><strong>Vault Recovery:</strong> If you configured recovery questions during vault setup, you can answer them to reset your passphrase and regain access to your encrypted data.</li>
              <li><strong>Vault Passphrase Change:</strong> You may change your vault passphrase at any time in Settings. The current passphrase is required to authorize the change.</li>
              <li><strong>Remember on Device:</strong> You may optionally store an encrypted form of your vault passphrase on your device using AES-GCM with a device-specific key stored in IndexedDB (web) or native secure storage (Android). This is a convenience feature; the passphrase is never stored in plaintext.</li>
              <li>Data is stored in Firebase Firestore until deleted by the User via the Delete Account or individual account deletion features.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>4. Authentication & Validation</h2>
            <ul>
              <li>Login and registration are handled securely through Firebase Authentication.</li>
              <li>Passwords must be at least 8 characters.</li>
              <li>Email verification and password reset flows are available.</li>
              <li>Error messages are user-friendly; raw technical errors are logged client-side only.</li>
              <li>The app uses honeypot fields to prevent automated bot submissions.</li>
              <li>Rate limiting is applied to password reset requests (maximum 3 requests per 15-minute window per device).</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>5. QR Code & Account Management</h2>
            <ul>
              <li>Only <code>otpauth://totp/</code> QR codes are supported. QR codes can be scanned via camera or uploaded as an image file.</li>
              <li>Secrets are encrypted immediately upon scanning or manual entry.</li>
              <li>Invalid QR codes or unsupported formats trigger user-friendly error messages.</li>
              <li>Accounts can be added, edited, deleted, searched, and sorted by name or creation date.</li>
              <li>Provider logos are fetched from third-party CDNs for recognized services (e.g., Google, GitHub). Logo display is optional and can be disabled in Settings.</li>
              <li>Duplicate account names (case-insensitive) are prevented.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>6. Backup & Export</h2>
            <ul>
              <li>Accounts can be exported to CSV format with optional AES-256-GCM encryption using a user-provided passphrase.</li>
              <li>Accounts can be imported from CSV files, with optional decryption using the matching passphrase.</li>
              <li>The Software auto-detects whether an imported CSV is encrypted based on its header.</li>
              <li>Backups are the User's responsibility. The Provider does not store or manage backup files.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>7. Offline Access</h2>
            <ul>
              <li>The Software supports offline TOTP code generation after at least one successful online sync on the same device populates the local encrypted cache.</li>
              <li>A device that has never completed a successful cloud sync will not have cached accounts available offline.</li>
              <li>An offline indicator is shown when no internet connection is detected. After a successful sync, the banner reads "offline, but ready" to indicate cached data is available.</li>
              <li>Vault unlock requires network connectivity on first-time setup; subsequent unlocks on the same device may work offline if vault metadata is cached.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>8. Device Security</h2>
            <ul>
              <li><strong>Rooted Device Detection:</strong> The Software may detect if the device has root access and display a warning. The app continues to function, but device-level protections may be weaker. Use on rooted devices is at the User's own risk.</li>
              <li><strong>Screen Privacy (Android):</strong> An optional setting prevents app content from being viewed in the Android recent apps screen or via screen recording.</li>
              <li><strong>Code Masking:</strong> TOTP codes can be hidden (masked) for privacy in public spaces.</li>
              <li><strong>Secure Storage:</strong> On Android, native secure storage (KeyStore-backed) is used when available. On web, AES-GCM encryption with a device-specific key stored in IndexedDB is used.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>9. User Responsibilities</h2>
            <ul>
              <li>Keep your credentials, passwords, vault passphrase, and devices secure.</li>
              <li>Only add accounts you are authorized to access.</li>
              <li>Do not attempt to bypass encryption, security measures, or Firestore security rules.</li>
              <li>Maintain your own backups (CSV exports) of account data.</li>
              <li>Report vulnerabilities via shield@shieldintelligence.in.</li>
              <li>Understand that the Provider cannot recover encrypted secrets if the vault passphrase and recovery answers are lost.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>10. Prohibited Uses</h2>
            <ul>
              <li>Unauthorized access, attacks, reverse engineering, or credential theft.</li>
              <li>Distribution of modified copies without written permission.</li>
              <li>Interfering with Software operations or Firebase backend services.</li>
              <li>Using the Software for any illegal purpose or in violation of applicable laws.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>11. Pricing</h2>
            <p>The Software is currently provided free of charge.</p>
            <p>The Provider reserves the right to introduce optional paid features, donations, sponsorships, premium services, or alternative funding mechanisms in the future.</p>
            <p>Any such changes will be communicated in advance and will not affect rights already granted under these Terms.</p>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>12. Warranty & Liability</h2>
            <ul>
              <li>Software is provided "as-is" without warranty of any kind, express or implied.</li>
              <li>While the Software is designed with security and privacy in mind, the Provider does not guarantee that the Software will be free from vulnerabilities, interruptions, unauthorized access, data loss, or other security incidents.</li>
              <li>To the maximum extent permitted by applicable law, the Provider's total liability arising from or relating to the Software shall not exceed the amount paid by the User for the Software during the preceding twelve (12) months.</li>
              <li>If the Software was provided free of charge, liability shall be limited to the maximum extent permitted by applicable law.</li>
              <li>No liability for indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, account lockouts, or unauthorized access resulting from the User's failure to secure their credentials.</li>
              <li>The Provider is not responsible for damages resulting from rooted or compromised devices.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>13. Indemnification</h2>
            <ul>
              <li>You agree to hold harmless SHIELD Intelligence, its affiliates, officers, and employees from claims, damages, liabilities, costs, and expenses (including legal fees) arising from your misuse of the Software, violation of these Terms, or violation of any rights of a third party.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>14. Account Deletion</h2>
            <ul>
              <li>Users may permanently delete their account and all associated data through the Settings page.</li>
              <li>Account deletion removes Firebase Authentication records, encrypted account data, vault metadata, and locally stored application data where technically possible.</li>
              <li>This action is irreversible and cannot be undone.</li>
              <li>The Provider cannot recover deleted data after account deletion has been completed.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>15. Termination</h2>
            <ul>
              <li>Provider may suspend or terminate your access to the Software for violations of these Terms. Upon termination, all rights granted to you under these Terms end immediately.</li>
              <li>You may stop using the Software at any time. Data deletion must be initiated by you via the Delete Account feature.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>16. Third-Party Services</h2>
            <ul>
              <li><strong>Firebase (Google):</strong> Used for authentication, Firestore database, and hosting. Data processing is governed by Google's Privacy Policy and the Firebase Terms of Service.</li>
              <li><strong>Provider Logos:</strong> When enabled, logo images are fetched from third-party CDNs (e.g., Google Favicons, GitHub). No sensitive data is transmitted in these requests.</li>
              <li>The Provider is not responsible for the data practices of third-party services.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>17. Governing Law & Disputes</h2>
            <ul>
              <li><strong>Jurisdiction:</strong> India</li>
              <li><strong>Disputes:</strong> Any dispute arising from these Terms shall first be attempted to be resolved informally. If resolution is not possible, the dispute shall be governed by the laws of India and resolved through a competent court or other lawful dispute resolution mechanism.</li>
              <li><strong>Compliance:</strong> Users must follow Indian local laws regarding software and encryption.</li>
              <li>For international users, you also agree to comply with all applicable export control and data protection laws.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>18. Miscellaneous</h2>
            <ul>
              <li>This is the complete agreement between User and Provider, superseding any prior agreements.</li>
              <li>Invalid or unenforceable clauses do not affect enforceability of the remaining Terms.</li>
              <li>The license cannot be transferred without written consent.</li>
              <li>Copyright © 2026 SHIELD Intelligence. All rights reserved.</li>
              <li>These Terms may be updated from time to time. Continued use of the Software after changes constitutes acceptance of the updated Terms.</li>
            </ul>
          </div>
      </main>
      <Footer />
    </div>
  );
}

export default TermsPage;

// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function TermsPage() {
  return (
    <div className="terms-page">
      <Header />
      <main className="container" style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
          <h1 style={{ color: "#bfa24f", fontSize: "1.6rem", margin: 0, padding: "18px 0" }}>
            SHIELD‑AUTHENTICATOR — Terms of Use & Privacy Addendum
          </h1>
          <p className="meta" style={{ color: "#a6a6a6", fontSize: ".95rem", marginBottom: 16 }}>
            Effective Date: 9 January 2026<br />
            Product: SHIELD‑AUTHENTICATOR (the “Software” or “Service”)<br />
            Provider: SHIELD Intelligence (the “Provider”, “we”, “us”)<br />
            Contact: <a href="mailto:shield@shieldintelligence.in">shield@shieldintelligence.in</a>
          </p>
          <p>
            By installing, accessing, or using SHIELD‑AUTHENTICATOR, you (“User”, “You”) accept these Terms. If you do not agree, do not use the Software. These Terms constitute a binding legal agreement.
          </p>
          <div className="card" style={{ background: "#13151a", border: "1px solid #1f2230", borderRadius: 12, padding: 18 }}>
            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>1. Definitions</h2>
            <p><strong>Software / Service:</strong> SHIELD‑AUTHENTICATOR in any form, including web app, Android app, PWA, APIs, and supporting scripts.</p>
            <p><strong>Account Data:</strong> Includes email, password, account names, and encrypted TOTP keys.</p>
            <p><strong>TOTP:</strong> Time-Based One-Time Passwords generated from encrypted secrets.</p>
            <p><strong>Vault Passphrase:</strong> A passphrase chosen by the User and used on the User’s device to derive an encryption key for protecting TOTP secrets (“End‑to‑End Encryption” / “E2EE”). The Provider does not receive the Vault Passphrase.</p>
            <p><strong>End‑to‑End Encryption (E2EE):</strong> A design where TOTP secrets are encrypted on the User’s device before being stored and can only be decrypted on the User’s device after the User provides the Vault Passphrase.</p>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>2. License Grant</h2>
            <ul>
              <li>Install and use the Software on personal devices.</li>
              <li>Generate and manage TOTP codes for accounts you are authorized to access.</li>
              <li>Use QR scanning to add accounts you control.</li>
              <li>Redistribution of the source code or modified copies (including public forks) is prohibited unless you have explicit written permission.</li>
              <li>You may modify the source code for personal/internal use as permitted by the repository license.</li>
              <li>Exploiting vulnerabilities in the Software or associated services is prohibited.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>3. Account Data & Encryption</h2>
            <ul>
              <li><strong>E2EE:</strong> All TOTP secrets are encrypted locally on your device before being stored.</li>
              <li>Decryption happens only on your device after you provide your Vault Passphrase.</li>
              <li>The Provider cannot decrypt your stored TOTP secrets without your Vault Passphrase.</li>
              <li><strong>No Recovery if Forgotten:</strong> If you forget your Vault Passphrase, your encrypted secrets cannot be recovered by the Provider.</li>
              <li>Data is stored until deleted by the User.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>4. Authentication & Validation</h2>
            <ul>
              <li>Login is handled securely through Firebase Authentication.</li>
              <li>Passwords must be at least 8 characters.</li>
              <li>Error messages are user-friendly.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>5. QR Code Integration</h2>
            <ul>
              <li>Only otpauth://totp/ QR codes are supported.</li>
              <li>Secrets are encrypted immediately upon scanning.</li>
              <li>Invalid QR codes trigger an error message.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>6. User Responsibilities</h2>
            <ul>
              <li>Keep your credentials and devices secure.</li>
              <li>Only add accounts you control.</li>
              <li>Do not attempt to bypass encryption or security measures.</li>
              <li>Report vulnerabilities via shield@shieldintelligence.in.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>7. Prohibited Uses</h2>
            <ul>
              <li>Unauthorized access, attacks, or credential theft.</li>
              <li>Distribution of modified copies.</li>
              <li>Interfering with Software operations.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>8. Freemium & Fees</h2>
            <ul>
              <li>The Software is currently free. Provider may introduce paid premium features in the future (“Freemium”). Use of free features will remain without charge unless otherwise notified.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>9. Warranty & Liability</h2>
            <ul>
              <li>Software is provided “as-is” without warranty.</li>
              <li>Direct liability is limited to ₹8,000 or equivalent if paid; zero if free.</li>
              <li>No liability for indirect or consequential damages.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>10. Indemnification</h2>
            <ul>
              <li>You agree to hold harmless SHIELD Intelligence from claims arising from misuse or violation of these Terms.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>11. Termination</h2>
            <ul>
              <li>Provider may suspend or terminate your account for violations. Upon termination, rights to the Software end immediately.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>12. Governing Law & Disputes</h2>
            <ul>
              <li>Jurisdiction: India</li>
              <li>Disputes: Resolved under Indian law via arbitration or courts as required.</li>
              <li>Compliance: Users must follow Indian local laws regarding software and encryption.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>13. Miscellaneous</h2>
            <ul>
              <li>This is the complete agreement between User and Provider.</li>
              <li>Invalid clauses do not affect enforceability of the remaining Terms.</li>
              <li>License cannot be transferred without consent.</li>
              <li>Copyright © 2026 SHIELD Intelligence. All rights reserved.</li>
            </ul>
          </div>
      </main>
      <Footer />
    </div>
  );
}

export default TermsPage;

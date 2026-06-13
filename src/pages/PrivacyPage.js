// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function PrivacyPage() {
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
            SHIELD‑AUTHENTICATOR — Privacy Policy
          </h1>
          <p className="meta" style={{ color: "#a6a6a6", fontSize: ".95rem", marginBottom: 16 }}>
            Effective Date: 13 June 2026<br />
            Product: SHIELD‑AUTHENTICATOR (the "Software" or "Service")<br />
            Provider: SHIELD Intelligence (the "Provider", "we", "us")<br />
            Contact: <a href="mailto:shield@shieldintelligence.in">shield@shieldintelligence.in</a>
          </p>
          <p>
            This Privacy Policy explains how SHIELD Intelligence handles your data when you use SHIELD‑AUTHENTICATOR. We believe in minimal data collection, maximum transparency, and zero-compromise security.
          </p>
          <div className="card" style={{ background: "#13151a", border: "1px solid #1f2230", borderRadius: 12, padding: 18 }}>
            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>1. Data We Collect</h2>
            <p>We collect only the minimum data necessary to provide the Service:</p>
            <ul>
              <li><strong>Email Address:</strong> Used for Firebase Authentication login and account identification.</li>
              <li><strong>Encrypted TOTP Secrets:</strong> Your 2FA account secrets, encrypted on your device before being stored in Firebase Firestore. The Provider cannot read these secrets.</li>
              <li><strong>Vault Metadata:</strong> Includes encrypted key material, cryptographic salts, KDF parameters (Argon2id configuration), and recovery question IDs (not the answers).</li>
              <li><strong>Account Names:</strong> The names you assign to your 2FA accounts (e.g., "Google", "GitHub"). These are stored alongside encrypted secrets for display purposes.</li>
              <li><strong>User ID (UID):</strong> Firebase-assigned unique identifier for your account, stored with each account document for ownership verification.</li>
              <li><strong>Timestamps:</strong> Account creation and update timestamps for sorting and display.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>2. Data We Do NOT Collect</h2>
            <p>We deliberately avoid collecting the following:</p>
            <ul>
              <li><strong>Vault Passphrase:</strong> Never transmitted or stored server-side. Key derivation happens entirely on your device.</li>
              <li><strong>Recovery Answers:</strong> Never transmitted or stored. Used only locally to derive a recovery key.</li>
              <li><strong>TOTP Codes:</strong> Generated locally and never sent to any server.</li>
              <li><strong>Device Fingerprints:</strong> No device identifiers beyond what Firebase SDK collects for normal operation.</li>
              <li><strong>Location Data:</strong> Not collected or requested.</li>
              <li><strong>Contact Information:</strong> No contacts, address book, or social graph data.</li>
              <li><strong>Biometric Data:</strong> Not collected, even if device biometric unlock is used.</li>
              <li><strong>Usage Analytics:</strong> No third-party analytics, tracking pixels, or telemetry.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>3. Local-Only Data</h2>
            <p>The following data is stored exclusively on your device and never transmitted to any server:</p>
            <ul>
              <li><strong>Remembered Vault Passphrase:</strong> When you opt to "Remember on this device", the passphrase is encrypted with AES-256-GCM using a device-specific key and stored in IndexedDB (web) or native secure storage (Android KeyStore).</li>
              <li><strong>Vault Metadata Cache:</strong> A local cache of vault configuration to enable offline unlock.</li>
              <li><strong>Offline-Ready Status:</strong> A flag indicating whether the device has synced at least once and has cached data available offline.</li>
              <li><strong>App Preferences:</strong> Code masking toggle, sort order, provider logo display setting, screen privacy toggle (Android), and device authentication entry route preference are stored in localStorage.</li>
              <li><strong>Terms Acceptance:</strong> A record that you have accepted the Terms of Use, stored per email address.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>4. How Your Data Is Protected</h2>
            <ul>
              <li><strong>End-to-End Encryption:</strong> All TOTP secrets are encrypted on your device before transmission. The Provider stores only ciphertext and cannot decrypt it.</li>
              <li><strong>Zero-Knowledge Architecture:</strong> The vault passphrase never leaves your device. Without it, neither the Provider nor anyone else can access your encrypted secrets.</li>
              <li><strong>Argon2id Key Derivation:</strong> Industry-standard memory-hard KDF protects against brute-force attacks on your vault passphrase.</li>
              <li><strong>AES-256-GCM Encryption:</strong> Industry-standard symmetric encryption for all secret data at rest.</li>
              <li><strong>Firebase Security Rules:</strong> Firestore access is restricted by security rules that allow only the authenticated user to read/write their own data.</li>
              <li><strong>Token Refresh:</strong> Firebase authentication tokens are regularly refreshed. Permission-denied errors trigger automatic token refresh attempts.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>5. Third-Party Services</h2>
            <p>The Software integrates with the following third-party services:</p>
            <ul>
              <li><strong>Firebase (Google):</strong> Provides authentication (Firebase Auth), database (Firestore), and hosting. Data processing is governed by Google's Privacy Policy and the Firebase Terms of Service. Google may process data on their servers in accordance with their security and compliance practices.</li>
              <li><strong>Provider Logo CDNs:</strong> When the provider logo feature is enabled, logo images are fetched from third-party CDNs including Google Favicons and GitHub. These requests transmit only the service name (e.g., "google.com") and no sensitive data. This feature can be disabled in Settings.</li>
              <li><strong>QR Scanner Library (qr-scanner):</strong> Operates entirely client-side. No image data is transmitted externally.</li>
              <li><strong>Capacitor (Android):</strong> The Android native wrapper uses platform APIs for secure storage and back button handling. No data is transmitted to external servers.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>6. Data Storage & Retention</h2>
            <ul>
              <li><strong>Firebase Firestore:</strong> Account data and vault metadata are stored in Firebase Firestore until deleted by you. Data is retained as long as your account exists.</li>
              <li><strong>Local Storage:</strong> Browser localStorage and IndexedDB data persists until you clear it via browser settings or uninstall the app (Android).</li>
              <li><strong>Account Deletion:</strong> When you delete your account via Settings, all Firestore documents (accounts, vault metadata) and local storage entries are removed. This action is irreversible.</li>
              <li><strong>Cache:</strong> The local vault metadata cache is automatically cleared when you log out.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>7. Data Sharing & Disclosure</h2>
            <ul>
              <li><strong>No Third-Party Sharing:</strong> We do not sell, rent, or share your personal data with third parties for any purpose.</li>
              <li><strong>No Analytics:</strong> We do not use analytics SDKs, crash reporting tools, or telemetry services.</li>
              <li><strong>Legal Compliance:</strong> We may disclose data if required by law, legal process, or governmental request, but will make reasonable efforts to notify you where permitted.</li>
              <li><strong>Encrypted Nature:</strong> Even if data were disclosed, encrypted TOTP secrets remain unreadable without your vault passphrase, which we do not possess.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>8. User Rights & Choices</h2>
            <ul>
              <li><strong>Access:</strong> You can view all your account names and generate TOTP codes within the app at any time.</li>
              <li><strong>Export:</strong> You can export your accounts to an encrypted CSV file at any time via Settings.</li>
              <li><strong>Correction:</strong> You can edit account names and secrets at any time.</li>
              <li><strong>Deletion:</strong> You can delete individual accounts or your entire account with all associated data via Settings.</li>
              <li><strong>Opt-Out:</strong> You can disable optional features (provider logos, code masking, screen privacy, remember on device) at any time in Settings.</li>
              <li><strong>Local Data Clearance:</strong> Clearing browser data or uninstalling the app removes all locally stored preferences and cached data.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>9. Security Best Practices</h2>
            <p>To maximize your privacy and security while using the Software, we recommend:</p>
            <ul>
              <li>Use a strong, unique vault passphrase containing both letters and numbers. Do not reuse passphrases from other services.</li>
              <li>Set up recovery questions during vault setup. Store answers in a secure location, such as a password manager.</li>
              <li>Export and backup your accounts regularly using encrypted CSV exports.</li>
              <li>Enable code masking when using the app in public spaces.</li>
              <li>On Android, enable the "Prevent Screen Viewing" setting to protect against screen recording and recent apps preview.</li>
              <li>Do not use the "Remember on Device" feature on shared or untrusted devices.</li>
              <li>Log out when not using the app, especially on shared devices.</li>
              <li>Keep your device operating system and browser updated.</li>
            </ul>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be reflected in the "Effective Date" at the top of this page.</p>
            <p>If changes materially affect how your information is handled, we will provide notice through the Software or other reasonable means. Where required by applicable law, we will obtain consent before such changes take effect.</p>
            <p>Continued use of the Software after such changes become effective constitutes acceptance of the updated Privacy Policy.</p>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>11. Children's Privacy</h2>
            <p>The Software is not specifically directed toward children under the age of 13.</p>
            <p>If we become aware that personal information has been collected from a child under 13 in a manner that requires parental consent under applicable law, we will take reasonable steps to remove such information.</p>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>12. Security Incidents</h2>
            <p>While we employ reasonable security measures, no system can guarantee absolute security.</p>
            <p>In the event of a security incident affecting data under our control, we will take reasonable steps to investigate, mitigate the impact, and provide notice where appropriate.</p>

            <h2 style={{ color: "#f0f0f0", borderLeft: "4px solid #bfa24f", paddingLeft: 10, fontSize: "1.2rem", marginTop: "2rem" }}>13. Contact</h2>
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:</p>
            <ul>
              <li>Email: <a href="mailto:shield@shieldintelligence.in" style={{ color: "#bfa24f" }}>shield@shieldintelligence.in</a></li>
              <li>Provider: SHIELD Intelligence</li>
              <li>Jurisdiction: India</li>
            </ul>
            <p style={{ marginTop: 16 }}>We will respond to privacy inquiries within a reasonable timeframe.</p>
          </div>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPage;

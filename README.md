# SHIELD-Authenticator

<!--
Copyright © 2026 SHIELD Intelligence. All rights reserved.
-->

A secure, sleek, and futuristic 2FA authenticator built with **React** and **Firebase**, designed for personal and enterprise use. Protect your accounts with SHIELD-grade security and real-time code generation.

**Current Version:** `2.5.0`

---

## Features

### 🔐 Security

- **End-to-End Encrypted Vault**: Military-grade encryption for all your 2FA secrets
- **Argon2id Key Derivation**: Industry-standard password hardening for vault passphrases
- **Vault Passphrase Protection**: Secure your accounts with a custom passphrase (min 8 characters)
- **Recovery Questions**: Set up security questions to recover access if you forget your passphrase
- **Vault Recovery**: Forgot your passphrase? Answer your recovery questions to reset it and regain access
- **Change Passphrase**: Update your vault passphrase anytime in Settings
- **Encrypted CSV Backups**: Export your accounts with passphrase protection

### 🎯 Core Features

- Add, edit, and delete multiple 2FA accounts
- Generate TOTP codes in real-time with countdown timers
- Progress bars showing time remaining for each code
- Copy codes to clipboard with a single click
- QR code scanning for easy account setup
- Search and filter your accounts
- Sort accounts by name or creation date

### 🎨 User Experience

- Modern, responsive, SHIELD-themed UI with gold accents
- Dark mode optimized interface
- Hide/Show codes for privacy
- Back buttons in all dialogs for easy navigation
- Professional SVG icons throughout
- Smooth animations and transitions
- Firebase authentication for secure login and registration
- Online/offline status banner with explicit offline-ready messaging

### 💾 Backup & Restore

- Export accounts to encrypted CSV files
- Import accounts from CSV with passphrase decryption
- Optional encryption toggle for exports
- Secure device storage for "Remember me" feature

### 📶 Offline Compatibility

- **Offline indicator**: The app shows an offline banner when there is no internet.
- **Offline ready indicator**: After at least one successful sync, the banner changes to **"offline, but ready"**.
- **One-time sync requirement**: A device must complete at least one successful cloud sync while online before full offline access is available.
- **Fresh install behavior**: On a brand-new install with no completed sync, offline mode can open but may not have cached accounts yet.
- **Vault flow offline**: Existing users are kept in unlock flow; setup is only for users without a known vault on that device.

---

## Getting Started

These instructions will help you set up and run **SHIELD-Authenticator** locally for development or production.

### Prerequisites

- Node.js v18+ and npm installed
- Firebase project set up for authentication
- Clone this repository:

```bash
git clone https://github.com/SHIELD-INTELLIGENCE/shield-authenticator
cd shield-authenticator
npm install
```

### Available Scripts

In the project directory, you can run:

```bash
npm start
```

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser. Changes reload automatically.

```bash
npm run build
```

Builds the app for production to the `build` folder. Optimized, minified, and ready for deployment.

```bash
npm test
```

Launches the test runner in interactive watch mode.

---

## Deployment

The `build` folder contains a production-ready version of the app. You can deploy it to any static hosting service (Firebase Hosting, Vercel, Netlify, GitHub Pages, etc.):

```bash
npm run build
```

Then follow your host’s instructions to serve the `build` folder.

---

## Environment Variables and Secrets

This app uses Create React App, so only variables prefixed with `REACT_APP_` are embedded into the client bundle. These values are public at runtime (they ship in the JS), so do not put true secrets on the client.

1) Copy `.env.example` to `.env` and fill values for local development:

```bash
cp .env.example .env
# edit .env and set values
```

1) Netlify deployment:

- In Netlify site settings, go to Build & deploy → Environment → Environment variables
- Add the following keys with your values:
  - `REACT_APP_FIREBASE_API_KEY`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - `REACT_APP_FIREBASE_PROJECT_ID`
  - `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - `REACT_APP_FIREBASE_APP_ID`
- Trigger a new deploy (Netlify will inject env vars at build time)

Security note: This app uses a user-provided **vault passphrase** for client-side end-to-end encryption (E2EE).

- The vault key is derived locally from the passphrase using **Argon2id** (with PBKDF2 compatibility for older vault metadata).
- Firestore stores only encrypted secrets.
- If the vault passphrase is forgotten, encrypted secrets cannot be recovered.

`.env` files are git-ignored. Commit only `.env.example`.

---

## Folder Structure

```text
shield-authenticator/
├── android/                  # Android build configuration
├── build/                    # Production build output
├── public/
│   ├── index.html           # Main HTML file
│   ├── manifest.json        # PWA manifest
│   └── terms.html           # Terms of Use & Privacy
├── src/
│   ├── components/          # React components
│   │   ├── AccountItem.js
│   │   ├── AccountList.js
│   │   ├── AddAccountForm.js
│   │   ├── ConfirmDialog.js
│   │   ├── LoginForm.js
│   │   ├── SettingsPage.js
│   │   ├── SettingsSidebar.js
│   │   └── VaultPassphraseDialog.js
│   ├── App.js               # Main application component
│   ├── crypto.js            # TOTP crypto utilities
│   ├── csvUtils.js          # CSV export/import functions
│   ├── firebase.js          # Firebase configuration
│   ├── index.js             # Application entry point
│   ├── networkUtils.js      # Network error handling
│   ├── secureStorage.js     # Secure local storage
│   ├── services.js          # Firestore services
│   ├── styles.css           # Global styles
│   ├── vault.js             # Vault encryption logic
│   └── vaultCrypto.js       # Vault cryptography
├── CHANGELOG.md             # Version history
├── CSV_EXPORT_IMPORT_GUIDE.md
├── README.md
├── capacitor.config.ts      # Capacitor configuration
├── craco.config.js          # Create React App override
└── package.json
```

---

## Contributing

We welcome feedback and bug reports.

Because this project is **source-available** and **does not permit public redistribution**, we do not accept contributions via public forks.

- Please open an Issue describing the change or bug.
- For security-sensitive reports, contact SHIELD Intelligence directly.

---

## License

This project is licensed under the **SHIELD Source-Available License (No Redistribution) v1.0**.

See [LICENSE](LICENSE).

---

## Learn More

- React: [https://reactjs.org/](https://reactjs.org/)  
- Firebase: [https://firebase.google.com/](https://firebase.google.com/)  
- React Toastify: [https://fkhadra.github.io/react-toastify/](https://fkhadra.github.io/react-toastify/)

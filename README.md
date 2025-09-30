# SHIELD-Authenticator

<!--
Copyright © 2025 SHIELD Intelligence. All rights reserved.
-->

A secure, sleek, and futuristic 2FA authenticator built with **React** and **Firebase**, designed for personal and enterprise use. Protect your accounts with SHIELD-grade security and real-time code generation.

---

## Features

- Add, edit, and delete multiple accounts.
- Generate TOTP codes in real-time.
- Countdown timers and progress bars for each account.
- Copy codes to clipboard with a single click.
- Modern, responsive, SHIELD-themed UI.
- Firebase authentication for secure login and registration.

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

```
cp .env.example .env
# edit .env and set values
```

2) Netlify deployment:

- In Netlify site settings, go to Build & deploy → Environment → Environment variables
- Add the following keys with your values:
    - `REACT_APP_MASTER_KEY`
    - `REACT_APP_FIREBASE_API_KEY`
    - `REACT_APP_FIREBASE_AUTH_DOMAIN`
    - `REACT_APP_FIREBASE_PROJECT_ID`
    - `REACT_APP_FIREBASE_STORAGE_BUCKET`
    - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
    - `REACT_APP_FIREBASE_APP_ID`
- Trigger a new deploy (Netlify will inject env vars at build time)

Security note: A client-side "master key" is not a true secret; consider:

- deriving a key from a user-entered passphrase (not stored), or
- moving encryption to a server/Netlify Function where secrets never leave the server.

`.env` files are git-ignored. Commit only `.env.example`.

---

## Folder Structure

```
shield-authenticator/
├── craco.config.js
├── package.json
├── package-lock.json
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   └── manifest.json
├── README.md
└── src/
    ├── App.js
    ├── crypto.js
    ├── firebase.js
    ├── index.js
    ├── services.js
    └── styles.css
```

---

## Contributing

1. Fork the repository.  
2. Create your feature branch (`git checkout -b feature-name`).  
3. Commit your changes (`git commit -m "Feature: ..."`)  
4. Push to the branch (`git push origin feature-name`)  
5. Open a Pull Request.

---

## License

MIT License © 2025 **SHIELD-Authenticator Team**

---

## Learn More

- React: [https://reactjs.org/](https://reactjs.org/)  
- Firebase: [https://firebase.google.com/](https://firebase.google.com/)  
- React Toastify: [https://fkhadra.github.io/react-toastify/](https://fkhadra.github.io/react-toastify/)

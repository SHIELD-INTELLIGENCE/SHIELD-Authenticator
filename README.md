# SHIELD-Authenticator

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
- Clone this repository

```bash
git clone <your-repo-url>
cd shield-authenticator
npm install

Available Scripts

In the project directory, you can run:

npm start

Runs the app in development mode.
Open http://localhost:3000 to view it in your browser.
Changes reload automatically.

npm run build

Builds the app for production to the build folder.
Optimized, minified, and ready for deployment.

npm test

Launches the test runner in interactive watch mode.

Deployment

The build folder contains a production-ready version of the app. You can deploy it to any static hosting service (Firebase Hosting, Vercel, Netlify, GitHub Pages, etc.):

npm run build


Then follow your host’s instructions to serve the build folder.

Folder Structure
shield-authenticator/
├── public/             # Static files and manifest
├── src/                # React components and services
│   ├── App.js
│   ├── firebase.js
│   ├── services.js
│   ├── styles.css
│   └── index.js
├── package.json
├── package-lock.json
└── README.md

Contributing

Fork the repository.

Create your feature branch (git checkout -b feature-name).

Commit your changes (git commit -m "Feature: ...").

Push to the branch (git push origin feature-name).

Open a Pull Request.

License

MIT License © 2025 SHIELD-Authenticator Team

Learn More

React: https://reactjs.org/

Firebase: https://firebase.google.com/

React Toastify: https://fkhadra.github.io/react-toastify/

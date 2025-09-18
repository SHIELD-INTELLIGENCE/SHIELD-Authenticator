// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyDng7OPzqOuG9cupc1AUDuIUYg06jhSHSs",
  authDomain: "shield-auth-62951.firebaseapp.com",
  projectId: "shield-auth-62951",
  storageBucket: "shield-auth-62951.firebasestorage.app",
  messagingSenderId: "534544792630",
  appId: "1:534544792630:web:d7774f9c70e2e928d6ec97"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
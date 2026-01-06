// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  updateDoc // 👈 added
} from "firebase/firestore";
import { authenticator } from "otplib";
import { encryptSecret, decryptSecretWithKeyInfo } from "./crypto";
import { auth, db } from "./firebase";

// ---------------- Auth ----------------
export async function register(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export function logout() {
  return signOut(auth);
}

// ---------------- Accounts ----------------
export async function addAccount(userId, name, secret) {
  await addDoc(collection(db, "accounts"), {
    userId,
    name,
    secret: encryptSecret(secret), // store encrypted
    createdAt: serverTimestamp()
  });
}

export async function deleteAccount(accountId) {
  await deleteDoc(doc(db, "accounts", accountId));
}

export async function getAccounts(userId) {
  const q = query(collection(db, "accounts"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const results = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const { plaintext, keyUsed } = decryptSecretWithKeyInfo(data.secret);

    // Lazy migrate if decrypted with legacy key
    if (keyUsed === "legacy" && plaintext) {
      try {
        const reenc = encryptSecret(plaintext);
        await updateDoc(doc(db, "accounts", docSnap.id), { secret: reenc, migratedAt: serverTimestamp() });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to migrate secret to PRIMARY key for doc", docSnap.id, e);
      }
    }

    results.push({ id: docSnap.id, ...data, secret: plaintext });
  }
  return results;
}

export async function updateAccount(accountId, { name, secret }) {
  const accountRef = doc(db, "accounts", accountId);
  const updates = {};
  if (name) updates.name = name;
  if (secret) updates.secret = encryptSecret(secret);
  updates.updatedAt = serverTimestamp();
  await updateDoc(accountRef, updates);
}

// ---------------- OTP ----------------
export function getCode(secret) {
  return authenticator.generate(secret);
}

export function getCountdown() {
  return 30 - Math.floor(Date.now() / 1000) % 30;
}

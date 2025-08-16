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
import { encryptSecret, decryptSecret } from "./crypto";
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
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    secret: decryptSecret(docSnap.data().secret)
  }));
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

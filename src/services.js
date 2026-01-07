// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  Timestamp,
  setDoc,
  updateDoc // 👈 added
} from "firebase/firestore";
import { authenticator } from "otplib";
import { decryptWithVaultKey, encryptWithVaultKey } from "./vaultCrypto";
import { auth, db } from "./firebase";
import { getVaultAadForUser, getVaultKeyForUser, lockVault } from "./vault";

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
  // Ensure vault key isn't kept in memory across sessions
  lockVault();
  return signOut(auth);
}

// ---------------- Accounts ----------------
function requireUserEmail(user) {
  const email = user?.email;
  if (!email) throw new Error("Missing authenticated user email");
  return String(email).trim();
}

function accountDocIdFromName(name) {
  const raw = String(name || "").trim();
  if (!raw) throw new Error("Missing account name");
  // Firestore document IDs cannot contain '/'
  const id = raw.replaceAll("/", "_");
  // Reserve internal document IDs
  if (id === "__vault") throw new Error("This account name is reserved. Choose a different name.");
  return id;
}

function userAccountsCollection(user) {
  const emailId = requireUserEmail(user);
  return collection(db, "user", emailId, "accounts");
}

function userAccountDocRef(user, accountId) {
  const emailId = requireUserEmail(user);
  return doc(db, "user", emailId, "accounts", accountId);
}

export async function addAccount(user, name, secret) {
  const accountId = accountDocIdFromName(name);
  const userId = user?.uid || "";

  const vaultKey = getVaultKeyForUser(user);
  const aad = getVaultAadForUser(user);
  const encryptedSecret = await encryptWithVaultKey({ plaintext: secret, vaultKey, aad });

  await setDoc(doc(userAccountsCollection(user), accountId), {
    userId,
    name,
    secret: encryptedSecret,
    createdAt: Timestamp.now(),
  });
}

export async function deleteAccount(user, accountId) {
  if (accountId === "__vault") throw new Error("Invalid account id");
  await deleteDoc(userAccountDocRef(user, accountId));
}

export async function getAccounts(user) {
  const snapshot = await getDocs(userAccountsCollection(user));
  const results = [];

  const vaultKey = getVaultKeyForUser(user);
  const aad = getVaultAadForUser(user);

  for (const docSnap of snapshot.docs) {
    if (docSnap.id === "__vault") continue;
    const data = docSnap.data();

    let plaintext = "";
    try {
      plaintext = await decryptWithVaultKey({ ciphertext: data.secret, vaultKey, aad });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to decrypt account secret for doc", docSnap.id, e);
      plaintext = "";
    }

    results.push({ id: docSnap.id, ...data, secret: plaintext });
  }
  return results;
}

export async function updateAccount(user, accountId, { name, secret }) {
  if (accountId === "__vault") throw new Error("Invalid account id");
  const accountRef = userAccountDocRef(user, accountId);
  const updates = {};

  const hasNewName = typeof name === "string" && name.trim().length > 0;
  const newAccountId = hasNewName ? accountDocIdFromName(name) : accountId;

  // If name changes, also move the document so the path stays:
  // user/{email}/accounts/{Accountname:username}
  if (hasNewName && newAccountId !== accountId) {
    const snap = await getDoc(accountRef);
    if (!snap.exists()) throw new Error("Account not found");

    const existing = snap.data();
    const merged = {
      ...existing,
      name,
      updatedAt: Timestamp.now(),
    };
    if (secret) {
      const vaultKey = getVaultKeyForUser(user);
      const aad = getVaultAadForUser(user);
      merged.secret = await encryptWithVaultKey({ plaintext: secret, vaultKey, aad });
    }

    await setDoc(userAccountDocRef(user, newAccountId), merged);
    await deleteDoc(accountRef);
    return newAccountId;
  }

  if (hasNewName) updates.name = name;
  if (secret) {
    const vaultKey = getVaultKeyForUser(user);
    const aad = getVaultAadForUser(user);
    updates.secret = await encryptWithVaultKey({ plaintext: secret, vaultKey, aad });
  }
  updates.updatedAt = Timestamp.now();
  await updateDoc(accountRef, updates);
  return accountId;
}

// ---------------- OTP ----------------
export function getCode(secret) {
  return authenticator.generate(secret);
}

export function getCountdown() {
  return 30 - Math.floor(Date.now() / 1000) % 30;
}

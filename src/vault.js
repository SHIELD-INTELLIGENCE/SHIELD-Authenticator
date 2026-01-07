// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import {
  Timestamp,
  collection,
  doc,
  documentId,
  getDocs,
  query,
  setDoc,
  writeBatch,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  deriveVaultKey,
  deriveRecoveryKey,
  generateVaultSaltBytes,
  generateVaultMasterKeyBytes,
  importVaultMasterKey,
  vaultSaltToString,
  encryptWithVaultKey,
  decryptWithVaultKey,
  bytesToB64,
  b64ToBytes,
} from "./vaultCrypto";

function requireUserEmail(user) {
  const email = user?.email;
  if (!email) throw new Error("Missing authenticated user email");
  return String(email).trim();
}

function userVaultDocRef(user) {
  const emailId = requireUserEmail(user);
  // Store vault metadata under the same collection path as accounts so
  // existing Firestore rules for accounts usually apply.
  return doc(db, "user", emailId, "accounts", "__vault");
}

function serializeVaultMeta(vault) {
  // Keep as a string to comply with rules (secret is string)
  if (vault?.v === 2) {
    const json = JSON.stringify(vault);
    // Format: shield-vaultmeta:v2:<jsonB64>
    return `shield-vaultmeta:v2:${btoa(unescape(encodeURIComponent(json)))}`;
  }

  // Format: shield-vaultmeta:v1:pbkdf2-sha256:<iterations>:<saltB64>
  const kdf = vault?.kdf || "pbkdf2-sha256";
  const iters = Number(vault?.iterations) || 310000;
  const salt = String(vault?.salt || "");
  return `shield-vaultmeta:v1:${kdf}:${iters}:${salt}`;
}

function parseVaultMeta(secretStr) {
  if (typeof secretStr !== "string") return null;
  if (secretStr.startsWith("shield-vaultmeta:v2:")) {
    const parts = secretStr.split(":");
    if (parts.length !== 3) return null;
    try {
      const json = decodeURIComponent(escape(atob(parts[2])));
      const parsed = JSON.parse(json);
      if (!parsed || parsed.v !== 2) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  if (!secretStr.startsWith("shield-vaultmeta:v1:")) return null;

  const parts = secretStr.split(":");
  // shield-vaultmeta:v1:<kdf>:<iters>:<salt>
  if (parts.length !== 5) return null;

  const kdf = parts[2];
  const iterations = Number(parts[3]);
  const finalSalt = parts[4];

  if (!kdf || !Number.isFinite(iterations) || iterations <= 0 || !finalSalt) return null;
  return { v: 1, kdf, iterations, salt: finalSalt };
}

async function readVaultMetaViaList(user) {
  const emailId = requireUserEmail(user);
  const col = collection(db, "user", emailId, "accounts");
  // Uses LIST permission (allowed by your rules for the path owner)
  const q = query(col, where(documentId(), "==", "__vault"));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return parseVaultMeta(snap.docs[0].data()?.secret);
}

let _vaultState = {
  userEmail: null,
  vaultKey: null,
  vaultMeta: null,
  vaultKeyBytes: null,
};

export async function getVaultMeta(user) {
  return readVaultMetaViaList(user);
}

export function isVaultRecoveryConfiguredForUser(user) {
  const emailId = requireUserEmail(user);
  if (_vaultState.userEmail !== emailId) return false;
  const meta = _vaultState.vaultMeta;
  return !!(meta && meta.v === 2 && meta.recovery && meta.recovery.wrappedMasterKey);
}

export function lockVault() {
  _vaultState = { userEmail: null, vaultKey: null, vaultMeta: null, vaultKeyBytes: null };
}

export function isVaultUnlockedForUser(user) {
  return !!_vaultState.vaultKey && _vaultState.userEmail === requireUserEmail(user);
}

export function getVaultAadForUser(user) {
  const emailId = requireUserEmail(user);
  return `shield-authenticator|vault-v1|${emailId}`;
}

export function getVaultKeyForUser(user) {
  if (!isVaultUnlockedForUser(user)) {
    throw new Error("Vault locked. Enter your vault passphrase to decrypt.");
  }
  return _vaultState.vaultKey;
}

export async function unlockVault(user, passphrase) {
  const emailId = requireUserEmail(user);
  const ref = userVaultDocRef(user);

  const existingVault = await readVaultMetaViaList(user);
  const vault = existingVault;
  if (!vault) {
    // New vault must be created via setupVault() so the user can set recovery questions.
    throw new Error("Vault not set up yet. Please set a passphrase and recovery questions.");
  }

  if (vault.kdf !== "pbkdf2-sha256") {
    throw new Error("Unsupported vault KDF");
  }

  if (vault.v === 2) {
    try {
      const kek = await deriveVaultKey({ passphrase, saltB64: vault.passphrase.salt, iterations: vault.passphrase.iterations });
      const aad = getVaultAadForUser(user);
      const masterKeyB64 = await decryptWithVaultKey({ ciphertext: vault.passphrase.wrappedMasterKey, vaultKey: kek, aad: `${aad}|wrap|passphrase` });
      const masterKeyBytes = b64ToBytes(masterKeyB64);
      const masterKey = await importVaultMasterKey(masterKeyBytes);
      _vaultState = { userEmail: emailId, vaultKey: masterKey, vaultMeta: vault, vaultKeyBytes: masterKeyBytes };
      return vault;
    } catch (err) {
      throw new Error("Incorrect passphrase. Please try again Or Click Recover Vault.");
    }
  }

  // v1 fallback
  if (!vault.salt) {
    // If v1 meta exists but is malformed, recreate it.
    const v1 = {
      v: 1,
      kdf: "pbkdf2-sha256",
      iterations: 310000,
      salt: vaultSaltToString(generateVaultSaltBytes()),
    };
    await setDoc(ref, {
      userId: user?.uid || "",
      name: "__vault",
      secret: serializeVaultMeta(v1),
      createdAt: Timestamp.now(),
    });
    const vaultKey = await deriveVaultKey({ passphrase, saltB64: v1.salt, iterations: v1.iterations });
    _vaultState = { userEmail: emailId, vaultKey, vaultMeta: v1, vaultKeyBytes: null };
    return v1;
  }

  const vaultKey = await deriveVaultKey({
    passphrase,
    saltB64: vault.salt,
    iterations: vault.iterations,
  });

  // Auto-upgrade v1 -> v2 by re-encrypting secrets under a random master key.
  // Recovery questions can be configured later in Settings.
  try {
    const aad = getVaultAadForUser(user);
    const masterKeyBytes = generateVaultMasterKeyBytes();
    const masterKey = await importVaultMasterKey(masterKeyBytes);
    const masterKeyB64 = bytesToB64(masterKeyBytes);

    const passphraseSalt = vaultSaltToString(generateVaultSaltBytes());
    const passphraseKek = await deriveVaultKey({ passphrase, saltB64: passphraseSalt, iterations: 310000 });
    const wrappedMasterKeyPassphrase = await encryptWithVaultKey({ plaintext: masterKeyB64, vaultKey: passphraseKek, aad: `${aad}|wrap|passphrase` });

    const v2 = {
      v: 2,
      kdf: "pbkdf2-sha256",
      passphrase: {
        iterations: 310000,
        salt: passphraseSalt,
        wrappedMasterKey: wrappedMasterKeyPassphrase,
      },
      recovery: null,
    };

    const emailId2 = requireUserEmail(user);
    const col = collection(db, "user", emailId2, "accounts");
    const snap = await getDocs(col);

    const batch = writeBatch(db);
    const now = Timestamp.now();
    for (const docSnap of snap.docs) {
      if (docSnap.id === "__vault") continue;
      const data = docSnap.data();
      const plaintext = await decryptWithVaultKey({ ciphertext: data.secret, vaultKey, aad });
      const reEncrypted = await encryptWithVaultKey({ plaintext, vaultKey: masterKey, aad });
      batch.update(doc(db, "user", emailId2, "accounts", docSnap.id), { secret: reEncrypted, updatedAt: now });
    }
    batch.update(ref, { secret: serializeVaultMeta(v2), updatedAt: now });
    await batch.commit();

    _vaultState = { userEmail: emailId, vaultKey: masterKey, vaultMeta: v2, vaultKeyBytes: masterKeyBytes };
    return v2;
  } catch {
    // If upgrade fails, remain on v1 to avoid breaking unlock.
    _vaultState = { userEmail: emailId, vaultKey, vaultMeta: vault, vaultKeyBytes: null };
    return vault;
  }
}

export async function setupVault(user, { passphrase, recoveryQuestions, recoveryAnswers }) {
  const emailId = requireUserEmail(user);
  const ref = userVaultDocRef(user);

  const existingVault = await readVaultMetaViaList(user);
  if (existingVault) {
    throw new Error("Vault already set up");
  }

  if (!passphrase || String(passphrase).length < 8) {
    throw new Error("Passphrase must be at least 8 characters");
  }

  // Recovery questions are optional
  if (!Array.isArray(recoveryQuestions)) {
    recoveryQuestions = [];
  }
  if (!Array.isArray(recoveryAnswers)) {
    recoveryAnswers = [];
  }
  if (recoveryQuestions.length > 0 && recoveryAnswers.length !== recoveryQuestions.length) {
    throw new Error("Provide answers for all selected questions");
  }

  const aad = getVaultAadForUser(user);
  const masterKeyBytes = generateVaultMasterKeyBytes();
  const masterKey = await importVaultMasterKey(masterKeyBytes);
  const masterKeyB64 = bytesToB64(masterKeyBytes);

  const passphraseSalt = vaultSaltToString(generateVaultSaltBytes());
  const passphraseKek = await deriveVaultKey({ passphrase, saltB64: passphraseSalt, iterations: 310000 });
  const wrappedMasterKeyPassphrase = await encryptWithVaultKey({ plaintext: masterKeyB64, vaultKey: passphraseKek, aad: `${aad}|wrap|passphrase` });

  // Only create recovery wrapper if questions are provided
  let recoverySalt = null;
  let wrappedMasterKeyRecovery = null;
  if (recoveryQuestions.length > 0) {
    recoverySalt = vaultSaltToString(generateVaultSaltBytes());
    const recoveryKek = await deriveRecoveryKey({ answers: recoveryAnswers, saltB64: recoverySalt, iterations: 310000 });
    wrappedMasterKeyRecovery = await encryptWithVaultKey({ plaintext: masterKeyB64, vaultKey: recoveryKek, aad: `${aad}|wrap|recovery` });
  }

  const v2 = {
    v: 2,
    kdf: "pbkdf2-sha256",
    passphrase: {
      iterations: 310000,
      salt: passphraseSalt,
      wrappedMasterKey: wrappedMasterKeyPassphrase,
    },
    recovery: recoveryQuestions.length > 0 ? {
      iterations: 310000,
      salt: recoverySalt,
      questions: recoveryQuestions,
      wrappedMasterKey: wrappedMasterKeyRecovery,
    } : null,
  };

  await setDoc(ref, {
    userId: user?.uid || "",
    name: "__vault",
    secret: serializeVaultMeta(v2),
    createdAt: Timestamp.now(),
  });

  _vaultState = { userEmail: emailId, vaultKey: masterKey, vaultMeta: v2, vaultKeyBytes: masterKeyBytes };
  return v2;
}

export async function recoverAndResetPassphrase(user, { recoveryAnswers, newPassphrase }) {
  const emailId = requireUserEmail(user);
  const ref = userVaultDocRef(user);
  const vault = await readVaultMetaViaList(user);
  if (!vault || vault.v !== 2 || !vault.recovery || !vault.recovery.wrappedMasterKey) {
    throw new Error("Recovery is not configured for this vault");
  }
  if (!newPassphrase || String(newPassphrase).length < 8) {
    throw new Error("Passphrase must be at least 8 characters");
  }

  const aad = getVaultAadForUser(user);
  const recoveryKek = await deriveRecoveryKey({ answers: recoveryAnswers, saltB64: vault.recovery.salt, iterations: vault.recovery.iterations });
  const masterKeyB64 = await decryptWithVaultKey({ ciphertext: vault.recovery.wrappedMasterKey, vaultKey: recoveryKek, aad: `${aad}|wrap|recovery` });
  const masterKeyBytes = b64ToBytes(masterKeyB64);
  const masterKey = await importVaultMasterKey(masterKeyBytes);

  // Re-wrap with new passphrase
  const passphraseSalt = vaultSaltToString(generateVaultSaltBytes());
  const passphraseKek = await deriveVaultKey({ passphrase: newPassphrase, saltB64: passphraseSalt, iterations: 310000 });
  const wrappedMasterKeyPassphrase = await encryptWithVaultKey({ plaintext: masterKeyB64, vaultKey: passphraseKek, aad: `${aad}|wrap|passphrase` });

  const updated = {
    ...vault,
    passphrase: {
      iterations: 310000,
      salt: passphraseSalt,
      wrappedMasterKey: wrappedMasterKeyPassphrase,
    },
  };

  await updateDoc(ref, {
    secret: serializeVaultMeta(updated),
    updatedAt: Timestamp.now(),
  });

  _vaultState = { userEmail: emailId, vaultKey: masterKey, vaultMeta: updated, vaultKeyBytes: masterKeyBytes };
  return updated;
}

export async function updateRecoveryQuestions(user, { recoveryQuestions, recoveryAnswers }) {
  const emailId = requireUserEmail(user);
  if (!isVaultUnlockedForUser(user)) {
    throw new Error("Vault locked. Unlock first.");
  }

  const ref = userVaultDocRef(user);
  const vault = await readVaultMetaViaList(user);
  if (!vault || vault.v !== 2) {
    throw new Error("Vault upgrade required before setting recovery questions");
  }

  if (!Array.isArray(recoveryQuestions) || recoveryQuestions.length < 1) {
    throw new Error("Select at least one recovery question");
  }
  if (!Array.isArray(recoveryAnswers) || recoveryAnswers.length !== recoveryQuestions.length) {
    throw new Error("Provide answers for all selected questions");
  }

  const aad = getVaultAadForUser(user);
  const masterKeyBytes = _vaultState.vaultKeyBytes;
  if (!masterKeyBytes) {
    throw new Error("Vault key material not available. Please unlock again.");
  }
  const masterKeyB64 = bytesToB64(masterKeyBytes);

  const recoverySalt = vaultSaltToString(generateVaultSaltBytes());
  const recoveryKek = await deriveRecoveryKey({ answers: recoveryAnswers, saltB64: recoverySalt, iterations: 310000 });
  const wrappedMasterKeyRecovery = await encryptWithVaultKey({ plaintext: masterKeyB64, vaultKey: recoveryKek, aad: `${aad}|wrap|recovery` });

  const updated = {
    ...vault,
    recovery: {
      iterations: 310000,
      salt: recoverySalt,
      questions: recoveryQuestions,
      wrappedMasterKey: wrappedMasterKeyRecovery,
    },
  };

  await updateDoc(ref, {
    secret: serializeVaultMeta(updated),
    updatedAt: Timestamp.now(),
  });

  _vaultState = { userEmail: emailId, vaultKey: _vaultState.vaultKey, vaultMeta: updated };
  return updated;
}
export async function clearRecoveryQuestions(user) {
  const emailId = requireUserEmail(user);
  if (!isVaultUnlockedForUser(user)) {
    throw new Error("Vault locked. Unlock first.");
  }

  const ref = userVaultDocRef(user);
  const vault = await readVaultMetaViaList(user);
  if (!vault || vault.v !== 2) {
    throw new Error("Vault upgrade required");
  }

  const updated = {
    ...vault,
    recovery: null,
  };

  await updateDoc(ref, {
    secret: serializeVaultMeta(updated),
    updatedAt: Timestamp.now(),
  });

  _vaultState = { userEmail: emailId, vaultKey: _vaultState.vaultKey, vaultMeta: updated, vaultKeyBytes: _vaultState.vaultKeyBytes };
  return updated;
}
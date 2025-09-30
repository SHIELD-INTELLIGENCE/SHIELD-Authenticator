// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import CryptoJS from "crypto-js";

// Dual-key support (PRIMARY preferred; LEGACY only for migration). Fallback to REACT_APP_MASTER_KEY for backward compat.
const PRIMARY = process.env.REACT_APP_MASTER_KEY_PRIMARY || process.env.REACT_APP_MASTER_KEY || "";
const LEGACY = process.env.REACT_APP_MASTER_KEY_LEGACY || "";

if (!PRIMARY) {
  // eslint-disable-next-line no-console
  console.warn("Master key not set. Set REACT_APP_MASTER_KEY_PRIMARY (or REACT_APP_MASTER_KEY).");
}

export function encryptSecret(secret) {
  if (!PRIMARY) throw new Error("Missing REACT_APP_MASTER_KEY_PRIMARY (or REACT_APP_MASTER_KEY)");
  return CryptoJS.AES.encrypt(secret, PRIMARY).toString();
}

export function decryptSecret(encrypted) {
  const res = decryptSecretWithKeyInfo(encrypted);
  return res.plaintext;
}

// Returns { plaintext, keyUsed: 'primary' | 'legacy' | 'none' }
export function decryptSecretWithKeyInfo(encrypted) {
  const tryDecrypt = (cipher, key) => {
    if (!key) return null;
    try {
      const txt = CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
      return txt || null; // empty string implies wrong key
    } catch (_) {
      return null;
    }
  };

  const withPrimary = tryDecrypt(encrypted, PRIMARY);
  if (withPrimary) return { plaintext: withPrimary, keyUsed: "primary" };

  const withLegacy = tryDecrypt(encrypted, LEGACY);
  if (withLegacy) return { plaintext: withLegacy, keyUsed: "legacy" };

  return { plaintext: "", keyUsed: "none" };
}
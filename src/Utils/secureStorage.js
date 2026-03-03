/* eslint-disable no-restricted-globals */
// Copyright © 2026 SHIELD Intelligence. All rights reserved.

/**
 * Secure Storage for Vault Passphrase
 * 
 * Instead of storing the passphrase in plaintext, we:
 * 1. Derive a device-specific key from browser fingerprint data
 * 2. Encrypt the passphrase with this key using AES-GCM
 * 3. Store the encrypted result in localStorage
 * 
 * This provides defense-in-depth:
 * - An attacker cannot easily extract and use the passphrase on a different device
 * - The encrypted data is bound to the specific browser/device
 */

import { Capacitor, registerPlugin } from "@capacitor/core";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const STORAGE_VERSION = "v3";
const LEGACY_VERSION = "v2";
const LEGACY_DEVICE_KEY_NAME = "shield-vault-device-key-v2";
const IDB_DB_NAME = "shield-secure-storage";
const IDB_STORE_NAME = "crypto-keys";
const IDB_KEY_ID = "shield-vault-device-key-v3";
const SecureStoragePlugin = registerPlugin("SecureStoragePlugin");

export const SECURE_STORAGE_GET_KEY_ERROR = "failed to get the key from securestorage error";

function toBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64) {
  const binary = atob(String(b64));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isNativePlatform() {
  try {
    return Capacitor.getPlatform() !== "web";
  } catch {
    return false;
  }
}

async function callNativeSecureStorage(methodNames, args) {
  for (const method of methodNames) {
    try {
      const fn = SecureStoragePlugin?.[method];
      if (typeof fn !== "function") continue;
      return await fn(args || {});
    } catch {
      // try next alias
    }
  }
  throw new Error("Native secure storage unavailable");
}

async function nativeSecureSet(key, value) {
  await callNativeSecureStorage(["set", "setItem"], { key, value });
}

async function nativeSecureGet(key) {
  try {
    const result = await callNativeSecureStorage(["get", "getItem"], { key });
    if (typeof result === "string") return result;
    if (result && typeof result.value === "string") return result.value;
    return null;
  } catch {
    return null;
  }
}

async function nativeSecureRemove(key) {
  try {
    await callNativeSecureStorage(["remove", "removeItem", "delete", "deleteItem"], { key });
  } catch {
    // best-effort cleanup
  }
}

function openKeyDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
  });
}

function idbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("IndexedDB get failed"));
  });
}

function idbPut(db, storeName, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("IndexedDB put failed"));
  });
}



/**
 * Get or generate a stable, non-extractable device key for encryption (per browser profile)
 * @returns {Promise<CryptoKey>}
 */
async function getOrCreateDeviceKey() {
  if (!window.indexedDB) {
    throw new Error("IndexedDB not available for secure key storage");
  }

  const db = await openKeyDb();
  try {
    const existing = await idbGet(db, IDB_STORE_NAME, IDB_KEY_ID);
    if (existing instanceof CryptoKey) {
      return existing;
    }

    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    await idbPut(db, IDB_STORE_NAME, IDB_KEY_ID, key);

    try {
      localStorage.removeItem(LEGACY_DEVICE_KEY_NAME);
    } catch {
      // best-effort cleanup
    }

    return key;
  } finally {
    db.close();
  }
}

/**
 * Securely store a passphrase encrypted with device-specific key
 * @param {string} key - localStorage key
 * @param {string} passphrase - the passphrase to store
 */
export async function secureSetItem(key, passphrase) {
  try {
    if (isNativePlatform()) {
      try {
        await nativeSecureSet(key, String(passphrase || ""));
        localStorage.removeItem(key);
        return true;
      } catch {
        // fallback to hardened web storage for compatibility
      }
    }

    if (!window.crypto || !window.crypto.subtle || !window.indexedDB) {
      throw new Error("Required secure browser APIs not available");
    }

    const deviceKey = await getOrCreateDeviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const plaintext = textEncoder.encode(passphrase);
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      deviceKey,
      plaintext
    );

    const stored = `${STORAGE_VERSION}|${toBase64(iv)}|${toBase64(new Uint8Array(ciphertext))}`;
    localStorage.setItem(key, stored);
    return true;
  } catch (err) {
    console.error("Secure storage failed:", err);
    return false;
  }
}

/**
 * Retrieve and decrypt a passphrase from secure storage
 * @param {string} key - localStorage key
 * @returns {string|null} - decrypted passphrase or null if not found/failed
 */
export async function secureGetItem(key) {
  const { value } = await secureGetItemWithStatus(key);
  return value;
}

/**
 * Retrieve and decrypt a passphrase with detailed error status
 * @param {string} key - localStorage key
 * @returns {Promise<{ value: string|null, error: Error|null }>} - decrypted value and optional error
 */
export async function secureGetItemWithStatus(key) {
  try {
    if (isNativePlatform()) {
      const nativeValue = await nativeSecureGet(key);
      if (nativeValue && nativeValue.trim().length >= 8) {
        return { value: nativeValue, error: null };
      }
    }

    const stored = localStorage.getItem(key);
    if (!stored) return { value: null, error: null };

    // Legacy fallback: previously remembered passphrase may be stored as plaintext.
    // Read it once for backward compatibility, then let caller migrate to secure storage.
    if (!String(stored).startsWith(`${LEGACY_VERSION}|`) && !String(stored).startsWith(`${STORAGE_VERSION}|`)) {
      const legacyValue = String(stored);
      if (legacyValue.trim().length >= 8) {
        return { value: legacyValue, error: null };
      }
      localStorage.removeItem(key);
      return { value: null, error: null };
    }

    const parts = stored.split('|');
    if (parts.length !== 3 || (parts[0] !== LEGACY_VERSION && parts[0] !== STORAGE_VERSION)) {
      // Invalid format or old storage - remove it
      localStorage.removeItem(key);
      return { value: null, error: null };
    }

    const iv = fromBase64(parts[1]);
    const ciphertext = fromBase64(parts[2]);

    let deviceKey;
    if (parts[0] === STORAGE_VERSION) {
      if (!window.indexedDB) {
        return { value: null, error: new Error(SECURE_STORAGE_GET_KEY_ERROR) };
      }
      deviceKey = await getOrCreateDeviceKey();
    } else {
      const legacyKeyB64 = localStorage.getItem(LEGACY_DEVICE_KEY_NAME);
      if (!legacyKeyB64) {
        return { value: null, error: new Error(SECURE_STORAGE_GET_KEY_ERROR) };
      }
      const rawKey = fromBase64(legacyKeyB64);
      deviceKey = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    }

    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      deviceKey,
      ciphertext
    );

    return { value: textDecoder.decode(plaintext), error: null };
  } catch (err) {
    // Decryption failed - likely different device or tampered data
    console.error("Secure retrieval failed:", err);
    return { value: null, error: new Error(SECURE_STORAGE_GET_KEY_ERROR) };
  }
}

/**
 * Remove item from secure storage
 * @param {string} key - localStorage key
 */
export function secureRemoveItem(key) {
  if (isNativePlatform()) {
    nativeSecureRemove(key);
  }
  localStorage.removeItem(key);
}

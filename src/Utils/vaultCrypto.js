// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import argon2 from "argon2-browser";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

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

function encodeUtf8(str) {
  return textEncoder.encode(String(str));
}

function decodeUtf8(bytes) {
  return textDecoder.decode(bytes);
}

export const VAULT_CIPHERTEXT_PREFIX = "shield:v1";
export const VAULT_KDF_PBKDF2 = "pbkdf2-sha256";
export const VAULT_KDF_ARGON2ID = "argon2id";

const DEFAULT_PBKDF2_ITERATIONS = 310000;
const DEFAULT_ARGON2ID_PARAMS = Object.freeze({
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 1,
  hashLen: 32,
});

export function isVaultCiphertext(value) {
  return typeof value === "string" && value.startsWith(`${VAULT_CIPHERTEXT_PREFIX}:`);
}

export function resolveVaultKdf(kdf) {
  return String(kdf || "").toLowerCase() === VAULT_KDF_ARGON2ID ? VAULT_KDF_ARGON2ID : VAULT_KDF_PBKDF2;
}

export function getDefaultArgon2idParams() {
  return { ...DEFAULT_ARGON2ID_PARAMS };
}

export function generateVaultSaltBytes() {
  // 16 bytes salt for PBKDF2
  return crypto.getRandomValues(new Uint8Array(16));
}

export function vaultSaltToString(saltBytes) {
  return toBase64(saltBytes);
}

export function vaultSaltFromString(saltB64) {
  return fromBase64(saltB64);
}

function normalizeArgon2Params(params) {
  const merged = { ...DEFAULT_ARGON2ID_PARAMS, ...(params || {}) };
  return {
    timeCost: Math.max(2, Number(merged.timeCost) || DEFAULT_ARGON2ID_PARAMS.timeCost),
    memoryCost: Math.max(32768, Number(merged.memoryCost) || DEFAULT_ARGON2ID_PARAMS.memoryCost),
    parallelism: Math.max(1, Number(merged.parallelism) || DEFAULT_ARGON2ID_PARAMS.parallelism),
    hashLen: 32,
  };
}

function hexToBytes(hex) {
  const clean = String(hex || "").trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean) || clean.length % 2 !== 0) {
    throw new Error("Invalid Argon2 output");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

function normalizeArgon2OutputBytes(output) {
  if (output instanceof Uint8Array) return output;
  if (output instanceof ArrayBuffer) return new Uint8Array(output);
  if (Array.isArray(output)) return new Uint8Array(output);
  if (typeof output === "string") return hexToBytes(output);
  throw new Error("Unsupported Argon2 output format");
}

async function deriveArgon2AesKey({ secret, saltB64, argon2Params }) {
  if (!saltB64) throw new Error("Missing vault salt");
  const salt = vaultSaltFromString(saltB64);
  const params = normalizeArgon2Params(argon2Params);

  const result = await argon2.hash({
    pass: String(secret),
    salt,
    time: params.timeCost,
    mem: params.memoryCost,
    parallelism: params.parallelism,
    hashLen: params.hashLen,
    type: argon2.ArgonType.Argon2id,
    raw: true,
  });

  const keyBytes = normalizeArgon2OutputBytes(result?.hash ?? result);
  if (keyBytes.length !== 32) {
    throw new Error("Invalid Argon2 derived key length");
  }
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function deriveVaultKey({ passphrase, saltB64, iterations, kdf, argon2Params }) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Crypto API unavailable. Please ensure you're using HTTPS or a secure context.");
  }
  if (!passphrase || String(passphrase).length < 8) {
    throw new Error("Passphrase must be at least 8 characters");
  }
  // Validate passphrase complexity: must contain both numbers and letters
  const hasNumber = /[0-9]/.test(passphrase);
  const hasLetter = /[a-z]/i.test(passphrase);
  if (!hasNumber || !hasLetter) {
    throw new Error("Passphrase must contain both letters and numbers");
  }
  if (!saltB64) throw new Error("Missing vault salt");

  const selectedKdf = resolveVaultKdf(kdf);
  if (selectedKdf === VAULT_KDF_ARGON2ID) {
    return deriveArgon2AesKey({ secret: passphrase, saltB64, argon2Params });
  }

  const salt = vaultSaltFromString(saltB64);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    encodeUtf8(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const iters = Number(iterations) || DEFAULT_PBKDF2_ITERATIONS;

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: iters,
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function normalizeRecoveryAnswer(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeRecoveryAnswers(answers) {
  if (!Array.isArray(answers)) return [];
  return answers.map((a) => normalizeRecoveryAnswer(a));
}

export async function deriveRecoveryKey({ answers, saltB64, iterations, kdf, argon2Params }) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Crypto API unavailable. Please ensure you're using HTTPS or a secure context.");
  }
  const normalized = normalizeRecoveryAnswers(answers);
  if (!normalized.length || normalized.some((a) => !a)) {
    throw new Error("Missing recovery answers");
  }
  if (!saltB64) throw new Error("Missing recovery salt");

  const selectedKdf = resolveVaultKdf(kdf);
  if (selectedKdf === VAULT_KDF_ARGON2ID) {
    return deriveArgon2AesKey({ secret: normalized.join("|"), saltB64, argon2Params });
  }

  const salt = vaultSaltFromString(saltB64);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encodeUtf8(normalized.join("|")),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const iters = Number(iterations) || DEFAULT_PBKDF2_ITERATIONS;
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: iters,
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function generateVaultMasterKeyBytes() {
  // 32 bytes -> AES-256
  return crypto.getRandomValues(new Uint8Array(32));
}

export async function importVaultMasterKey(masterKeyBytes) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Crypto API unavailable. Please ensure you're using HTTPS or a secure context.");
  }
  const bytes = masterKeyBytes instanceof Uint8Array ? masterKeyBytes : new Uint8Array(masterKeyBytes);
  if (bytes.length !== 32) throw new Error("Invalid master key length");
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function exportVaultMasterKeyBytes(masterKey) {
  const raw = await crypto.subtle.exportKey("raw", masterKey);
  return new Uint8Array(raw);
}

export function bytesToB64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function b64ToBytes(b64) {
  const binary = atob(String(b64));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptWithVaultKey({ plaintext, vaultKey, aad }) {
  if (!vaultKey) throw new Error("Vault key not available");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = encodeUtf8(plaintext);

  const ctBuf = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: aad ? encodeUtf8(aad) : undefined,
    },
    vaultKey,
    data
  );

  const ct = new Uint8Array(ctBuf);
  return `${VAULT_CIPHERTEXT_PREFIX}:${toBase64(iv)}:${toBase64(ct)}`;
}

export async function decryptWithVaultKey({ ciphertext, vaultKey, aad }) {
  if (!vaultKey) throw new Error("Vault key not available");
  if (!isVaultCiphertext(ciphertext)) {
    throw new Error("Secret is not in vault format");
  }

  const parts = String(ciphertext).split(":");
  // shield:v1:<ivb64>:<ctb64>
  if (parts.length !== 4) throw new Error("Invalid vault ciphertext format");

  const iv = fromBase64(parts[2]);
  const ct = fromBase64(parts[3]);

  try {
    const ptBuf = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: aad ? encodeUtf8(aad) : undefined,
      },
      vaultKey,
      ct
    );

    return decodeUtf8(new Uint8Array(ptBuf));
  } catch (err) {
    // Decryption fails when wrong passphrase is used
    throw new Error("Incorrect passphrase. Please try again or recover your vault.");
  }
}

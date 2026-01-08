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

/**
 * Generate a device fingerprint based on browser characteristics
 * This creates a consistent identifier for the device/browser
 */
async function getDeviceFingerprint() {
  const components = [
    navigator.userAgent || '',
    navigator.language || '',
    navigator.hardwareConcurrency || '',
    navigator.deviceMemory || '',
    screen.colorDepth || '',
    screen.width || '',
    screen.height || '',
    new Date().getTimezoneOffset() || '',
    navigator.platform || '',
  ];
  
  const fingerprint = components.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return toBase64(hashArray);
}

/**
 * Derive a device-specific encryption key
 */
async function deriveDeviceKey() {
  const fingerprint = await getDeviceFingerprint();
  const salt = new Uint8Array([
    0x53, 0x48, 0x49, 0x45, 0x4c, 0x44, 0x2d, 0x44,
    0x45, 0x56, 0x49, 0x43, 0x45, 0x2d, 0x53, 0x41
  ]); // "SHIELD-DEVICE-SA"
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(fingerprint),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Securely store a passphrase encrypted with device-specific key
 * @param {string} key - localStorage key
 * @param {string} passphrase - the passphrase to store
 */
export async function secureSetItem(key, passphrase) {
  try {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }
    
    const deviceKey = await deriveDeviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const plaintext = textEncoder.encode(passphrase);
    
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      deviceKey,
      plaintext
    );
    
    // Store: version|iv|ciphertext (all base64 encoded)
    const stored = `v1|${toBase64(iv)}|${toBase64(new Uint8Array(ciphertext))}`;
    localStorage.setItem(key, stored);
    return true;
  } catch (err) {
    console.error('Secure storage failed:', err);
    return false;
  }
}

/**
 * Retrieve and decrypt a passphrase from secure storage
 * @param {string} key - localStorage key
 * @returns {string|null} - decrypted passphrase or null if not found/failed
 */
export async function secureGetItem(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parts = stored.split('|');
    if (parts.length !== 3 || parts[0] !== 'v1') {
      // Invalid format or old plaintext storage - remove it
      localStorage.removeItem(key);
      return null;
    }
    
    const iv = fromBase64(parts[1]);
    const ciphertext = fromBase64(parts[2]);
    
    const deviceKey = await deriveDeviceKey();
    
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      deviceKey,
      ciphertext
    );
    
    return textDecoder.decode(plaintext);
  } catch (err) {
    // Decryption failed - likely different device or tampered data
    console.error('Secure retrieval failed:', err);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Remove item from secure storage
 * @param {string} key - localStorage key
 */
export function secureRemoveItem(key) {
  localStorage.removeItem(key);
}

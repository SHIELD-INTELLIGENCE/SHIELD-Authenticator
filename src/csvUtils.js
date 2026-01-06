// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import CryptoJS from "crypto-js";

/**
 * Encrypts a secret with a user-provided passphrase
 * @param {string} secret - The plain secret to encrypt
 * @param {string} passphrase - User passphrase for encryption
 * @returns {string} Encrypted secret
 */
export function encryptWithPassphrase(secret, passphrase) {
  if (!passphrase || passphrase.length < 8) {
    throw new Error("Passphrase must be at least 8 characters");
  }
  return CryptoJS.AES.encrypt(secret, passphrase).toString();
}

/**
 * Decrypts a secret with a user-provided passphrase
 * @param {string} encryptedSecret - The encrypted secret
 * @param {string} passphrase - User passphrase for decryption
 * @returns {string} Plain secret
 */
export function decryptWithPassphrase(encryptedSecret, passphrase) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedSecret, passphrase);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
      throw new Error("Invalid passphrase");
    }
    return plaintext;
  } catch (err) {
    throw new Error("Failed to decrypt. Check your passphrase.");
  }
}

/**
 * Exports accounts to CSV format with optional passphrase-encrypted secrets
 * @param {Array} accounts - Array of account objects with {name, secret}
 * @param {string} passphrase - Optional user passphrase for encrypting secrets
 * @param {boolean} useEncryption - Whether to encrypt secrets (default: true)
 * @returns {string} CSV content
 */
export function exportAccountsToCSV(accounts, passphrase = null, useEncryption = true) {
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts to export");
  }
  
  if (useEncryption && (!passphrase || passphrase.length < 8)) {
    throw new Error("Passphrase must be at least 8 characters");
  }

  // CSV header
  const secretColumn = useEncryption ? "EncryptedSecret" : "Secret";
  const header = `Name,${secretColumn},ExportedAt\n`;
  
  // Process each account
  const rows = accounts.map(account => {
    const name = escapeCSV(account.name);
    const secret = useEncryption 
      ? encryptWithPassphrase(account.secret, passphrase)
      : account.secret;
    const exportedAt = new Date().toISOString();
    return `${name},${escapeCSV(secret)},${exportedAt}`;
  });
  
  return header + rows.join("\n");
}

/**
 * Imports accounts from CSV format with optional passphrase-encrypted secrets
 * @param {string} csvContent - CSV file content
 * @param {string} passphrase - Optional user passphrase for decrypting secrets
 * @param {boolean} useDecryption - Whether secrets are encrypted (default: true)
 * @returns {Array} Array of account objects with {name, secret}
 */
export function importAccountsFromCSV(csvContent, passphrase = null, useDecryption = true) {
  if (!csvContent || csvContent.trim().length === 0) {
    throw new Error("CSV file is empty");
  }
  
  if (useDecryption && (!passphrase || passphrase.length < 8)) {
    throw new Error("Passphrase must be at least 8 characters");
  }

  const lines = csvContent.trim().split("\n");
  
  // Check for header
  if (lines.length < 2) {
    throw new Error("CSV file is invalid or empty");
  }
  
  const header = lines[0].toLowerCase();
  const hasEncryptedSecret = header.includes("encryptedsecret");
  const hasPlainSecret = header.includes("secret") && !hasEncryptedSecret;
  
  if (!header.includes("name") || (!hasEncryptedSecret && !hasPlainSecret)) {
    throw new Error("Invalid CSV format. Expected headers: Name, Secret/EncryptedSecret, ExportedAt");
  }
  
  // Auto-detect encryption based on header if not explicitly specified
  const isEncrypted = hasEncryptedSecret;
  if (isEncrypted !== useDecryption) {
    // Adjust useDecryption based on actual file format
    useDecryption = isEncrypted;
  }
  
  // Parse accounts from CSV (skip header)
  const accounts = [];
  const errors = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty lines
    
    try {
      const [name, encryptedSecret, exportedAt] = parseCSVLine(line);
      
      if (!name || !encryptedSecret) {
        errors.push(`Line ${i + 1}: Missing name or secret`);
        continue;
      }
      
      // Decrypt the secret if encrypted, otherwise use as-is
      const secret = useDecryption 
        ? decryptWithPassphrase(encryptedSecret, passphrase)
        : encryptedSecret;
      
      accounts.push({
        name: name.trim(),
        secret: secret.trim(),
        importedAt: new Date().toISOString(),
        originalExportedAt: exportedAt
      });
    } catch (err) {
      errors.push(`Line ${i + 1}: ${err.message}`);
    }
  }
  
  if (accounts.length === 0 && errors.length > 0) {
    throw new Error(`Failed to import any accounts:\n${errors.join("\n")}`);
  }
  
  return { accounts, errors };
}

/**
 * Escapes a value for CSV format
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSV(value) {
  if (!value) return "";
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Parses a CSV line handling quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of value
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  // Add last value
  values.push(current);
  
  return values;
}

/**
 * Downloads a CSV file to the user's device
 * @param {string} csvContent - CSV content to download
 * @param {string} filename - Filename for the download
 */
export function downloadCSV(csvContent, filename = "shield-authenticator-accounts.csv") {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Reads a CSV file from user's device
 * @param {File} file - File object from input
 * @returns {Promise<string>} Promise resolving to file content
 */
export function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }
    
    if (!file.name.endsWith(".csv")) {
      reject(new Error("Please select a CSV file"));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
}

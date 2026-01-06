# SHIELD Authenticator - CSV Export/Import Guide

## Overview

The CSV export/import feature allows you to backup and restore your authenticator accounts securely using passphrase-encrypted exports.

## Features

### 🔐 Security

- **Passphrase Encryption**: All secrets are encrypted with AES using your custom passphrase
- **Minimum 8 characters**: Strong passphrase requirement for security
- **Zero Knowledge**: Secrets are encrypted before export; only you know the passphrase

### 📤 Export Process

1. Navigate to **Settings** (Profile button)
2. Click **"Export to CSV"** under "Backup & Restore"
3. Enter a strong passphrase (min 8 characters)
4. Click **"Export"**
5. File is downloaded as `shield-authenticator-accounts-YYYY-MM-DD.csv`

### 📥 Import Process

1. Navigate to **Settings** (Profile button)
2. Click **"Import from CSV"** under "Backup & Restore"
3. Select your CSV file
4. Enter the passphrase you used during export
5. Click **"Import"**
6. Accounts are added to your existing collection

## CSV Format

The exported CSV file contains:

```csv
Name,EncryptedSecret,ExportedAt
"Google","U2FsdGVkX1...(encrypted)",2026-01-05T12:34:56.789Z
"GitHub","U2FsdGVkX1...(encrypted)",2026-01-05T12:34:56.789Z
```

**Columns:**

- `Name`: Account name (plaintext)
- `EncryptedSecret`: AES-encrypted TOTP secret (passphrase-protected)
- `ExportedAt`: ISO timestamp of export

## Important Notes

### ⚠️ Security Best Practices

- **Remember your passphrase**: Without it, imported accounts cannot be decrypted
- **Use a strong passphrase**: Minimum 8 characters, preferably longer with mixed case, numbers, and symbols
- **Store securely**: Keep your CSV file and passphrase in separate, secure locations
- **Don't share**: Never share your CSV file or passphrase

### 🔄 Import Behavior

- **Adds accounts**: Import adds to existing accounts (doesn't replace)
- **Duplicate handling**: Will create duplicate entries if same accounts are imported multiple times
- **Partial imports**: If some accounts fail to import, successfully imported accounts are still added
- **Error reporting**: Shows count of successful and failed imports

### 💡 Use Cases

- **Device migration**: Transfer accounts to a new device
- **Backup**: Create periodic backups of your accounts
- **Multi-device**: Share accounts across multiple devices (securely)
- **Recovery**: Restore accounts after data loss

## Technical Details

### Encryption

- **Algorithm**: AES-256 (via CryptoJS)
- **Mode**: Default CryptoJS mode (CBC with PBKDF2)
- **Key Derivation**: PBKDF2 from passphrase
- **Format**: Base64-encoded ciphertext

### File Handling

- **Character Encoding**: UTF-8
- **Line Endings**: Universal (handles CRLF/LF)
- **CSV Escaping**: Proper handling of commas and quotes in account names
- **File Size**: Lightweight (typically <10KB for 50 accounts)

### Validation

- **Passphrase**: Minimum 8 characters enforced
- **CSV Structure**: Validates header row presence
- **Decryption**: Verifies passphrase before importing
- **Account Data**: Checks for required fields (name, secret)

## Error Messages

| Error | Meaning | Solution |
| ------- | --------- | ---------- |
| "No accounts to export" | No accounts available | Add accounts first |
| "Passphrase must be at least 8 characters" | Passphrase too short | Use longer passphrase |
| "Please select a CSV file" | Wrong file type | Select .csv file |
| "Invalid CSV format" | Malformed CSV | Use exported CSV file |
| "Invalid passphrase" | Wrong passphrase | Check passphrase |
| "Failed to decrypt" | Decryption error | Verify passphrase |

## Example Workflow

### Backup Before Device Change

1. Open SHIELD Authenticator on old device
2. Settings → Export to CSV
3. Passphrase: "MyStr0ng!Backup2026"
4. Save file: shield-authenticator-accounts-2026-01-05.csv
5. Transfer file securely (encrypted USB, secure cloud)
6. Install SHIELD Authenticator on new device
7. Login with your account
8. Settings → Import from CSV
9. Select: shield-authenticator-accounts-2026-01-05.csv
10. Enter same passphrase: "MyStr0ng!Backup2026"
11. ✅ All accounts restored!

## Troubleshooting

### Import fails with "Invalid passphrase"

- Double-check passphrase (case-sensitive)
- Ensure using same passphrase from export
- Try typing instead of pasting

### Some accounts failed to import

- Check browser console for specific errors
- Verify CSV file isn't corrupted
- Try exporting and re-importing

### Export button disabled

- Ensure you have at least one account
- Check that you're logged in
- Refresh page if necessary

## Support

For issues or questions:

- Check console logs (F12 → Console)
- Verify file format matches specification
- Ensure passphrase meets requirements

---

**Copyright © 2026 SHIELD Intelligence. All rights reserved.**

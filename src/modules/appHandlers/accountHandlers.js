import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import { addAccount, updateAccount, deleteAccount } from "../../Utils/services";
import { handleError } from "../../Utils/networkUtils";

export function createAccountHandlers({
  user,
  editing,
  setEditing,
  form,
  setForm,
  vaultUnlocked,
  setShowDelete,
  loadAccounts,
}) {
  const saveAccountDirect = async (name, secret) => {
    const trimmedName = (name || "").trim();
    const trimmedSecret = (secret || "").trim();

    if (!trimmedName && !trimmedSecret) return toast.error("Please enter account name and secret");
    if (!trimmedName) return toast.error("Please enter account name");
    if (!trimmedSecret) return toast.error("Please enter secret");

    if (!vaultUnlocked) {
      toast.error("Vault is locked. Please unlock to make changes.");
      return;
    }

    try {
      if (editing) {
        await updateAccount(user, editing, { name: trimmedName, secret: trimmedSecret });
        toast.success("Account updated!");
        setEditing(null);
      } else {
        await addAccount(user, trimmedName, trimmedSecret);
        toast.success("Account added!");
      }
      setForm({ name: "", secret: "" });
      loadAccounts(user);
    } catch (err) {
      const errorMsg = handleError(err, "Failed to save account");
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const handleSave = async () => saveAccountDirect(form.name, form.secret);

  const handleImportAccounts = async (importedAccounts) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    if (!vaultUnlocked) {
      toast.error("Vault is locked. Please unlock to import accounts.");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const account of importedAccounts) {
      try {
        await addAccount(user, account.name, account.secret);
        successCount++;
      } catch (err) {
        console.error("Failed to import account:", account.name, err);
        failCount++;
      }
    }

    await loadAccounts(user);

    if (failCount > 0) {
      toast.warning(`Imported ${successCount} of ${importedAccounts.length} accounts`);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.info("Copied!");
  };

  const handleDelete = async (id) => {
    if (!vaultUnlocked) {
      toast.error("Vault is locked. Please unlock to make changes.");
      return;
    }

    try {
      await deleteAccount(user, id);
      toast.info("Account deleted");
      loadAccounts(user);
      setShowDelete(null);
    } catch (err) {
      const errorMsg = handleError(err, "Failed to delete account");
      toast.error(errorMsg);
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      const text = typeof result === "string" ? result : result?.data;

      if (!text || !text.startsWith("otpauth://totp/")) {
        toast.error("Invalid QR code format");
        return;
      }

      const url = new URL(text);
      const name = decodeURIComponent(url.pathname.slice(1));
      const secret = url.searchParams.get("secret");

      if (!name || !secret) {
        toast.error("QR missing secret or name");
        return;
      }

      setForm({ name, secret });
      saveAccountDirect(name, secret);
      toast.success(`QR code for ${name} added!`);
    } catch (err) {
      console.error("QR scan error:", err);
      toast.error("Could not read QR code. Make sure the image is clear.");
    }
  };

  return {
    handleSave,
    handleImportAccounts,
    handleCopy,
    handleDelete,
    handleQRUpload,
  };
}

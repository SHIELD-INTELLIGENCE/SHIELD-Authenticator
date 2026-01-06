// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";
import AccountItem from "./AccountItem";

function AccountList({ accounts, codes, countdowns, handleCopy, maskCodes, setEditing, setForm, setShowDelete, showDelete, handleDelete, openConfirm, searchQuery, totalAccounts }) {
  // Show empty state if no accounts after filtering
  if (accounts.length === 0 && totalAccounts > 0) {
    return (
      <div className="accountList">
        <div className="no-results">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <h3>No accounts found</h3>
          <p>No accounts match "{searchQuery}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accountList">
      {accounts.map((acc) => (
        <AccountItem
          key={acc.id}
          acc={acc}
          codes={codes}
          countdowns={countdowns}
          handleCopy={handleCopy}
          maskCodes={maskCodes}
          setEditing={setEditing}
          setForm={setForm}
          setShowDelete={setShowDelete}
          showDelete={showDelete}
          handleDelete={handleDelete}
          openConfirm={openConfirm}
        />
      ))}
    </div>
  );
}

export default AccountList;

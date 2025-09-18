// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import React from "react";
import AccountItem from "./AccountItem";

function AccountList({ accounts, codes, countdowns, handleCopy, setEditing, setForm, setShowDelete, showDelete, handleDelete }) {
  return (
    <div className="accountList">
      {accounts.map((acc) => (
        <AccountItem
          key={acc.id}
          acc={acc}
          codes={codes}
          countdowns={countdowns}
          handleCopy={handleCopy}
          setEditing={setEditing}
          setForm={setForm}
          setShowDelete={setShowDelete}
          showDelete={showDelete}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default AccountList;

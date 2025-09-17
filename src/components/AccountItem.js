import React from "react";

function AccountItem({
  acc,
  codes,
  countdowns,
  handleCopy,
  setEditing,
  setForm,
  setShowDelete,
  showDelete,
  handleDelete,
}) {
  return (
    <div className="accountItem">
      <span className="accountName">{acc.name}</span>
      <span className={`accountCode ${countdowns[acc.id] < 5 ? "pulse" : ""}`}>
        {codes[acc.id] ?? "000000"}
      </span>
      <div className="accountActions">
        <button
          className="bw-btn"
          onClick={() => handleCopy(codes[acc.id] ?? "000000")}
        >
          Copy
        </button>
        <button
          className="bw-btn"
          onClick={() => {
            setEditing(acc.id);
            setForm({ name: acc.name, secret: acc.secret });
          }}
        >
          Edit
        </button>
        {showDelete === acc.id ? (
          <>
            <button
              className="bw-btn danger"
              onClick={() => handleDelete(acc.id)}
            >
              Confirm Delete
            </button>
            <button className="bw-btn" onClick={() => setShowDelete(null)}>
              Cancel
            </button>
          </>
        ) : (
          <button
            className="bw-btn danger"
            onClick={() => setShowDelete(acc.id)}
          >
            Delete
          </button>
        )}
      </div>
      <div className="countdown">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              "--progress": `${((countdowns[acc.id] ?? 0) / 30) * 100}%`,
            }}
          />
        </div>
        <p>{countdowns[acc.id] ?? 0}s</p>
      </div>
    </div>
  );
}

export default AccountItem;

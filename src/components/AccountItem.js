// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import React, { useRef, useEffect, useState } from "react";

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
  openConfirm,
}) {
  const nameRef = useRef(null);
  const [shouldGlide, setShouldGlide] = useState(false);

  // Split provider and display name if stored as "Provider:email" or similar
  const rawName = acc.name || "";
  const splitIdx = rawName.indexOf(":");
  const provider = splitIdx > -1 ? rawName.slice(0, splitIdx).trim() : null;
  const displayName = splitIdx > -1 ? rawName.slice(splitIdx + 1).trim() : rawName;

  useEffect(() => {
    const checkTextOverflow = () => {
      if (nameRef.current) {
        const element = nameRef.current;
        const isOverflowing = element.scrollWidth > element.clientWidth;
        setShouldGlide(isOverflowing);
      }
    };

    checkTextOverflow();
    window.addEventListener('resize', checkTextOverflow);
    
    return () => {
      window.removeEventListener('resize', checkTextOverflow);
    };
  }, [acc.name]);

  return (
  <div className="accountItem">
    <div className="accountName">
      {provider && (
        <div className="accountProvider">{provider}</div>
      )}
      <span ref={nameRef} className={shouldGlide ? "glide" : ""}>
        {displayName}
      </span>
    </div>

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
      <>
        <button
          className="bw-btn danger"
          onClick={() => {
            // open centralized confirm dialog
            if (openConfirm) {
              openConfirm({
                title: 'Delete account',
                message: `Are you sure you want to delete ${acc.name}? This action cannot be undone.`,
                onConfirm: () => handleDelete(acc.id),
              });
            } else {
              // Fallback to previous behaviour
              setShowDelete(acc.id);
            }
          }}
        >
          Delete
        </button>
      </>
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

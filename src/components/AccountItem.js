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
}) {
  const nameRef = useRef(null);
  const [shouldGlide, setShouldGlide] = useState(false);

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
    <div className="accountName" ref={nameRef}>
      <span className={shouldGlide ? "glide" : ""}>
        {acc.name}
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

// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useRef, useEffect, useState } from "react";
import { getProviderLogoUrl } from "../Utils/providerLogos";

function AccountItem({
  acc,
  codes,
  countdowns,
  handleCopy,
  maskCodes,
  showProviderLogos,
  setEditing,
  setForm,
  setShowDelete,
  showDelete,
  handleDelete,
  openConfirm,
}) {
  const nameRef = useRef(null);
  const [shouldGlide, setShouldGlide] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef(null);
  const longPressTimer = useRef(null);

  const rawName = acc.name || "";
  const splitIdx = rawName.indexOf(":");
  const provider = splitIdx > -1 ? rawName.slice(0, splitIdx).trim() : null;
  const displayName = splitIdx > -1 ? rawName.slice(splitIdx + 1).trim() : rawName;
  const providerLogoUrl = showProviderLogos && provider
    ? getProviderLogoUrl({ provider, displayName, rawName })
    : "";

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

  useEffect(() => {
    setLogoFailed(false);
  }, [providerLogoUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        setKebabOpen(false);
      }
    };
    if (kebabOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [kebabOpen]);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setKebabOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleEdit = () => {
    setKebabOpen(false);
    setEditing(acc.id);
    setForm({ name: acc.name, secret: acc.secret });
  };

  const handleDeleteClick = () => {
    setKebabOpen(false);
    if (openConfirm) {
      openConfirm({
        title: 'Delete account',
        message: (
          <div style={{ textAlign: 'center' }}>
            Are you sure you want to delete {acc.name}? This action cannot be undone.
          </div>
        ),
        onConfirm: () => handleDelete(acc.id),
      });
    } else {
      setShowDelete(acc.id);
    }
  };

  return (
  <div
    className="accountItem"
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    onTouchMove={handleTouchEnd}
  >
    <div className="accountName">
      {providerLogoUrl && !logoFailed && (
        <div className="providerLogoBadge">
          <img
            src={providerLogoUrl}
            alt={`${provider || "Provider"} logo`}
            className="providerLogo"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setLogoFailed(true)}
          />
        </div>
      )}
      {provider && <div className="accountProvider">{provider}</div>}
      <span ref={nameRef} className={shouldGlide ? "glide" : ""}>
        {displayName}
      </span>
    </div>

    <div className="accountCodeRow">
      <span
        className={`accountCode ${countdowns[acc.id] < 5 ? "pulse" : ""}`}
      >
        {maskCodes ? "******" : (codes[acc.id] ?? "000000")}
      </span>

      <button
        className="card-copy-btn"
        onClick={() => handleCopy(codes[acc.id] ?? "000000")}
        title="Copy code"
        aria-label="Copy code"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
        </svg>
      </button>

      <div className="kebab-wrapper" ref={kebabRef}>
        <button
          className="kebab-button"
          onClick={() => setKebabOpen(!kebabOpen)}
          aria-label="Account actions"
          aria-expanded={kebabOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {kebabOpen && (
          <div className="kebab-menu kebab-dropup">
            <button className="kebab-menu-item" onClick={handleEdit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              Edit
            </button>
            <button className="kebab-menu-item kebab-menu-item-danger" onClick={handleDeleteClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
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

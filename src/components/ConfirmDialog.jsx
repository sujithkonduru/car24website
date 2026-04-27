import { useEffect } from "react";

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = "Delete", onConfirm, onCancel, danger = true }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon-wrap ${danger ? "danger" : "warn"}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 className="confirm-title">{title || "Confirm Action"}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={() => { onConfirm(); onCancel(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

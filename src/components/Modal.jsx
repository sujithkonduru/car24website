import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, content, data, onSave, renderContent }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children || (renderContent ? renderContent() : (
            <>
              {data && (
                <pre>{JSON.stringify(data, null, 2)}</pre>
              )}
              <p>Modal content for {content}</p>
            </>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {onSave && <button className="btn-primary" onClick={() => onSave?.(data)}>Save</button>}
        </div>
      </div>
    </div>
  );
}
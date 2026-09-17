import "./Modal.css";

export default function Modal({ children, onClose, dismissible = true }) {
  return (
    <div className="modal-backdrop" onClick={dismissible ? onClose : undefined}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {dismissible && (
          <button className="modal-close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

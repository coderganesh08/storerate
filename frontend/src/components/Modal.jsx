import { useEffect, useRef } from 'react';

// Built on the native <dialog> element, which gives us the backdrop, focus trapping and
// the Escape key for free. Children are only rendered while open, so any form inside
// starts empty every time the modal is opened.
export default function Modal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleCancel(event) {
    event.preventDefault(); // let React state decide when it closes
    onClose();
  }

  // The dialog has no padding, so a mousedown on the dialog element itself is a click on the backdrop.
  function handleBackdropMouseDown(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog ref={dialogRef} className="modal" onCancel={handleCancel} onMouseDown={handleBackdropMouseDown}>
      {open && (
        <div className="modal-body">
          <div className="modal-header">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

import { useEffect, useRef, type ReactNode } from 'react';

type DialogSize = 'small' | 'medium';

interface DialogProps {
  children: ReactNode;
  describedBy?: string;
  isOpen: boolean;
  labelledBy: string;
  onClose: () => void;
  size?: DialogSize;
}

const sizeClasses: Record<DialogSize, string> = {
  small: 'max-w-sm',
  medium: 'max-w-md',
};

export function Dialog({
  children,
  describedBy,
  isOpen,
  labelledBy,
  onClose,
  size = 'medium',
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      aria-describedby={describedBy}
      aria-labelledby={labelledBy}
      className={`m-auto w-[calc(100%-2rem)] rounded-2xl bg-surface p-6 shadow-xl backdrop:bg-content/50 ${sizeClasses[size]}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      {children}
    </dialog>
  );
}

export function DialogTitle({ children, id }: { children: ReactNode; id: string }) {
  return (
    <h2 className="text-xl font-semibold text-content" id={id}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, id }: { children: ReactNode; id: string }) {
  return (
    <p className="mt-3 text-sm leading-6 text-content-secondary" id={id}>
      {children}
    </p>
  );
}

export function DialogActions({
  children,
  layout = 'end',
}: {
  children: ReactNode;
  layout?: 'end' | 'equal';
}) {
  return (
    <div
      className={layout === 'equal' ? 'mt-6 grid grid-cols-2 gap-3' : 'mt-6 flex justify-end gap-3'}
    >
      {children}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { Button } from '@/ui/components/Button';

interface ConfirmationDialogProps {
  confirmLabel: string;
  description: string;
  isConfirming?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
}

export function ConfirmationDialog({
  confirmLabel,
  description,
  isConfirming = false,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      aria-describedby="confirmation-description"
      aria-labelledby="confirmation-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 shadow-xl backdrop:bg-slate-950/50"
      onCancel={onCancel}
      ref={dialogRef}
    >
      <h2 className="text-xl font-semibold text-slate-950" id="confirmation-title">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600" id="confirmation-description">
        {description}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button disabled={isConfirming} onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isConfirming} onClick={() => void onConfirm()} type="button">
          {isConfirming ? 'Registrando...' : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

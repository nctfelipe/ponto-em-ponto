import { Button } from '@/ui/components/Button';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '@/ui/components/Dialog';

interface ConfirmationDialogProps {
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  description: string;
  isConfirming?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
}

export function ConfirmationDialog({
  confirmLabel,
  confirmVariant = 'primary',
  description,
  isConfirming = false,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      describedBy="confirmation-description"
      isOpen={isOpen}
      labelledBy="confirmation-title"
      onClose={onCancel}
      size="small"
    >
      <DialogTitle id="confirmation-title">{title}</DialogTitle>
      <DialogDescription id="confirmation-description">{description}</DialogDescription>
      <DialogActions layout="equal">
        <Button disabled={isConfirming} onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button
          disabled={isConfirming}
          onClick={() => void onConfirm()}
          type="button"
          variant={confirmVariant}
        >
          {isConfirming ? 'Registrando...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

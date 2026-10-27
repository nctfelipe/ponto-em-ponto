import { useEffect, useState } from 'react';
import { Button } from '@/ui/components/Button';
import { formatBusinessTime } from '@/ui/formatters/business-time';

interface LiveTimeEntryButtonProps {
  isAvailable: boolean;
  isPeriodClosed: boolean;
  isRegistering: boolean;
  onClick: () => void;
}

export function LiveTimeEntryButton({
  isAvailable,
  isPeriodClosed,
  isRegistering,
  onClick,
}: LiveTimeEntryButtonProps) {
  const [currentTime, setCurrentTime] = useState(() => formatBusinessTime(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(formatBusinessTime(new Date()));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <Button
      className="w-full"
      disabled={!isAvailable || isRegistering}
      onClick={onClick}
      size="large"
      type="button"
    >
      {isAvailable
        ? `Registrar ponto · ${currentTime}`
        : isPeriodClosed
          ? 'Mês fechado'
          : 'Registros do dia concluídos'}
    </Button>
  );
}

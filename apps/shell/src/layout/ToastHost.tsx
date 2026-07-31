import { useCallback, useState } from 'react';
import Toast from 'ds/Toast';
import { TYPE_LABELS, formatCents, useFindashEvent } from '@findash/domain';

const TOAST_DURATION_MS = 4000;

type ToastItem = { id: string; message: string };

// RF-S5: o shell reage aos eventos findash:* de QUALQUER MFE — sem importar
// nada deles. O acoplamento é só o contrato de eventos do domínio.
export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((all) => [...all, { id, message }]);
    setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), TOAST_DURATION_MS);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  useFindashEvent(
    'findash:transaction-added',
    useCallback(
      ({ transaction }) =>
        push(
          `${TYPE_LABELS[transaction.type]} "${transaction.description}" criada — ${formatCents(
            transaction.amountCents,
          )}`,
        ),
      [push],
    ),
  );

  useFindashEvent(
    'findash:goal-contribution',
    useCallback(
      ({ amountCents }) => push(`Aporte de ${formatCents(amountCents)} registrado! 🎯`),
      [push],
    ),
  );

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 grid gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} variant="success" onClose={() => dismiss(t.id)}>
          {t.message}
        </Toast>
      ))}
    </div>
  );
}

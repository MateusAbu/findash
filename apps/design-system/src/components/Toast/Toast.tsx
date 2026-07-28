import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

const toastVariants = cva(
  'pointer-events-auto flex w-80 items-start gap-3 rounded-control border-l-4 border border-border bg-surface px-4 py-3 text-sm text-text shadow-lg',
  {
    variants: {
      variant: {
        info: 'border-l-primary',
        success: 'border-l-success',
        error: 'border-l-error',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

export type ToastProps = ComponentProps<'div'> &
  VariantProps<typeof toastVariants> & {
    onClose?: () => void;
  };

// Componente APRESENTACIONAL: posicionamento, fila e auto-dismiss são do
// consumidor (o shell monta o gerenciador global na T-5.2, via Custom Events).
// role="status": anunciado educadamente por leitores de tela, sem interromper.
export function Toast({ className, variant, onClose, children, ...props }: ToastProps) {
  return (
    <div role="status" className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          aria-label="Fechar notificação"
          onClick={onClose}
          className="rounded-control text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Toast;

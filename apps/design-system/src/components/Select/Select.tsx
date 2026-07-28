import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type SelectProps = ComponentProps<'select'> & {
  invalid?: boolean;
};

// Select nativo estilizado: teclado, mobile e leitores de tela de graça.
// Custom dropdown só quando UX exigir busca/multi — não é o caso do FinDash.
export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50',
        invalid && 'border-error focus-visible:outline-error',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;

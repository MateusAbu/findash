import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type InputProps = ComponentProps<'input'> & {
  /** Marca o campo como inválido: aria-invalid + borda de erro, sempre juntos. */
  invalid?: boolean;
};

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50',
        invalid && 'border-error focus-visible:outline-error',
        className,
      )}
      {...props}
    />
  );
}

export default Input;

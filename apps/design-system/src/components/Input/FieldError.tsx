import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type FieldErrorProps = ComponentProps<'p'>;

// Dê um id e referencie no input via aria-describedby: o leitor de tela lê o
// erro ao focar o campo. role="alert" anuncia erros que surgem dinamicamente.
export function FieldError({ className, children, ...props }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p role="alert" className={cn('mt-1.5 text-sm text-error', className)} {...props}>
      {children}
    </p>
  );
}

export default FieldError;

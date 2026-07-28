import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type LabelProps = ComponentProps<'label'>;

// Use sempre com htmlFor apontando para o id do campo — é o vínculo que faz
// leitores de tela anunciarem o rótulo e o clique no texto focar o input.
export function Label({ className, ...props }: LabelProps) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-text', className)} {...props} />
  );
}

export default Label;

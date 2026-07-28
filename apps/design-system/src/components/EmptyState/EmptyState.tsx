import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type EmptyStateProps = ComponentProps<'div'> & {
  title: string;
  description?: string;
  /** Ação sugerida (normalmente um <Button>). */
  action?: ReactNode;
};

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      <p className="font-medium text-text">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;

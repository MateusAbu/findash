import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type CardProps = ComponentProps<'section'> & {
  /** Conteúdo do topo (título, ações). Omitido = sem header. */
  header?: ReactNode;
  /** Conteúdo do rodapé (ações, links). Omitido = sem footer. */
  footer?: ReactNode;
};

export function Card({ header, footer, className, children, ...props }: CardProps) {
  return (
    <section
      className={cn('rounded-card border border-border bg-surface text-text', className)}
      {...props}
    >
      {header && (
        <header className="border-b border-border px-6 py-4 font-semibold">{header}</header>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <footer className="border-t border-border px-6 py-4 text-sm text-text-muted">
          {footer}
        </footer>
      )}
    </section>
  );
}

export default Card;

import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type SkeletonProps = ComponentProps<'div'>;

// Dimensione via className: <Skeleton className="h-4 w-40" />.
// aria-hidden: placeholder visual não deve ser anunciado por leitores de tela.
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-control bg-border', className)}
      {...props}
    />
  );
}

export default Skeleton;

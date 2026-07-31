import type { ComponentProps } from 'react';

export default function FieldError({ children, ...props }: ComponentProps<'p'>) {
  if (!children) return null;
  return (
    <p role="alert" {...props}>
      {children}
    </p>
  );
}

import type { ComponentProps } from 'react';

type Props = ComponentProps<'select'> & { invalid?: boolean };

export default function Select({ invalid, children, ...props }: Props) {
  return (
    <select aria-invalid={invalid || undefined} {...props}>
      {children}
    </select>
  );
}

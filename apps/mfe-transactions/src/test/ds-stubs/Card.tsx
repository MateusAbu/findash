import type { ComponentProps, ReactNode } from 'react';

type Props = ComponentProps<'section'> & { header?: ReactNode; footer?: ReactNode };

export default function Card({ header, footer, children, ...props }: Props) {
  return (
    <section {...props}>
      {header}
      {children}
      {footer}
    </section>
  );
}

import type { ComponentProps } from 'react';

type Props = ComponentProps<'input'> & { invalid?: boolean };

export default function Input({ invalid, ...props }: Props) {
  return <input aria-invalid={invalid || undefined} {...props} />;
}

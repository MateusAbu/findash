import type { ComponentProps } from 'react';

type Props = ComponentProps<'button'> & { variant?: string; size?: string };

// Stub do ds/Button: comportamento nativo, sem estilo (variant/size descartados).
export default function Button({ variant: _v, size: _s, type = 'button', ...props }: Props) {
  return <button type={type} {...props} />;
}

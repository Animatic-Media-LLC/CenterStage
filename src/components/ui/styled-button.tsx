'use client';

import { Button } from '@/components/ui/button';
import { ButtonProps } from '@/components/ui/button';

interface StyledButtonProps extends ButtonProps {
  hoverBackground?: string;
  defaultBackground?: string;
}

export function StyledButton({
  hoverBackground,
  defaultBackground,
  style,
  children,
  ...props
}: StyledButtonProps) {
  return (
    <Button
      {...props}
      style={{ background: defaultBackground, ...style }}
      onMouseEnter={(e) => {
        if (hoverBackground) {
          e.currentTarget.style.background = hoverBackground;
        }
      }}
      onMouseLeave={(e) => {
        if (defaultBackground) {
          e.currentTarget.style.background = defaultBackground;
        }
      }}
    >
      {children}
    </Button>
  );
}

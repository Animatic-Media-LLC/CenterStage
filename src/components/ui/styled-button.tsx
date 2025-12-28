'use client';

import Button from '@mui/material/Button';
import { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';

interface StyledButtonProps extends Omit<MuiButtonProps, 'sx'> {
  hoverBackground?: string;
  defaultBackground?: string;
  sx?: SxProps<Theme>;
}

export function StyledButton({
  hoverBackground,
  defaultBackground,
  style,
  sx,
  children,
  ...props
}: StyledButtonProps) {
  const combinedSx: SxProps<Theme> = {
    ...(sx || {}),
    ...(hoverBackground && {
      '&:hover': {
        background: hoverBackground,
      },
    }),
  };

  return (
    <Button
      {...props}
      sx={combinedSx}
      style={{ background: defaultBackground, ...style }}
    >
      {children}
    </Button>
  );
}

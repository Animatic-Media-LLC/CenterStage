'use client';

import * as React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';

// Map our variant names to MUI variants
const variantMap = {
  default: 'contained' as const,
  destructive: 'contained' as const,
  outline: 'outlined' as const,
  secondary: 'outlined' as const,
  ghost: 'text' as const,
  link: 'text' as const,
};

// Map our size names to MUI sizes
const sizeMap = {
  default: 'medium' as const,
  sm: 'small' as const,
  lg: 'large' as const,
  icon: 'medium' as const,
};

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', color, sx, children, ...props }, ref) => {
    // Handle icon-only buttons
    if (size === 'icon') {
      return (
        <IconButton
          ref={ref}
          color={variant === 'destructive' ? 'error' : color}
          size={sizeMap[size]}
          sx={sx}
          {...(props as IconButtonProps)}
        >
          {children}
        </IconButton>
      );
    }

    // Determine MUI color based on variant
    let muiColor = color;
    if (variant === 'destructive') {
      muiColor = 'error';
    } else if (variant === 'default') {
      muiColor = 'primary';
    } else if (variant === 'secondary') {
      muiColor = 'secondary';
    }

    return (
      <MuiButton
        ref={ref}
        variant={variantMap[variant]}
        size={sizeMap[size]}
        color={muiColor}
        sx={{
          ...(variant === 'link' && {
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'underline',
            },
          }),
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };

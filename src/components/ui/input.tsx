'use client';

import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

export type InputProps = Omit<TextFieldProps, 'variant'> & {
  className?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        type={type}
        variant="outlined"
        size="small"
        fullWidth
        {...props}
        sx={{
          ...props.sx,
        }}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };

'use client';

import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

export type TextareaProps = Omit<TextFieldProps, 'multiline' | 'variant'> & {
  className?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        multiline
        minRows={3}
        variant="outlined"
        size="small"
        fullWidth
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };

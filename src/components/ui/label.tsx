'use client';

import * as React from 'react';
import FormLabel, { FormLabelProps } from '@mui/material/FormLabel';

export type LabelProps = FormLabelProps & {
  className?: string;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <FormLabel
        ref={ref}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

export { Label };

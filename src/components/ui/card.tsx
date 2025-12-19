'use client';

import * as React from 'react';
import MuiCard, { CardProps as MuiCardProps } from '@mui/material/Card';
import MuiCardHeader, { CardHeaderProps as MuiCardHeaderProps } from '@mui/material/CardHeader';
import MuiCardContent, { CardContentProps as MuiCardContentProps } from '@mui/material/CardContent';
import MuiCardActions, { CardActionsProps as MuiCardActionsProps } from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

// Card wrapper
const Card = React.forwardRef<HTMLDivElement, MuiCardProps>(
  (props, ref) => <MuiCard ref={ref} {...props} />
);
Card.displayName = 'Card';

// CardHeader wrapper - supports both title prop and children
interface CardHeaderProps extends Omit<MuiCardHeaderProps, 'title'> {
  title?: React.ReactNode;
  children?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, title, ...props }, ref) => {
    // If children are provided, render them directly
    if (children) {
      return (
        <MuiCardHeader
          ref={ref}
          title={children}
          {...props}
        />
      );
    }
    // Otherwise use title prop
    return (
      <MuiCardHeader
        ref={ref}
        title={title}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'CardHeader';

// CardTitle component (for compatibility with existing code)
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => (
  <Typography variant="h3" component="h3" ref={ref} {...props}>
    {children}
  </Typography>
));
CardTitle.displayName = 'CardTitle';

// CardDescription component (for subheaders)
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => (
  <Typography variant="body2" color="text.secondary" ref={ref} {...props}>
    {children}
  </Typography>
));
CardDescription.displayName = 'CardDescription';

// CardContent wrapper
const CardContent = React.forwardRef<HTMLDivElement, MuiCardContentProps>(
  (props, ref) => <MuiCardContent ref={ref} {...props} />
);
CardContent.displayName = 'CardContent';

// CardFooter wrapper (using CardActions)
const CardFooter = React.forwardRef<HTMLDivElement, MuiCardActionsProps>(
  (props, ref) => <MuiCardActions ref={ref} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

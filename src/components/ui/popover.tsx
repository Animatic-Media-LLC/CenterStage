'use client';

import * as React from 'react';
import MuiPopover, { PopoverProps as MuiPopoverProps } from '@mui/material/Popover';

// Context to share state between Popover components
interface PopoverContextValue {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
  open: boolean;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

export interface PopoverProps {
  children?: React.ReactNode;
}

// Main Popover component - manages state
const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <PopoverContext.Provider value={{ anchorEl, setAnchorEl, open }}>
      {children}
    </PopoverContext.Provider>
  );
};

// Popover trigger - the element that opens the popover
const PopoverTrigger = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('PopoverTrigger must be used within a Popover');
  }

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    context.setAnchorEl(event.currentTarget);
    onClick?.(event);
  };

  if (asChild && React.isValidElement(children)) {
    // For asChild mode, just add the onClick handler without ref
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }
  return (
    <span ref={ref} onClick={handleClick} {...props}>
      {children}
    </span>
  );
});
PopoverTrigger.displayName = 'PopoverTrigger';

// Popover content - the actual popover content
interface PopoverContentProps extends Omit<MuiPopoverProps, 'open' | 'anchorEl' | 'onClose'> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  className?: string;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, align = 'center', side = 'bottom', sideOffset = 4, className, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context) {
      throw new Error('PopoverContent must be used within a Popover');
    }

    const handleClose = () => {
      context.setAnchorEl(null);
    };

    // Convert align to MUI's anchorOrigin
    const getAnchorOrigin = () => {
      const horizontal = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
      const vertical = side === 'top' ? 'top' : 'bottom';
      return { vertical, horizontal } as const;
    };

    const getTransformOrigin = () => {
      const horizontal = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
      const vertical = side === 'top' ? 'bottom' : 'top';
      return { vertical, horizontal } as const;
    };

    return (
      <MuiPopover
        ref={ref}
        open={context.open}
        anchorEl={context.anchorEl}
        onClose={handleClose}
        anchorOrigin={getAnchorOrigin()}
        transformOrigin={getTransformOrigin()}
        {...props}
        sx={{
          '& .MuiPopover-paper': {
            mt: side === 'bottom' ? `${sideOffset}px` : undefined,
            mb: side === 'top' ? `${sideOffset}px` : undefined,
            ml: side === 'right' ? `${sideOffset}px` : undefined,
            mr: side === 'left' ? `${sideOffset}px` : undefined,
          },
          ...props.sx,
        }}
      >
        <div className={className}>{children}</div>
      </MuiPopover>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };

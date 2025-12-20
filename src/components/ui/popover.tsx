'use client';

import * as React from 'react';
import MuiPopover from '@mui/material/Popover';

interface PopoverContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within a Popover');
  }
  return context;
}

interface PopoverProps {
  children: React.ReactNode;
}

export function Popover({ children }: PopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const onOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setAnchorEl(null);
    }
  }, []);

  const value = React.useMemo(
    () => ({ open, onOpenChange, anchorEl, setAnchorEl }),
    [open, onOpenChange, anchorEl]
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

interface PopoverTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export function PopoverTrigger({ children, asChild }: PopoverTriggerProps) {
  const { onOpenChange, setAnchorEl } = usePopoverContext();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as any);
  }

  return <div onClick={handleClick}>{children}</div>;
}

interface PopoverContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
}

export function PopoverContent({ children, align = 'center', className }: PopoverContentProps) {
  const { open, onOpenChange, anchorEl } = usePopoverContext();

  const anchorOrigin = React.useMemo(() => {
    const horizontal: 'left' | 'center' | 'right' = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
    return {
      vertical: 'bottom' as const,
      horizontal,
    };
  }, [align]);

  const transformOrigin = React.useMemo(() => {
    const horizontal: 'left' | 'center' | 'right' = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
    return {
      vertical: 'top' as const,
      horizontal,
    };
  }, [align]);

  return (
    <MuiPopover
      open={open}
      anchorEl={anchorEl}
      onClose={() => onOpenChange(false)}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          className: className,
          sx: {
            mt: 1,
            p: 2,
            borderRadius: 1,
            boxShadow: 3,
          },
        },
      }}
    >
      {children}
    </MuiPopover>
  );
}

'use client';

import * as React from 'react';
import MuiDialog, { DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import { X } from 'lucide-react';
import Box from '@mui/material/Box';

export interface DialogProps extends Omit<MuiDialogProps, 'onClose'> {
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

// Main Dialog component with backward compatibility
const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  onClose,
  children,
  ...props
}) => {
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <MuiDialog open={open || false} onClose={handleClose} {...props}>
      {children}
    </MuiDialog>
  );
};

// Dialog content with close button
const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof MuiDialogContent>>(
  ({ children, ...props }, ref) => (
    <MuiDialogContent ref={ref} {...props}>
      {children}
    </MuiDialogContent>
  )
);
DialogContent.displayName = 'DialogContent';

// Dialog title with close button
const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof MuiDialogTitle> & { onClose?: () => void }>(
  ({ children, onClose, ...props }, ref) => (
    <MuiDialogTitle ref={ref} {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {children}
        {onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ ml: 2 }}
            size="small"
          >
            <X className="h-4 w-4" />
          </IconButton>
        )}
      </Box>
    </MuiDialogTitle>
  )
);
DialogTitle.displayName = 'DialogTitle';

// Dialog actions (footer)
const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof MuiDialogActions>>(
  (props, ref) => <MuiDialogActions ref={ref} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

// Dialog description
const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof DialogContentText>>(
  (props, ref) => <DialogContentText ref={ref} {...props} />
);
DialogDescription.displayName = 'DialogDescription';

// Dialog header (for grouping title and description)
const DialogHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Box {...props}>{children}</Box>
);
DialogHeader.displayName = 'DialogHeader';

// For backward compatibility
const DialogTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogClose = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogOverlay = () => null;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

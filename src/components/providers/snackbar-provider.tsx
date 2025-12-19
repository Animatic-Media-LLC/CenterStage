'use client';

import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';

interface SnackbarMessage {
  message: string;
  severity: AlertColor;
  key: number;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const SnackbarContext = React.createContext<SnackbarContextValue | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackPack, setSnackPack] = React.useState<readonly SnackbarMessage[]>([]);
  const [open, setOpen] = React.useState(false);
  const [messageInfo, setMessageInfo] = React.useState<SnackbarMessage | undefined>(undefined);

  React.useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  const showSnackbar = React.useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackPack((prev) => [...prev, { message, severity, key: new Date().getTime() }]);
  }, []);

  const success = React.useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const error = React.useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const warning = React.useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const info = React.useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, success, error, warning, info }}>
      {children}
      <Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={messageInfo?.severity} sx={{ width: '100%' }}>
          {messageInfo?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = React.useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

// Export a toast-compatible API for backward compatibility
export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snackbar', { detail: { message, severity: 'success' } }));
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snackbar', { detail: { message, severity: 'error' } }));
    }
  },
  warning: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snackbar', { detail: { message, severity: 'warning' } }));
    }
  },
  info: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snackbar', { detail: { message, severity: 'info' } }));
    }
  },
};

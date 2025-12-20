'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useSnackbar as useMuiSnackbar, SnackbarProvider as MuiSnackbarProvider } from 'notistack';

interface SnackbarContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiSnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={3000}
    >
      <SnackbarContextProvider>{children}</SnackbarContextProvider>
    </MuiSnackbarProvider>
  );
}

function SnackbarContextProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useMuiSnackbar();

  const success = useCallback(
    (message: string) => {
      enqueueSnackbar(message, { variant: 'success' });
    },
    [enqueueSnackbar]
  );

  const error = useCallback(
    (message: string) => {
      enqueueSnackbar(message, { variant: 'error' });
    },
    [enqueueSnackbar]
  );

  const info = useCallback(
    (message: string) => {
      enqueueSnackbar(message, { variant: 'info' });
    },
    [enqueueSnackbar]
  );

  const warning = useCallback(
    (message: string) => {
      enqueueSnackbar(message, { variant: 'warning' });
    },
    [enqueueSnackbar]
  );

  const value = {
    success,
    error,
    info,
    warning,
  };

  return <SnackbarContext.Provider value={value}>{children}</SnackbarContext.Provider>;
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from '@/lib/theme/mui-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={adminTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

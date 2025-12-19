import { createTheme } from '@mui/material/styles';

// Admin Theme (Professional)
export const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue-600
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280', // Gray-500
      light: '#9ca3af',
      dark: '#4b5563',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626', // Red-600
      light: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      main: '#f59e0b', // Amber-500
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981', // Green-500
      light: '#34d399',
      dark: '#059669',
    },
    info: {
      main: '#3b82f6', // Blue-500
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f9fafb', // Gray-50
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // Gray-900
      secondary: '#6b7280', // Gray-500
    },
    divider: '#e5e7eb', // Gray-200
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 6,
  },
  spacing: 8, // 8px base spacing
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem', // rounded-md
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1d4ed8',
          },
        },
        sizeSmall: {
          padding: '0.375rem 0.75rem',
          fontSize: '0.875rem',
        },
        sizeMedium: {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.375rem',
          },
        },
      },
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // rounded-lg
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '1rem 1.5rem',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 600,
        },
        subheader: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1.5rem',
          '&:last-child': {
            paddingBottom: '1.5rem',
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.5rem',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 600,
          padding: '1.5rem',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '1.5rem',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '1rem 1.5rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // rounded-full
          fontWeight: 500,
        },
        sizeSmall: {
          fontSize: '0.75rem',
          height: '24px',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            width: 20,
            height: 20,
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          borderRight: '1px solid #e5e7eb',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',
          margin: '0.125rem 0',
          '&.Mui-selected': {
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            '&:hover': {
              backgroundColor: '#dbeafe',
            },
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: '0.5rem',
          },
        },
      },
    },
  },
});

// Public Theme (User-friendly, mobile-first)
export const publicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280',
      light: '#9ca3af',
      dark: '#4b5563',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          fontSize: '1rem',
          padding: '0.75rem 1.5rem',
          fontWeight: 500,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'medium',
        variant: 'outlined',
      },
    },
  },
});

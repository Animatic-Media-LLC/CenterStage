'use client';

import * as React from 'react';
import MuiSelect, { SelectProps as MuiSelectProps, SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';

// Export MenuItem for use with Select
export { MenuItem };

// Simple Select wrapper that maintains backward compatibility
export interface SelectProps extends Omit<MuiSelectProps, 'children'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (allProps, ref) => {
    const { label, helperText, error, onValueChange, onChange, children, ...props } = allProps;

    const handleChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
      // Support both MUI's onChange and our custom onValueChange
      if (onChange) {
        onChange(event, child);
      }
      if (onValueChange) {
        onValueChange(event.target.value as string);
      }
    };

    // Extract actual MenuItems from nested Radix-style children
    const extractMenuItems = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        // If this is SelectContent or SelectTrigger, extract their children
        if (child.type === SelectContent || child.type === SelectTrigger) {
          return extractMenuItems((child.props as any).children);
        }

        // If this is SelectItem (MenuItem), return it directly
        if (child.type === MenuItem || child.type === SelectItem) {
          return child;
        }

        // Otherwise, recurse into children
        const childProps = child.props as any;
        if (childProps?.children) {
          return extractMenuItems(childProps.children);
        }

        return child;
      });
    };

    const menuItems = extractMenuItems(children);

    const selectElement = (
      <MuiSelect
        ref={ref as any}
        onChange={handleChange}
        size="small"
        fullWidth
        error={error}
        {...props}
      >
        {menuItems}
      </MuiSelect>
    );

    // If label or helperText provided, wrap in FormControl
    if (label || helperText) {
      return (
        <FormControl fullWidth error={error} size="small">
          {label && <FormLabel>{label}</FormLabel>}
          {selectElement}
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
    }

    return selectElement;
  }
);

Select.displayName = 'Select';

export { Select };

// For backward compatibility with Radix-style usage
export const SelectTrigger = ({ children, ...props }: { children?: React.ReactNode; id?: string }) => <>{children}</>;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => null;
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectItem = MenuItem;
export const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <MenuItem disabled>{children}</MenuItem>
);
export const SelectSeparator = () => <MenuItem disabled>─────</MenuItem>;

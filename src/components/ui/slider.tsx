'use client';

import * as React from 'react';
import MuiSlider, { SliderProps as MuiSliderProps } from '@mui/material/Slider';

export interface SliderProps extends MuiSliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  (allProps, ref) => {
    const { value, onValueChange, onChange, ...props } = allProps;

    const handleChange = (event: Event, newValue: number | number[], activeThumb: number) => {
      const valueArray = Array.isArray(newValue) ? newValue : [newValue];

      // Support both MUI's onChange and our custom onValueChange
      if (onChange) {
        onChange(event, newValue, activeThumb);
      }
      if (onValueChange) {
        onValueChange(valueArray);
      }
    };

    // Convert single value array to single value for MUI
    const muiValue = value && value.length === 1 ? value[0] : value;

    return (
      <MuiSlider
        ref={ref}
        value={muiValue}
        onChange={handleChange}
        valueLabelDisplay="auto"
        {...props}
      />
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };

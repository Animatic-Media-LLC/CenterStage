'use client';

import * as React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  className,
  disabled = false,
}: ColorPickerProps) {
  return (
    <Box className={className} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Popover>
        <PopoverTrigger asChild>
          <IconButton
            disabled={disabled}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              border: 2,
              borderColor: 'grey.300',
              backgroundColor: value,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                backgroundColor: value,
              },
              '&:disabled': {
                cursor: 'not-allowed',
                opacity: 0.5,
              },
            }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <HexColorPicker color={value} onChange={onChange} />
          <Box sx={{ mt: 3 }}>
            <FormLabel
              htmlFor="hex-input"
              sx={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Hex Color
            </FormLabel>
            <HexColorInput
              id="hex-input"
              color={value}
              onChange={onChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              prefixed
            />
          </Box>
        </PopoverContent>
      </Popover>
      <Box sx={{ flex: 1 }}>
        <TextField
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          size="small"
          fullWidth
          sx={{
            '& .MuiInputBase-root': {
              height: 40,
            },
          }}
        />
      </Box>
    </Box>
  );
}

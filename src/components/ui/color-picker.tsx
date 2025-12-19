'use client';

import * as React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/cn';

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
    <div className={cn('flex items-center gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'h-10 w-10 rounded-md border-2 border-gray-300 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            style={{ backgroundColor: value }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="mt-3">
            <label
              htmlFor="hex-input"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Hex Color
            </label>
            <HexColorInput
              id="hex-input"
              color={value}
              onChange={onChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              prefixed
            />
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

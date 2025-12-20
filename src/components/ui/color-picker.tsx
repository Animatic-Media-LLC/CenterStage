'use client';

import * as React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import styles from './color-picker.module.scss';

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
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.colorButtonWrapper}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={styles.colorButton}
              style={{ backgroundColor: value }}
              aria-label="Pick a color"
            />
          </PopoverTrigger>
          <PopoverContent className={styles.popoverContent} align="start">
            <HexColorPicker color={value} onChange={onChange} />
            <div className={styles.hexInputContainer}>
              <label
                htmlFor="hex-input"
                className={styles.hexInputLabel}
              >
                Hex Color
              </label>
              <HexColorInput
                id="hex-input"
                color={value}
                onChange={onChange}
                className={styles.hexInput}
                prefixed
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={styles.input}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

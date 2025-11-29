'use client';

import { useState, useEffect, forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface FormattedNumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  name?: string;
}

// Format number with thousand separators (150000 -> 150.000)
function formatNumber(value: string | number): string {
  const numStr = String(value).replace(/\D/g, '');
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse formatted number back to raw number (150.000 -> 150000)
function parseNumber(value: string): string {
  return value.replace(/\./g, '');
}

const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ className, label, error, value, onChange, name, placeholder = '0', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      if (value !== undefined && value !== '') {
        setDisplayValue(formatNumber(value));
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseNumber(e.target.value);
      setDisplayValue(formatNumber(raw));
      onChange?.(raw);
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground/80">{label}</label>
        )}
        {name && <input type="hidden" name={name} value={parseNumber(displayValue)} />}
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all duration-200',
            'focus:border-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);
FormattedNumberInput.displayName = 'FormattedNumberInput';

export { FormattedNumberInput };

import React, { useState, useEffect } from 'react';
import { Input } from './input';

export interface DateInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, defaultValue, onValueChange, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value || defaultValue || "");

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow backspace
      if (e.key === 'Backspace') {
        return;
      }
      
      // Prevent non-numeric characters except navigation keys
      if (!/^\d$/.test(e.key) && !['Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Get raw digits
      let val = e.target.value.replace(/\D/g, ''); 
      
      if (val.length > 8) {
        val = val.slice(0, 8); 
      }

      // Format as dd/mm/yyyy
      let formatted = '';
      if (val.length > 0) {
        formatted += val.substring(0, 2);
      }
      if (val.length >= 3) {
        formatted += '/' + val.substring(2, 4);
      }
      if (val.length >= 5) {
        formatted += '/' + val.substring(4, 8);
      }

      setInternalValue(formatted);
      
      if (onValueChange) {
        onValueChange(formatted);
      }
      
      if (onChange) {
        // Clone event with new value
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: formatted,
            name: props.name
          }
        };
        onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder || "dd/mm/yyyy"}
        maxLength={10}
        className={className}
      />
    );
  }
);

DateInput.displayName = 'DateInput';

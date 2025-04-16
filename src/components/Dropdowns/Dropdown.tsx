import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface Option {
  id: string;
  displayValue: string;
}

interface DropdownProps {
  label: string;
  options: Option[];
  onChange: (value: string) => void;
  value?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  options,
  onChange, 
  value,
  disabled = false
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        label={label}
        onChange={handleChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.displayValue}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 
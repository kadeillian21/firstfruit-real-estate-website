'use client';

import React from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = '0.00',
  disabled = false
}: CurrencyInputProps) {
  // Format value for display
  const displayValue = value ? value.toString() : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    
    // Convert to number
    const numericValue = rawValue ? parseInt(rawValue) : 0;
    
    // Update parent component
    onChange(numericValue);
  };
  
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        $
      </span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-navy focus:border-navy"
      />
    </div>
  );
}
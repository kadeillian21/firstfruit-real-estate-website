'use client';

import React from 'react';

interface PercentageInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PercentageInput({ 
  value, 
  onChange, 
  placeholder = '0.0',
  disabled = false
}: PercentageInputProps) {
  // Format decimal to percentage for display (e.g., 0.0575 -> 5.75)
  const displayValue = value ? (value * 100).toFixed(2) : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    
    // Convert percentage to decimal (e.g., 5.75 -> 0.0575)
    const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;
    
    // Update parent component
    onChange(numericValue);
  };
  
  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:ring-navy focus:border-navy"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        %
      </span>
    </div>
  );
}
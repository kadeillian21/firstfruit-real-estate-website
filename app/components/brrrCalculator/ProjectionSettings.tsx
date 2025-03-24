'use client';

import React, { useState } from 'react';
import { PropertyValueChangeEvent } from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';

interface ProjectionSettingsProps {
  projectionMonths: number;
  updateProjectionMonths: (months: number) => void;
  propertyValueChanges: PropertyValueChangeEvent[];
  updatePropertyValueChanges: (events: PropertyValueChangeEvent[]) => void;
}

export default function ProjectionSettings({
  projectionMonths,
  updateProjectionMonths,
  propertyValueChanges,
  updatePropertyValueChanges
}: ProjectionSettingsProps) {
  // State for new property value change
  const [newValueChange, setNewValueChange] = useState<{
    month: number;
    newValue: number;
  }>({
    month: 12,
    newValue: 0
  });

  // Predefined projection lengths
  const projectionOptions = [
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
    { label: '3 Years', value: 36 },
    { label: '5 Years', value: 60 },
    { label: '10 Years', value: 120 }
  ];

  // Add a new property value change
  const addPropertyValueChange = () => {
    if (newValueChange.newValue > 0) {
      const updatedEvents = [
        ...propertyValueChanges,
        {
          month: newValueChange.month,
          newValue: newValueChange.newValue
        }
      ];
      
      // Sort by month
      updatedEvents.sort((a, b) => a.month - b.month);
      
      updatePropertyValueChanges(updatedEvents);
      
      // Reset form
      setNewValueChange({
        month: newValueChange.month + 12,
        newValue: 0
      });
    }
  };

  // Remove a property value change
  const removePropertyValueChange = (index: number) => {
    const updatedEvents = [...propertyValueChanges];
    updatedEvents.splice(index, 1);
    updatePropertyValueChanges(updatedEvents);
  };

  // Helper function to find the most recent property value at a given month
  const findPropertyValueAtMonth = (month: number): number => {
    // Filter events that happen before or at the given month
    const priorEvents = propertyValueChanges
      .filter(event => event.month <= month)
      .sort((a, b) => b.month - a.month); // Sort in descending order by month
    
    // Return the value of the most recent event, or 0 if no events
    return priorEvents.length > 0 ? priorEvents[0].newValue : 0;
  };

  // Calculate annual appreciation rate between two events
  const calculateAnnualAppreciationRate = (startMonth: number, endMonth: number): string => {
    if (startMonth >= endMonth) return 'N/A';
    
    const startValue = findPropertyValueAtMonth(startMonth);
    const endValue = findPropertyValueAtMonth(endMonth);
    
    if (startValue <= 0 || endValue <= 0) return 'N/A';
    
    const yearsDifference = (endMonth - startMonth) / 12;
    const totalGrowth = endValue / startValue;
    
    // Calculate annual rate: (1 + r)^years = totalGrowth
    const annualRate = Math.pow(totalGrowth, 1 / yearsDifference) - 1;
    
    return (annualRate * 100).toFixed(2) + '%';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Projection Settings</h3>
      
      {/* Projection Length */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Projection Length</h4>
        <p className="text-sm text-gray-600">
          Choose how many months to project your BRRRR deal financials.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {projectionOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateProjectionMonths(option.value)}
              className={`py-2 px-4 rounded-md ${
                projectionMonths === option.value
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
          
          <div className="flex items-center ml-2">
            <span className="mr-2 text-gray-700">Custom:</span>
            <input
              type="number"
              min="1"
              max="240"
              value={projectionMonths}
              onChange={(e) => updateProjectionMonths(parseInt(e.target.value) || 12)}
              className="w-24 p-2 border border-gray-300 rounded-md"
            />
            <span className="ml-2 text-gray-700">months</span>
          </div>
        </div>
      </div>
      
      {/* Property Value Changes */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Property Value Changes</h4>
        <p className="text-sm text-gray-600">
          Model property appreciation or depreciation over time by specifying future property values.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="number"
              min="1"
              max={projectionMonths}
              value={newValueChange.month}
              onChange={(e) => setNewValueChange({
                ...newValueChange,
                month: parseInt(e.target.value) || 1
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Property Value
            </label>
            <CurrencyInput
              value={newValueChange.newValue}
              onChange={(value) => setNewValueChange({
                ...newValueChange,
                newValue: value
              })}
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="button"
              onClick={addPropertyValueChange}
              disabled={newValueChange.newValue <= 0}
              className={`w-full py-2 px-4 rounded-md ${
                newValueChange.newValue <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-navy text-white hover:bg-navy/80'
              }`}
            >
              Add Value Change
            </button>
          </div>
        </div>
        
        {/* List of property value changes */}
        {propertyValueChanges.length > 0 && (
          <div className="mt-4">
            <h5 className="text-md font-medium text-gray-800 mb-2">Scheduled Property Value Changes</h5>
            
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Value
                    </th>
                    {propertyValueChanges.length > 1 && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Annual Rate*
                      </th>
                    )}
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {propertyValueChanges.map((event, index) => {
                    // Calculate annual appreciation rate from previous event
                    const previousMonth = index > 0 ? propertyValueChanges[index - 1].month : 0;
                    const annualRate = index > 0 
                      ? calculateAnnualAppreciationRate(previousMonth, event.month)
                      : 'N/A';
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {event.month}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          ${event.newValue.toLocaleString()}
                        </td>
                        {propertyValueChanges.length > 1 && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            {annualRate}
                          </td>
                        )}
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => removePropertyValueChange(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {propertyValueChanges.length > 1 && (
                <p className="text-xs text-gray-500 mt-2">
                  *Annual Rate shows the annualized appreciation rate between consecutive value changes.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Projection Tips */}
      <div className="bg-emerald-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-emerald-800 mb-2">Projection Tips</h4>
        
        <ul className="list-disc list-inside text-emerald-700 space-y-1">
          <li>
            A longer projection period provides a more complete view of your investment performance
          </li>
          <li>
            For conservative projections, use 2-3% annual appreciation (or local market averages)
          </li>
          <li>
            Include multiple property value changes to model different market scenarios
          </li>
          <li>
            The timing of refinancing is critical to your returns - compare different options
          </li>
          <li>
            Consider property value changes that align with major market cycles (3-5 years)
          </li>
        </ul>
      </div>
    </div>
  );
}
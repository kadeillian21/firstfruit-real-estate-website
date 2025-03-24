'use client';

import React, { useState } from 'react';
import { PropertyValueChangeEvent } from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';
import PercentageInput from './ui/PercentageInput';
import NumberInput from './ui/NumberInput';

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
  // Determine initial property value
  const initialPropertyValue = propertyValueChanges.length > 0 
    ? propertyValueChanges[0].newValue 
    : 0;

  // State for new property value change
  const [newValueChange, setNewValueChange] = useState<{
    month: number;
    newValue: number;
  }>({
    month: 12,
    newValue: 0
  });

  // State for annual appreciation rate input
  const [appreciationInputMode, setAppreciationInputMode] = useState<'value' | 'percentage'>('percentage');
  const [annualAppreciationRate, setAnnualAppreciationRate] = useState(0.03); // 3% default
  const [appreciationYears, setAppreciationYears] = useState(1);
  
  // Months and years display
  const projectionYears = Math.ceil(projectionMonths / 12);
  const displayMonthsAsYears = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years}y`;
    return `${years}y ${remainingMonths}m`;
  };

  // Predefined projection lengths
  const projectionOptions = [
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
    { label: '3 Years', value: 36 },
    { label: '5 Years', value: 60 },
    { label: '10 Years', value: 120 }
  ];

  // Add a new property value change using percentage
  const addPropertyValueChangeByPercentage = () => {
    if (annualAppreciationRate === 0 || appreciationYears === 0) return;
    
    // Find the most recent property value
    let baseValue = initialPropertyValue;
    if (propertyValueChanges.length > 0) {
      const latestEvent = [...propertyValueChanges].sort((a, b) => b.month - a.month)[0];
      baseValue = latestEvent.newValue;
    }
    
    if (baseValue <= 0) return;
    
    // Calculate future value based on appreciation rate
    const futureValue = Math.round(baseValue * Math.pow(1 + annualAppreciationRate, appreciationYears));
    const futureMonth = propertyValueChanges.length > 0 
      ? [...propertyValueChanges].sort((a, b) => b.month - a.month)[0].month + (appreciationYears * 12)
      : appreciationYears * 12;
    
    const updatedEvents = [
      ...propertyValueChanges,
      {
        month: futureMonth,
        newValue: futureValue
      }
    ];
    
    // Sort by month
    updatedEvents.sort((a, b) => a.month - b.month);
    
    updatePropertyValueChanges(updatedEvents);
  };

  // Add a new property value change using direct value
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
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Projection Settings</h3>
      
      {/* Projection Length */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <h4 className="brrrr-section-heading text-lg">Projection Length</h4>
        <p className="brrrr-description text-sm mb-4">
          Choose how long to project your BRRRR deal financials.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {projectionOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateProjectionMonths(option.value)}
              className={`py-2 px-4 rounded-md transition-colors ${
                projectionMonths === option.value
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
          
          <div className="flex items-center ml-2">
            <span className="mr-2 text-gray-900">Custom:</span>
            <NumberInput
              min={1}
              max={240}
              value={projectionMonths}
              onChange={updateProjectionMonths}
              className="w-24"
            />
            <span className="ml-2 text-gray-900">months</span>
            <span className="ml-2 text-gray-900">({projectionYears} years)</span>
          </div>
        </div>
      </div>
      
      {/* Property Value Changes */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="brrrr-section-heading text-lg">Property Value Changes</h4>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setAppreciationInputMode('percentage')}
              className={`px-3 py-1 text-sm rounded-md ${
                appreciationInputMode === 'percentage' 
                  ? 'bg-navy text-white' 
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              Percentage
            </button>
            <button
              onClick={() => setAppreciationInputMode('value')}
              className={`px-3 py-1 text-sm rounded-md ${
                appreciationInputMode === 'value' 
                  ? 'bg-navy text-white' 
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              Exact Value
            </button>
          </div>
        </div>
        
        <p className="brrrr-description text-sm mb-2">
          Model property appreciation over time to predict future equity and returns.
        </p>
        
        {appreciationInputMode === 'percentage' ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h5 className="font-medium text-blue-900 mb-3">Annual Percentage Appreciation</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="brrrr-label text-blue-900">
                  Annual Rate
                </label>
                <PercentageInput
                  value={annualAppreciationRate}
                  onChange={(value) => setAnnualAppreciationRate(value)}
                  placeholder="3.0"
                />
              </div>
              
              <div>
                <label className="brrrr-label text-blue-900">
                  Apply For (years)
                </label>
                <NumberInput
                  min={1}
                  max={30}
                  value={appreciationYears}
                  onChange={setAppreciationYears}
                  className="brrrr-input"
                  placeholder="1"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addPropertyValueChangeByPercentage}
                  disabled={propertyValueChanges.length === 0 && initialPropertyValue === 0}
                  className={`w-full py-2 px-4 rounded-md ${
                    propertyValueChanges.length === 0 && initialPropertyValue === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-navy text-white hover:bg-navy/90 transition-colors'
                  }`}
                >
                  Add Appreciation
                </button>
              </div>
            </div>
            
            {propertyValueChanges.length === 0 && initialPropertyValue === 0 && (
              <p className="text-xs text-blue-800 mt-2">
                Set an initial property value in the Refinance tab first
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="brrrr-label">
                Month
              </label>
              <NumberInput
                min={1}
                max={projectionMonths}
                value={newValueChange.month}
                onChange={(value) => setNewValueChange({
                  ...newValueChange,
                  month: value
                })}
                className="brrrr-input"
              />
              <p className="text-xs text-gray-900 mt-1">
                {displayMonthsAsYears(newValueChange.month)}
              </p>
            </div>
            
            <div>
              <label className="brrrr-label">
                New Property Value
              </label>
              <CurrencyInput
                value={newValueChange.newValue}
                onChange={(value) => setNewValueChange({
                  ...newValueChange,
                  newValue: value
                })}
                placeholder="150000"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={addPropertyValueChange}
                disabled={newValueChange.newValue <= 0}
                className={`w-full py-2 px-4 rounded-md transition-colors ${
                  newValueChange.newValue <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-navy text-white hover:bg-navy/90'
                }`}
              >
                Add Value Change
              </button>
            </div>
          </div>
        )}
        
        {/* List of property value changes */}
        {propertyValueChanges.length > 0 && (
          <div className="mt-4">
            <h5 className="brrrr-section-heading text-md mb-2">Scheduled Property Value Changes</h5>
            
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      New Value
                    </th>
                    {propertyValueChanges.length > 1 && (
                      <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                        Annual Rate
                      </th>
                    )}
                    <th className="px-4 py-2 text-xs font-medium brrrr-table-header uppercase tracking-wider">
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
                      <tr key={index} className="brrrr-table-cell">
                        <td className="px-4 py-2 whitespace-nowrap">
                          Month {event.month} ({displayMonthsAsYears(event.month)})
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
            </div>
          </div>
        )}
      </div>
      
      {/* Projection Tips */}
      <div className="bg-emerald-50 p-6 rounded-lg shadow-sm border border-emerald-100">
        <h4 className="text-lg font-medium text-emerald-900 mb-2">Projection Tips</h4>
        
        <ul className="list-disc list-inside text-emerald-800 space-y-1">
          <li>
            A longer projection period (5-10 years) provides a more complete view of your investment
          </li>
          <li>
            For conservative projections, use 2-3% annual appreciation (or local market averages)
          </li>
          <li>
            The timing of refinancing is critical to your returns - comparing different scenarios is recommended
          </li>
          <li>
            Consider adding lower appreciation rates in later years to model market cooling
          </li>
          <li>
            For accurate cash flow projections, remember to account for rent increases and expense changes
          </li>
        </ul>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { 
  PropertyOperation, 
  RentChangeEvent,
  ExpenseChangeEvent 
} from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';
import PercentageInput from './ui/PercentageInput';

interface RentalDetailsProps {
  operation: PropertyOperation;
  updateOperation: (operation: PropertyOperation) => void;
  rentChangeEvents: RentChangeEvent[];
  updateRentChangeEvents: (events: RentChangeEvent[]) => void;
  expenseChangeEvents: ExpenseChangeEvent[];
  updateExpenseChangeEvents: (events: ExpenseChangeEvent[]) => void;
}

export default function RentalDetails({
  operation,
  updateOperation,
  rentChangeEvents,
  updateRentChangeEvents,
  expenseChangeEvents,
  updateExpenseChangeEvents
}: RentalDetailsProps) {
  // State for new rent change event
  const [newRentChange, setNewRentChange] = useState<{
    month: number;
    newRent: number;
  }>({
    month: 12, // Default to 1 year
    newRent: operation.monthlyRent * 1.03 // Default to 3% increase
  });

  // State for new expense change event
  const [newExpenseChange, setNewExpenseChange] = useState<{
    month: number;
    expenseType: keyof PropertyOperation;
    newAmount: number;
  }>({
    month: 12,
    expenseType: 'propertyTaxes',
    newAmount: 0
  });

  // Helper to update a specific field
  const updateField = (field: keyof PropertyOperation, value: any) => {
    updateOperation({
      ...operation,
      [field]: value
    });
  };

  // Add a new rent change event
  const addRentChange = () => {
    if (newRentChange.newRent > 0) {
      const updatedEvents = [
        ...rentChangeEvents,
        {
          month: newRentChange.month,
          newRent: newRentChange.newRent
        }
      ];
      
      // Sort by month
      updatedEvents.sort((a, b) => a.month - b.month);
      
      updateRentChangeEvents(updatedEvents);
      
      // Reset form to next year with 3% increase from the last rent
      const lastRent = newRentChange.newRent;
      setNewRentChange({
        month: newRentChange.month + 12,
        newRent: Math.round(lastRent * 1.03)
      });
    }
  };

  // Remove a rent change event
  const removeRentChange = (index: number) => {
    const updatedEvents = [...rentChangeEvents];
    updatedEvents.splice(index, 1);
    updateRentChangeEvents(updatedEvents);
  };

  // Add a new expense change event
  const addExpenseChange = () => {
    if (newExpenseChange.newAmount > 0) {
      const updatedEvents = [
        ...expenseChangeEvents,
        {
          month: newExpenseChange.month,
          expenseType: newExpenseChange.expenseType,
          newAmount: newExpenseChange.newAmount
        }
      ];
      
      // Sort by month
      updatedEvents.sort((a, b) => a.month - b.month);
      
      updateExpenseChangeEvents(updatedEvents);
      
      // Reset form
      setNewExpenseChange({
        month: newExpenseChange.month + 12,
        expenseType: newExpenseChange.expenseType,
        newAmount: 0
      });
    }
  };

  // Remove an expense change event
  const removeExpenseChange = (index: number) => {
    const updatedEvents = [...expenseChangeEvents];
    updatedEvents.splice(index, 1);
    updateExpenseChangeEvents(updatedEvents);
  };

  // Get friendly name for expense type
  const getExpenseTypeName = (type: string): string => {
    const names: Record<string, string> = {
      propertyTaxes: 'Property Taxes',
      insurance: 'Insurance',
      maintenance: 'Maintenance',
      propertyManagement: 'Property Management',
      utilities: 'Utilities',
      vacancyRate: 'Vacancy Rate',
      otherExpenses: 'Other Expenses'
    };
    
    return names[type] || type;
  };

  // Calculate monthly total
  const monthlyIncome = operation.monthlyRent + operation.otherMonthlyIncome;
  
  const monthlyExpenses = 
    (operation.propertyTaxes / 12) +
    (operation.insurance / 12) +
    operation.maintenance +
    (operation.monthlyRent * operation.propertyManagement / 100) +
    operation.utilities +
    (operation.monthlyRent * operation.vacancyRate / 100) +
    operation.otherExpenses;
  
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Rental Details</h3>
      
      {/* Income */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Rental Income</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent
            </label>
            <CurrencyInput
              value={operation.monthlyRent}
              onChange={(value) => updateField('monthlyRent', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Monthly Income
            </label>
            <CurrencyInput
              value={operation.otherMonthlyIncome}
              onChange={(value) => updateField('otherMonthlyIncome', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Laundry, storage, parking, etc.
            </p>
          </div>
        </div>
      </div>
      
      {/* Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Operating Expenses</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Property Taxes
            </label>
            <CurrencyInput
              value={operation.propertyTaxes}
              onChange={(value) => updateField('propertyTaxes', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Insurance
            </label>
            <CurrencyInput
              value={operation.insurance}
              onChange={(value) => updateField('insurance', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Maintenance
            </label>
            <CurrencyInput
              value={operation.maintenance}
              onChange={(value) => updateField('maintenance', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Management (% of rent)
            </label>
            <PercentageInput
              value={operation.propertyManagement / 100}
              onChange={(value) => updateField('propertyManagement', value * 100)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Utilities
            </label>
            <CurrencyInput
              value={operation.utilities}
              onChange={(value) => updateField('utilities', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vacancy Rate (% of rent)
            </label>
            <PercentageInput
              value={operation.vacancyRate / 100}
              onChange={(value) => updateField('vacancyRate', value * 100)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Monthly Expenses
            </label>
            <CurrencyInput
              value={operation.otherExpenses}
              onChange={(value) => updateField('otherExpenses', value)}
            />
          </div>
        </div>
      </div>
      
      {/* Future Rent Changes */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Future Rent Changes</h4>
        <p className="text-sm text-gray-600">
          Schedule future rent increases (or decreases) to model rental income over time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="number"
              min="1"
              value={newRentChange.month}
              onChange={(e) => setNewRentChange({
                ...newRentChange,
                month: parseInt(e.target.value) || 1
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Rent
            </label>
            <CurrencyInput
              value={newRentChange.newRent}
              onChange={(value) => setNewRentChange({
                ...newRentChange,
                newRent: value
              })}
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="button"
              onClick={addRentChange}
              disabled={newRentChange.newRent <= 0}
              className={`w-full py-2 px-4 rounded-md ${
                newRentChange.newRent <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-navy text-white hover:bg-navy/80'
              }`}
            >
              Add Rent Change
            </button>
          </div>
        </div>
        
        {/* List of rent changes */}
        {rentChangeEvents.length > 0 && (
          <div className="mt-4">
            <h5 className="text-md font-medium text-gray-800 mb-2">Scheduled Rent Changes</h5>
            
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Rent
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rentChangeEvents.map((event, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {event.month}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${event.newRent.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeRentChange(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Future Expense Changes */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Future Expense Changes</h4>
        <p className="text-sm text-gray-600">
          Schedule future changes to operating expenses to model costs over time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="number"
              min="1"
              value={newExpenseChange.month}
              onChange={(e) => setNewExpenseChange({
                ...newExpenseChange,
                month: parseInt(e.target.value) || 1
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type
            </label>
            <select
              value={newExpenseChange.expenseType}
              onChange={(e) => setNewExpenseChange({
                ...newExpenseChange,
                expenseType: e.target.value as keyof PropertyOperation
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="propertyTaxes">Property Taxes</option>
              <option value="insurance">Insurance</option>
              <option value="maintenance">Maintenance</option>
              <option value="propertyManagement">Property Management</option>
              <option value="utilities">Utilities</option>
              <option value="vacancyRate">Vacancy Rate</option>
              <option value="otherExpenses">Other Expenses</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Amount
            </label>
            <CurrencyInput
              value={newExpenseChange.newAmount}
              onChange={(value) => setNewExpenseChange({
                ...newExpenseChange,
                newAmount: value
              })}
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="button"
              onClick={addExpenseChange}
              disabled={newExpenseChange.newAmount <= 0}
              className={`w-full py-2 px-4 rounded-md ${
                newExpenseChange.newAmount <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-navy text-white hover:bg-navy/80'
              }`}
            >
              Add Expense Change
            </button>
          </div>
        </div>
        
        {/* List of expense changes */}
        {expenseChangeEvents.length > 0 && (
          <div className="mt-4">
            <h5 className="text-md font-medium text-gray-800 mb-2">Scheduled Expense Changes</h5>
            
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Amount
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenseChangeEvents.map((event, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {event.month}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {getExpenseTypeName(event.expenseType)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${event.newAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeExpenseChange(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Cash Flow Summary */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-green-800 mb-4">Monthly Cash Flow</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-green-700">Total Monthly Income</p>
            <p className="text-xl font-bold text-green-900">
              ${monthlyIncome.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-green-700">Total Monthly Expenses</p>
            <p className="text-xl font-bold text-green-900">
              ${monthlyExpenses.toFixed(2)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-green-700">Monthly Cash Flow</p>
            <p className={`text-xl font-bold ${monthlyCashFlow >= 0 ? 'text-green-900' : 'text-red-600'}`}>
              ${monthlyCashFlow.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
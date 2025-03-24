'use client';

import React, { useState } from 'react';
import { PropertyAcquisition } from '../../utils/brrrCalculator/projectionEngine';
import { CapitalExpenseEvent } from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';

interface RehabDetailsProps {
  acquisition: PropertyAcquisition;
  updateAcquisition: (acquisition: PropertyAcquisition) => void;
  capitalExpenses: CapitalExpenseEvent[];
  updateCapitalExpenses: (capitalExpenses: CapitalExpenseEvent[]) => void;
}

export default function RehabDetails({
  acquisition,
  updateAcquisition,
  capitalExpenses,
  updateCapitalExpenses
}: RehabDetailsProps) {
  // State for new capital expense
  const [newExpense, setNewExpense] = useState<{
    description: string;
    amount: number;
    month: number;
  }>({
    description: '',
    amount: 0,
    month: 1
  });

  // Helper to update a specific field in acquisition
  const updateField = (field: keyof PropertyAcquisition, value: any) => {
    updateAcquisition({
      ...acquisition,
      [field]: value
    });
  };

  // Add a new capital expense
  const addCapitalExpense = () => {
    if (newExpense.description && newExpense.amount > 0) {
      const updatedExpenses = [
        ...capitalExpenses,
        {
          month: newExpense.month,
          description: newExpense.description,
          amount: newExpense.amount
        }
      ];
      
      // Sort by month
      updatedExpenses.sort((a, b) => a.month - b.month);
      
      updateCapitalExpenses(updatedExpenses);
      
      // Reset form
      setNewExpense({
        description: '',
        amount: 0,
        month: 1
      });
    }
  };

  // Remove a capital expense
  const removeCapitalExpense = (index: number) => {
    const updatedExpenses = [...capitalExpenses];
    updatedExpenses.splice(index, 1);
    updateCapitalExpenses(updatedExpenses);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Rehab Details</h3>
      
      {/* Rehab Budget and Timeline */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Rehab Budget and Timeline</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Rehab Budget
            </label>
            <CurrencyInput
              value={acquisition.rehabCosts}
              onChange={(value) => updateField('rehabCosts', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Rehab Duration (months)
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={acquisition.rehabDurationMonths}
              onChange={(e) => updateField('rehabDurationMonths', parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            During the rehab period, the property will not generate rental income,
            but you'll still have expenses such as property taxes, insurance, and possibly loan payments.
          </p>
        </div>
      </div>
      
      {/* Additional Capital Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Additional Capital Expenses</h4>
        <p className="text-sm text-gray-600">
          Add one-time capital expenses that will occur during the holding period.
          These could include future repairs, renovations, or replacements of major systems.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="number"
              min="1"
              value={newExpense.month}
              onChange={(e) => setNewExpense({
                ...newExpense,
                month: parseInt(e.target.value) || 1
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({
                ...newExpense,
                description: e.target.value
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., Roof Replacement"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <CurrencyInput
              value={newExpense.amount}
              onChange={(value) => setNewExpense({
                ...newExpense,
                amount: value
              })}
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={addCapitalExpense}
          disabled={!newExpense.description || newExpense.amount <= 0}
          className={`mt-2 py-2 px-4 rounded-md ${
            !newExpense.description || newExpense.amount <= 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-navy text-white hover:bg-navy/80'
          }`}
        >
          Add Expense
        </button>
        
        {/* List of capital expenses */}
        {capitalExpenses.length > 0 && (
          <div className="mt-4">
            <h5 className="text-md font-medium text-gray-800 mb-2">Scheduled Capital Expenses</h5>
            
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {capitalExpenses.map((expense, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {expense.month}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {expense.description}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${expense.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeCapitalExpense(index)}
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
      
      {/* Rehab Checklist */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-blue-800 mb-2">Rehab Checklist</h4>
        
        <p className="text-blue-700 mb-4">
          Consider these common rehab items when estimating your budget:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Interior</h5>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Flooring</li>
              <li>Paint</li>
              <li>Kitchen cabinets and countertops</li>
              <li>Bathroom fixtures</li>
              <li>Appliances</li>
              <li>HVAC system</li>
              <li>Electrical updates</li>
              <li>Plumbing repairs</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Exterior</h5>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Roof repairs or replacement</li>
              <li>Exterior paint or siding</li>
              <li>Windows and doors</li>
              <li>Landscaping</li>
              <li>Driveway/walkway</li>
              <li>Fencing</li>
              <li>Gutters and downspouts</li>
              <li>Foundation repairs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { PropertyAcquisition } from '../../utils/brrrCalculator/projectionEngine';
import { CapitalExpenseEvent } from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';
import NumberInput from './ui/NumberInput';

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
  // State for new capital expense component
  const [newExpense, setNewExpense] = useState<{
    component: string;
    lifespan: number;
    replacementCost: number;
    lastReplaced: number;
  }>({
    component: '',
    lifespan: 0,
    replacementCost: 0,
    lastReplaced: 0
  });

  // Helper to update a specific field in acquisition
  const updateField = (field: keyof PropertyAcquisition, value: number | undefined) => {
    updateAcquisition({
      ...acquisition,
      [field]: value
    });
  };

  // Calculate monthly budget amount
  const calculateMonthlyBudget = (cost: number, lifespan: number): number => {
    if (lifespan <= 0) return 0;
    return cost / (lifespan * 12); // Monthly amount to save
  };

  // Add a new capital expense component
  const addCapitalExpense = () => {
    if (newExpense.component && newExpense.replacementCost > 0 && newExpense.lifespan > 0) {
      const monthlyBudget = calculateMonthlyBudget(
        newExpense.replacementCost, 
        newExpense.lifespan
      );
      
      const updatedExpenses = [
        ...capitalExpenses,
        {
          component: newExpense.component,
          lifespan: newExpense.lifespan,
          replacementCost: newExpense.replacementCost,
          lastReplaced: newExpense.lastReplaced,
          monthlyBudget: monthlyBudget
        }
      ];
      
      // Sort by component name for easier reference
      updatedExpenses.sort((a, b) => a.component.localeCompare(b.component));
      
      updateCapitalExpenses(updatedExpenses);
      
      // Reset form with empty defaults
      setNewExpense({
        component: '',
        lifespan: 0,
        replacementCost: 0,
        lastReplaced: 0
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
            <NumberInput
              min={0}
              max={24}
              value={acquisition.rehabDurationMonths}
              onChange={(value) => updateField('rehabDurationMonths', value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            During the rehab period, the property will not generate rental income,
            but you&apos;ll still have expenses such as property taxes, insurance, and possibly loan payments.
          </p>
        </div>
      </div>
      
      {/* Capital Expense Components */}
      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 space-y-4">
        <h4 className="text-lg font-medium text-green-900 mb-2">Capital Expense Components</h4>
        <p className="text-sm text-green-800 mb-4">
          Add property components that will need replacement over time. This helps you budget for future capital expenses and properly account for them in your analysis.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-green-200">
          <div>
            <label className="brrrr-label">
              Component
            </label>
            <input
              type="text"
              value={newExpense.component}
              onChange={(e) => setNewExpense({
                ...newExpense,
                component: e.target.value
              })}
              className="brrrr-input"
              placeholder="e.g., Roof, HVAC, Water Heater"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Lifespan (years)
            </label>
            <NumberInput
              min={1}
              max={50}
              value={newExpense.lifespan}
              onChange={(value) => setNewExpense({
                ...newExpense,
                lifespan: value
              })}
              className="brrrr-input"
              placeholder="15"
            />
            <p className="text-xs text-gray-900 mt-1">Typical range: 5-30 years</p>
          </div>
          
          <div>
            <label className="brrrr-label">
              Replacement Cost
            </label>
            <CurrencyInput
              value={newExpense.replacementCost}
              onChange={(value) => setNewExpense({
                ...newExpense,
                replacementCost: value
              })}
              placeholder="10000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Age (years)
            </label>
            <NumberInput
              min={0}
              max={newExpense.lifespan}
              value={newExpense.lastReplaced}
              onChange={(value) => setNewExpense({
                ...newExpense,
                lastReplaced: value
              })}
              className="brrrr-input"
              placeholder="0"
            />
            <p className="text-xs text-gray-900 mt-1">Current age of component</p>
          </div>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="text-green-900 text-sm">
            <span className="font-medium">Monthly budget amount:</span> ${newExpense.replacementCost > 0 && newExpense.lifespan > 0 ? (newExpense.replacementCost / (newExpense.lifespan * 12)).toFixed(2) : '0.00'}/month
          </div>
          
          <button
            type="button"
            onClick={addCapitalExpense}
            disabled={!newExpense.component || newExpense.replacementCost <= 0}
            className={`py-2 px-4 rounded-md transition-colors ${
              !newExpense.component || newExpense.replacementCost <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            Add Component
          </button>
        </div>
        
        {/* Component suggestions */}
        <div className="bg-green-100 p-3 rounded-md text-sm text-green-800">
          <p className="font-medium">Common Components & Typical Lifespans:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 mt-1">
            <div>• Roof: 20-25 years</div>
            <div>• HVAC: 15-20 years</div>
            <div>• Water Heater: 10-15 years</div>
            <div>• Kitchen Appliances: 10-15 years</div>
            <div>• Exterior Paint: 7-10 years</div>
            <div>• Flooring: 15-25 years</div>
          </div>
        </div>
        
        {/* List of capital expense components */}
        {capitalExpenses.length > 0 && (
          <div className="mt-4">
            <h5 className="brrrr-section-heading text-md mb-2">Your Capital Expense Components</h5>
            
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Lifespan
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Replacement Cost
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Monthly Budget
                    </th>
                    <th className="px-4 py-2 text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {capitalExpenses.map((expense, index) => (
                    <tr key={index} className="brrrr-table-cell">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {expense.component}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {expense.lifespan} years
                        {expense.lastReplaced && expense.lastReplaced > 0 && ` (${expense.lastReplaced} years old)`}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${expense.replacementCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${expense.monthlyBudget ? expense.monthlyBudget.toFixed(2) : '0.00'}/month
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
            
            <div className="mt-3 text-green-900 font-medium">
              Total Monthly Capital Expense Budget: ${capitalExpenses.reduce((sum, expense) => sum + (expense.monthlyBudget || 0), 0).toFixed(2)}
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
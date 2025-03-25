'use client';

import React, { useState } from 'react';
import { PropertyAcquisition, HoldingCosts } from '../../utils/brrrCalculator/projectionEngine';
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
  
  // State for holding costs
  const [holdingCosts, setHoldingCosts] = useState<HoldingCosts>({
    mortgage: acquisition.includeHoldingCosts?.mortgage ?? true,
    taxes: acquisition.includeHoldingCosts?.taxes ?? true,
    insurance: acquisition.includeHoldingCosts?.insurance ?? true,
    maintenance: acquisition.includeHoldingCosts?.maintenance ?? false,
    propertyManagement: acquisition.includeHoldingCosts?.propertyManagement ?? false,
    utilities: acquisition.includeHoldingCosts?.utilities ?? true,
    other: acquisition.includeHoldingCosts?.other ?? false
  });

  // Helper to update a specific field in acquisition
  const updateField = (field: keyof PropertyAcquisition, value: number | boolean | Record<string, boolean> | undefined) => {
    updateAcquisition({
      ...acquisition,
      [field]: value
    });
  };
  
  // Update holding costs
  const updateHoldingCostField = (field: string, value: boolean) => {
    const updatedHoldingCosts = {
      ...holdingCosts,
      [field]: value
    };
    
    setHoldingCosts(updatedHoldingCosts);
    
    updateAcquisition({
      ...acquisition,
      includeHoldingCosts: updatedHoldingCosts
    });
  };
  
  // Calculate estimated monthly holding costs based on operation expenses
  const estimateMonthlyHoldingCost = () => {
    if (acquisition.useCustomHoldingCost && acquisition.customMonthlyHoldingCost) {
      return acquisition.customMonthlyHoldingCost;
    }
    
    // For non-custom holding costs, use a simplified calculation based on the operation expenses
    let totalMonthly = 0;
    
    // This estimates actual holding costs based on which boxes are checked
    if (holdingCosts.mortgage && acquisition.purchaseLoanAmount && acquisition.purchaseLoanRate && acquisition.purchaseLoanTermYears) {
      // Estimate monthly mortgage payment
      const rate = acquisition.purchaseLoanRate / 12; // monthly rate
      const payments = acquisition.purchaseLoanTermYears * 12; // total number of payments
      const mortgagePayment = acquisition.purchaseLoanAmount * 
        (rate * Math.pow(1 + rate, payments)) / 
        (Math.pow(1 + rate, payments) - 1);
      totalMonthly += mortgagePayment;
    }
    
    if (holdingCosts.taxes) {
      // Assume typical property taxes are 1-2% of property value annually
      const monthlyTaxes = (acquisition.purchasePrice * 0.015) / 12;
      totalMonthly += monthlyTaxes;
    }
    
    if (holdingCosts.insurance) {
      // Assume insurance is about 0.5% of property value annually
      const monthlyInsurance = (acquisition.purchasePrice * 0.005) / 12;
      totalMonthly += monthlyInsurance;
    }
    
    if (holdingCosts.utilities) {
      // Estimate basic utilities (electricity, water, etc.)
      totalMonthly += 200; // Placeholder amount
    }
    
    if (holdingCosts.maintenance) {
      // Basic maintenance during rehab
      totalMonthly += 100; // Placeholder amount
    }
    
    if (holdingCosts.propertyManagement) {
      // If using property management during rehab (unusual)
      totalMonthly += 100; // Placeholder amount
    }
    
    if (holdingCosts.other) {
      // Other miscellaneous expenses
      totalMonthly += 100; // Placeholder amount
    }
    
    return totalMonthly;
  };
  
  const monthlyHoldingCost = estimateMonthlyHoldingCost();
  const totalHoldingCost = monthlyHoldingCost * acquisition.rehabDurationMonths;

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
      
      {/* Holding Costs During Rehab */}
      <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-amber-900 mb-1">Holding Costs During Rehab</h4>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="use-custom-holding-cost"
                checked={acquisition.useCustomHoldingCost || false}
                onChange={(e) => {
                  updateAcquisition({
                    ...acquisition,
                    useCustomHoldingCost: e.target.checked
                  });
                }}
                className="w-4 h-4 text-navy focus:ring-navy"
              />
              <label htmlFor="use-custom-holding-cost" className="text-sm font-medium text-amber-900">
                Use Custom Monthly Amount
              </label>
            </div>
            
            <button
              type="button"
              onClick={() => {
                const allSelected = Object.values(holdingCosts).every(value => value === true);
                const newValue = !allSelected;
                const updatedHoldingCosts = {
                  mortgage: acquisition.purchaseLoanAmount ? newValue : false,
                  taxes: newValue,
                  insurance: newValue,
                  maintenance: newValue,
                  propertyManagement: newValue,
                  utilities: newValue,
                  other: newValue
                };
                
                setHoldingCosts(updatedHoldingCosts);
                updateAcquisition({
                  ...acquisition,
                  includeHoldingCosts: updatedHoldingCosts,
                  useCustomHoldingCost: false
                });
              }}
              className="text-sm bg-amber-700 hover:bg-amber-800 text-white py-1 px-3 rounded-md transition-colors"
              disabled={acquisition.useCustomHoldingCost || false}
            >
              {Object.values(holdingCosts).every(value => value === true) ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        
        {acquisition.useCustomHoldingCost ? (
          <div className="mt-4">
            <label htmlFor="custom-holding-cost" className="block text-sm font-medium text-amber-900 mb-1">
              Monthly Holding Cost
            </label>
            <div className="flex items-center">
              <CurrencyInput
                value={acquisition.customMonthlyHoldingCost || 0}
                onChange={(value) => updateField('customMonthlyHoldingCost', value)}
                placeholder="500"
              />
              <p className="ml-2 text-sm text-amber-800">per month during rehab</p>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              This is the total monthly holding cost that will be applied for each month of rehab.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-amber-800 mb-3">
              Select which expenses you&apos;ll have during the rehab period:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-mortgage"
                  checked={holdingCosts.mortgage}
                  onChange={(e) => updateHoldingCostField('mortgage', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                  disabled={!acquisition.purchaseLoanAmount}
                />
                <label htmlFor="holding-mortgage" className="text-gray-900">
                  Mortgage Payments
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-taxes"
                  checked={holdingCosts.taxes}
                  onChange={(e) => updateHoldingCostField('taxes', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-taxes" className="text-gray-900">
                  Property Taxes
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-insurance"
                  checked={holdingCosts.insurance}
                  onChange={(e) => updateHoldingCostField('insurance', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-insurance" className="text-gray-900">
                  Insurance
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-maintenance"
                  checked={holdingCosts.maintenance}
                  onChange={(e) => updateHoldingCostField('maintenance', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-maintenance" className="text-gray-900">
                  Maintenance
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-propertyManagement"
                  checked={holdingCosts.propertyManagement}
                  onChange={(e) => updateHoldingCostField('propertyManagement', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-propertyManagement" className="text-gray-900">
                  Property Management
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-utilities"
                  checked={holdingCosts.utilities}
                  onChange={(e) => updateHoldingCostField('utilities', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-utilities" className="text-gray-900">
                  Utilities
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-other"
                  checked={holdingCosts.other}
                  onChange={(e) => updateHoldingCostField('other', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-other" className="text-gray-900">
                  Other Expenses
                </label>
              </div>
            </div>
          </>
        )}
        
        <div className="mt-2 p-3 bg-amber-100 rounded-md text-amber-800 text-sm">
          <div className="flex justify-between mb-2">
            <p className="font-medium">Estimated Monthly Holding Cost:</p>
            <p className="font-bold">${Math.round(monthlyHoldingCost).toLocaleString()}/month</p>
          </div>
          <div className="flex justify-between mb-2">
            <p className="font-medium">Total Holding Cost for {acquisition.rehabDurationMonths} months:</p>
            <p className="font-bold">${Math.round(totalHoldingCost).toLocaleString()}</p>
          </div>
          <p className="mt-1"><span className="font-medium">Note:</span> These holding costs significantly impact your returns. Vacancy costs are not included here since the property is already vacant during rehab.</p>
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
      
      
      {/* Rehab Cost Summary */}
      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 mt-6">
        <h4 className="text-lg font-medium text-green-900 mb-4">Rehab Cash Requirements</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-green-800">Rehab Budget</p>
            <p className="text-xl font-bold text-green-900">
              ${acquisition.rehabCosts.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-green-800">Estimated Holding Costs</p>
            <p className="text-xl font-bold text-green-900">
              ${Math.round(totalHoldingCost).toLocaleString()}
            </p>
            <p className="text-xs text-green-800 mt-1">
              ${Math.round(monthlyHoldingCost).toLocaleString()}/month for {acquisition.rehabDurationMonths} months
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-green-800">Total Rehab Phase Cash</p>
            <p className="text-xl font-bold text-green-900">
              ${(acquisition.rehabCosts + Math.round(totalHoldingCost)).toLocaleString()}
            </p>
            <p className="text-xs text-green-800 mt-1">
              Rehab budget + estimated holding costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
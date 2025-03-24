'use client';

import React from 'react';
import { PropertyAcquisition } from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';
import PercentageInput from './ui/PercentageInput';

interface AcquisitionDetailsProps {
  acquisition: PropertyAcquisition;
  updateAcquisition: (acquisition: PropertyAcquisition) => void;
}

export default function AcquisitionDetails({ 
  acquisition, 
  updateAcquisition 
}: AcquisitionDetailsProps) {
  // Helper to update a specific field
  const updateField = (field: keyof PropertyAcquisition, value: any) => {
    updateAcquisition({
      ...acquisition,
      [field]: value
    });
  };

  // Calculate total acquisition costs
  const totalAcquisitionCost = 
    acquisition.purchasePrice + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);

  // Calculate down payment if using financing
  const downPayment = acquisition.purchaseLoanAmount 
    ? acquisition.purchasePrice - acquisition.purchaseLoanAmount 
    : acquisition.purchasePrice;

  // Calculate total cash needed
  const totalCashNeeded = downPayment + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Acquisition Details</h3>
      
      {/* Purchase Information */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Purchase Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price
            </label>
            <CurrencyInput
              value={acquisition.purchasePrice}
              onChange={(value) => updateField('purchasePrice', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closing Costs
            </label>
            <CurrencyInput
              value={acquisition.closingCosts}
              onChange={(value) => updateField('closingCosts', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rehab Budget
            </label>
            <CurrencyInput
              value={acquisition.rehabCosts}
              onChange={(value) => updateField('rehabCosts', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rehab Duration (months)
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Initial Costs
            </label>
            <CurrencyInput
              value={acquisition.otherInitialCosts || 0}
              onChange={(value) => updateField('otherInitialCosts', value)}
            />
            <p className="text-xs text-gray-500 mt-1">Furniture, appliances, etc.</p>
          </div>
        </div>
      </div>
      
      {/* Financing Information */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-800">Financing Information</h4>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="using-financing"
              checked={!!acquisition.purchaseLoanAmount}
              onChange={(e) => {
                if (!e.target.checked) {
                  // Clear loan details if not using financing
                  updateAcquisition({
                    ...acquisition,
                    purchaseLoanAmount: undefined,
                    purchaseLoanRate: undefined,
                    purchaseLoanTermYears: undefined
                  });
                } else {
                  // Set default loan amount to 80% of purchase price
                  updateAcquisition({
                    ...acquisition,
                    purchaseLoanAmount: Math.round(acquisition.purchasePrice * 0.8),
                    purchaseLoanRate: 0.06,
                    purchaseLoanTermYears: 30
                  });
                }
              }}
              className="mr-2"
            />
            <label htmlFor="using-financing" className="text-sm font-medium text-gray-700">
              Using Financing
            </label>
          </div>
        </div>
        
        {acquisition.purchaseLoanAmount !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount
              </label>
              <CurrencyInput
                value={acquisition.purchaseLoanAmount}
                onChange={(value) => updateField('purchaseLoanAmount', value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate
              </label>
              <PercentageInput
                value={acquisition.purchaseLoanRate || 0}
                onChange={(value) => updateField('purchaseLoanRate', value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term (years)
              </label>
              <select
                value={acquisition.purchaseLoanTermYears || 30}
                onChange={(e) => updateField('purchaseLoanTermYears', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment
              </label>
              <div className="p-2 bg-gray-100 border border-gray-300 rounded-md">
                ${downPayment.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Summary */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-green-800 mb-4">Acquisition Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-green-700">Total Acquisition Cost</p>
            <p className="text-xl font-bold text-green-900">
              ${totalAcquisitionCost.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-green-700">Total Cash Needed</p>
            <p className="text-xl font-bold text-green-900">
              ${totalCashNeeded.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
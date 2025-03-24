'use client';

import React, { useState } from 'react';
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
  const [rehabDurationFocused, setRehabDurationFocused] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(
    acquisition.purchaseLoanAmount 
      ? (1 - acquisition.purchaseLoanAmount / acquisition.purchasePrice) * 100
      : 20
  );
  
  // Define holding costs type
  type HoldingCostsType = {
    mortgage: boolean;
    taxes: boolean;
    insurance: boolean;
    maintenance: boolean;
    propertyManagement: boolean;
    utilities: boolean;
    other: boolean;
  };
  
  // State for holding costs
  const [holdingCosts, setHoldingCosts] = useState<HoldingCostsType>({
    mortgage: acquisition.includeHoldingCosts?.mortgage ?? true,
    taxes: acquisition.includeHoldingCosts?.taxes ?? true,
    insurance: acquisition.includeHoldingCosts?.insurance ?? true,
    maintenance: acquisition.includeHoldingCosts?.maintenance ?? false,
    propertyManagement: acquisition.includeHoldingCosts?.propertyManagement ?? false,
    utilities: acquisition.includeHoldingCosts?.utilities ?? true,
    other: acquisition.includeHoldingCosts?.other ?? false
  });

  // Helper to update a specific field
  const updateField = (field: keyof PropertyAcquisition, value: any) => {
    updateAcquisition({
      ...acquisition,
      [field]: value
    });
  };

  // Calculate down payment amount
  const downPaymentAmount = acquisition.purchasePrice * (downPaymentPercent / 100);
  
  // Update loan amount when down payment changes
  const updateDownPayment = (percent: number) => {
    setDownPaymentPercent(percent);
    const loanAmount = Math.round(acquisition.purchasePrice * (1 - percent / 100));
    
    updateAcquisition({
      ...acquisition,
      purchaseLoanAmount: loanAmount
    });
  };

  // Calculate total acquisition costs
  const totalAcquisitionCost = 
    acquisition.purchasePrice + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);

  // Calculate total cash needed
  const totalCashNeeded = downPaymentAmount + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);
    
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Acquisition Details</h3>
      
      {/* Purchase Information */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <h4 className="brrrr-section-heading text-lg">Purchase Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="brrrr-label">
              Purchase Price
            </label>
            <CurrencyInput
              value={acquisition.purchasePrice}
              onChange={(value) => {
                // Update purchase price and recalculate loan amount
                updateField('purchasePrice', value);
                if (acquisition.purchaseLoanAmount) {
                  const newLoanAmount = Math.round(value * (1 - downPaymentPercent / 100));
                  updateField('purchaseLoanAmount', newLoanAmount);
                }
              }}
              placeholder="100000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Closing Costs
            </label>
            <CurrencyInput
              value={acquisition.closingCosts}
              onChange={(value) => updateField('closingCosts', value)}
              placeholder="3000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Rehab Budget
            </label>
            <CurrencyInput
              value={acquisition.rehabCosts}
              onChange={(value) => updateField('rehabCosts', value)}
              placeholder="25000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Rehab Duration (months)
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={acquisition.rehabDurationMonths}
              onChange={(e) => updateField('rehabDurationMonths', parseInt(e.target.value) || 0)}
              onFocus={() => setRehabDurationFocused(true)}
              onBlur={() => setRehabDurationFocused(false)}
              placeholder={rehabDurationFocused ? "" : "2"}
              className="brrrr-input"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Other Initial Costs
            </label>
            <CurrencyInput
              value={acquisition.otherInitialCosts || 0}
              onChange={(value) => updateField('otherInitialCosts', value)}
              placeholder="2000"
            />
            <p className="text-xs text-gray-900 mt-1">Furniture, appliances, etc.</p>
          </div>
        </div>
      </div>
      
      {/* Financing Information */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="brrrr-section-heading text-lg">Financing Information</h4>
          
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
                  setDownPaymentPercent(100);
                } else {
                  // Set default down payment to 20% of purchase price
                  setDownPaymentPercent(20);
                  updateAcquisition({
                    ...acquisition,
                    purchaseLoanAmount: Math.round(acquisition.purchasePrice * 0.8),
                    purchaseLoanRate: 0.06,
                    purchaseLoanTermYears: 30
                  });
                }
              }}
              className="w-5 h-5 text-navy focus:ring-navy mr-2"
            />
            <label htmlFor="using-financing" className="text-sm font-medium text-gray-900">
              Using Financing
            </label>
          </div>
        </div>
        
        {acquisition.purchaseLoanAmount !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="brrrr-label">
                Down Payment (%)
              </label>
              <PercentageInput
                value={downPaymentPercent / 100}
                onChange={(value) => updateDownPayment(value * 100)}
                placeholder="20.0"
              />
            </div>
            
            <div>
              <label className="brrrr-label">
                Down Payment Amount
              </label>
              <div className="p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-medium">
                ${downPaymentAmount.toLocaleString()}
              </div>
            </div>
            
            <div>
              <label className="brrrr-label">
                Interest Rate
              </label>
              <PercentageInput
                value={acquisition.purchaseLoanRate || 0}
                onChange={(value) => updateField('purchaseLoanRate', value)}
                placeholder="6.0"
              />
            </div>
            
            <div>
              <label className="brrrr-label">
                Loan Term (years)
              </label>
              <select
                value={acquisition.purchaseLoanTermYears || 30}
                onChange={(e) => updateField('purchaseLoanTermYears', parseInt(e.target.value))}
                className="brrrr-input"
              >
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>
            
            <div>
              <label className="brrrr-label">
                Loan Amount
              </label>
              <div className="p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-medium">
                ${acquisition.purchaseLoanAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Holding Costs During Rehab */}
      <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100 space-y-4">
        <div className="flex justify-between">
          <h4 className="text-lg font-medium text-amber-900 mb-1">Holding Costs During Rehab</h4>
          <div className="flex items-center space-x-2">
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
                  includeHoldingCosts: updatedHoldingCosts
                });
              }}
              className="text-sm bg-amber-700 hover:bg-amber-800 text-white py-1 px-3 rounded-md transition-colors"
            >
              {Object.values(holdingCosts).every(value => value === true) ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        
        <p className="text-sm text-amber-800 mb-3">
          Select which expenses you'll have during the rehab period:
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
        
        <div className="mt-2 p-3 bg-amber-100 rounded-md text-amber-800 text-sm">
          <p className="font-medium">Pro Tip:</p>
          <p>Holding costs during rehab can significantly impact your returns. Be sure to account for all expenses you'll incur while the property isn't generating income.</p>
          <p className="mt-1"><span className="font-medium">Note:</span> Vacancy costs are not included here since the property is already vacant during rehab.</p>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
        <h4 className="text-lg font-medium text-green-900 mb-4">Acquisition Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-green-800">Total Acquisition Cost</p>
            <p className="text-xl font-bold text-green-900">
              ${totalAcquisitionCost.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-green-800">Total Cash Needed</p>
            <p className="text-xl font-bold text-green-900">
              ${totalCashNeeded.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
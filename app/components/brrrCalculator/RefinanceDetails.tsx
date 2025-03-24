'use client';

import React, { useState } from 'react';
import { 
  PropertyAcquisition,
  RefinanceEvent 
} from '../../utils/brrrCalculator/projectionEngine';
import { calculateMinimumARV } from '../../utils/brrrCalculator/refinanceCalculator';
import CurrencyInput from './ui/CurrencyInput';
import PercentageInput from './ui/PercentageInput';

interface RefinanceDetailsProps {
  refinanceEvents: RefinanceEvent[];
  updateRefinanceEvents: (events: RefinanceEvent[]) => void;
  acquisition: PropertyAcquisition;
}

export default function RefinanceDetails({
  refinanceEvents,
  updateRefinanceEvents,
  acquisition
}: RefinanceDetailsProps) {
  // Calculate total investment so far
  const totalInvestment = 
    acquisition.purchasePrice + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);
  
  // State for new refinance event
  const [newRefinance, setNewRefinance] = useState<RefinanceEvent>({
    month: acquisition.rehabDurationMonths + 1,
    afterRepairValue: totalInvestment * 1.25, // Default to 25% equity gain
    refinanceLTV: 0.75,
    refinanceRate: 0.05,
    refinanceTermYears: 30,
    refinanceClosingCosts: 3500
  });

  // Add a new refinance event
  const addRefinanceEvent = () => {
    if (newRefinance.afterRepairValue > 0) {
      const updatedEvents = [
        ...refinanceEvents,
        { ...newRefinance }
      ];
      
      // Sort by month
      updatedEvents.sort((a, b) => a.month - b.month);
      
      updateRefinanceEvents(updatedEvents);
      
      // Reset form
      setNewRefinance({
        ...newRefinance,
        month: newRefinance.month + 12, // Suggest another refinance in a year
      });
    }
  };

  // Remove a refinance event
  const removeRefinanceEvent = (index: number) => {
    const updatedEvents = [...refinanceEvents];
    updatedEvents.splice(index, 1);
    updateRefinanceEvents(updatedEvents);
  };

  // Calculate minimum ARV needed for a successful BRRRR (getting all money back out)
  const minARV = calculateMinimumARV(
    totalInvestment,
    newRefinance.refinanceLTV,
    newRefinance.refinanceClosingCosts
  );

  // Calculate loan amount from current ARV
  const potentialLoanAmount = Math.floor(newRefinance.afterRepairValue * newRefinance.refinanceLTV);
  
  // Calculate cash recouped
  const cashRecouped = potentialLoanAmount - newRefinance.refinanceClosingCosts;
  
  // Calculate remaining investment
  const remainingInvestment = Math.max(0, totalInvestment - cashRecouped);
  
  // Whether this refinance would be a successful BRRRR
  const isSuccessfulBRRRR = remainingInvestment === 0;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Refinance Details</h3>
      
      {/* ARV and Refinance Timing */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">After Repair Value & Timing</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refinance Month
            </label>
            <input
              type="number"
              min={acquisition.rehabDurationMonths + 1}
              value={newRefinance.month}
              onChange={(e) => setNewRefinance({
                ...newRefinance,
                month: parseInt(e.target.value) || acquisition.rehabDurationMonths + 1
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be after rehab completion (month {acquisition.rehabDurationMonths + 1})
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              After Repair Value (ARV)
            </label>
            <CurrencyInput
              value={newRefinance.afterRepairValue}
              onChange={(value) => setNewRefinance({
                ...newRefinance,
                afterRepairValue: value
              })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Estimated market value after renovations
            </p>
          </div>
        </div>
      </div>
      
      {/* Refinance Loan Details */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Refinance Loan Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan-to-Value (LTV)
            </label>
            <PercentageInput
              value={newRefinance.refinanceLTV}
              onChange={(value) => setNewRefinance({
                ...newRefinance,
                refinanceLTV: value
              })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Typically 70-80% for investment properties
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate
            </label>
            <PercentageInput
              value={newRefinance.refinanceRate}
              onChange={(value) => setNewRefinance({
                ...newRefinance,
                refinanceRate: value
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (years)
            </label>
            <select
              value={newRefinance.refinanceTermYears}
              onChange={(e) => setNewRefinance({
                ...newRefinance,
                refinanceTermYears: parseInt(e.target.value)
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closing Costs
            </label>
            <CurrencyInput
              value={newRefinance.refinanceClosingCosts}
              onChange={(value) => setNewRefinance({
                ...newRefinance,
                refinanceClosingCosts: value
              })}
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={addRefinanceEvent}
          className="mt-4 py-2 px-4 bg-navy text-white rounded-md hover:bg-navy/80"
        >
          Add Refinance Event
        </button>
      </div>
      
      {/* Scheduled Refinance Events */}
      {refinanceEvents.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="text-lg font-medium text-gray-800">Scheduled Refinance Events</h4>
          
          <div className="overflow-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                    ARV
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                    LTV
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-4 py-2 text-xs font-medium brrrr-table-header uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {refinanceEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap brrrr-table-cell">
                      Month {event.month} ({Math.floor(event.month/12)}y {event.month%12}m)
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap brrrr-table-cell">
                      ${event.afterRepairValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap brrrr-table-cell">
                      {(event.refinanceLTV * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap brrrr-table-cell">
                      {(event.refinanceRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => removeRefinanceEvent(index)}
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
      
      {/* Refinance Analysis */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-blue-800 mb-4">Refinance Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-blue-800">Current Settings</h5>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-sm text-blue-700">Total Investment</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${totalInvestment.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">New Loan Amount</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${potentialLoanAmount.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">Cash Recouped</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${cashRecouped.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">Remaining Investment</p>
                <p className={`text-lg font-semibold ${isSuccessfulBRRRR ? 'text-green-600' : 'text-blue-900'}`}>
                  ${remainingInvestment.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-blue-800">BRRRR Success Targets</h5>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-sm text-blue-700">Minimum ARV Needed</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${minARV.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700">
                  To recover 100% of your investment
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">ARV to Investment Ratio</p>
                <p className="text-lg font-semibold text-blue-900">
                  {(newRefinance.afterRepairValue / totalInvestment).toFixed(2)}x
                </p>
                <p className="text-xs text-blue-700">
                  Target: 1.4x or higher for successful BRRRR
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">BRRRR Status</p>
                <p className={`text-lg font-semibold ${isSuccessfulBRRRR ? 'text-green-600' : 'text-red-600'}`}>
                  {isSuccessfulBRRRR ? 'Successful' : 'Partial'}
                </p>
                <p className="text-xs text-blue-700">
                  {isSuccessfulBRRRR 
                    ? 'You\'ll recoup all of your initial investment!' 
                    : `You'll still have $${remainingInvestment.toLocaleString()} invested`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* BRRRR Strategy Tips */}
      <div className="bg-amber-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-amber-800 mb-2">BRRRR Refinance Tips</h4>
        
        <ul className="list-disc list-inside text-amber-700 space-y-1">
          <li>Consider waiting 6-12 months after purchase to refinance (seasoning)</li>
          <li>Aim for an ARV that's at least 1.4x your total investment</li>
          <li>Compare different refinancing timelines to optimize your returns</li>
          <li>A successful BRRRR lets you recycle your capital into the next deal</li>
          <li>Even a partial BRRRR can be successful if your cash-on-cash return is strong</li>
        </ul>
      </div>
    </div>
  );
}
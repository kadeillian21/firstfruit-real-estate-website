'use client';

import React, { useState, useEffect } from 'react';
import { DealData } from './BRRRRCalculator';
import { 
  generateProjection, 
  ProjectionResult 
} from '../../utils/brrrCalculator/projectionEngine';

interface DealSummaryProps {
  dealData: DealData;
  onSave: () => void;
  onDelete: () => void;
}

export default function DealSummary({
  dealData,
  onSave,
  onDelete
}: DealSummaryProps) {
  // State for projection results
  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  
  // State for selected month (for monthly view)
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  
  // State for compare mode
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareMonth, setCompareMonth] = useState<number>(
    Math.min(dealData.config.projectionMonths, 12)
  );
  
  // Generate projection when dealData changes
  useEffect(() => {
    try {
      const result = generateProjection(dealData.config);
      setProjection(result);
      
      // Update selected month if needed
      if (selectedMonth > result.monthlySnapshots.length) {
        setSelectedMonth(result.monthlySnapshots.length);
      }
      
      // Update compare month if needed
      if (compareMonth > result.monthlySnapshots.length) {
        setCompareMonth(result.monthlySnapshots.length);
      }
    } catch (error) {
      console.error('Error generating projection:', error);
    }
  }, [dealData, selectedMonth, compareMonth]);

  // Handle month selection
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };
  
  // Handle compare month selection
  const handleCompareMonthChange = (month: number) => {
    setCompareMonth(month);
  };

  // Format percentage value
  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(2) + '%';
  };

  // Return loading state if projection not ready
  if (!projection) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculating projection...</p>
        </div>
      </div>
    );
  }

  // Get the snapshot for the selected month
  const selectedSnapshot = projection.monthlySnapshots[selectedMonth - 1];
  
  // Get the snapshot for the compare month
  const compareSnapshot = compareMode 
    ? projection.monthlySnapshots[compareMonth - 1] 
    : null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">
        Deal Summary: {dealData.name}
      </h3>
      
      {/* Key Metrics */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-800">Key Metrics</h4>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="py-2 px-4 bg-grass text-white rounded-md hover:bg-grass/80"
            >
              Save Deal
            </button>
            
            <button
              onClick={onDelete}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Deal
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Investment</p>
            <p className="text-xl font-bold text-navy">
              ${projection.summary.totalInvestment.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Remaining Investment</p>
            <p className={`text-xl font-bold ${
              projection.summary.remainingInvestment <= 0 
                ? 'text-green-600' 
                : 'text-amber-600'
            }`}>
              ${projection.summary.remainingInvestment.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Cash-on-Cash Return</p>
            <p className="text-xl font-bold text-navy">
              {formatPercentage(projection.summary.cashOnCashReturn)}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Internal Rate of Return</p>
            <p className="text-xl font-bold text-navy">
              {formatPercentage(projection.summary.internalRateOfReturn)}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Final Property Value</p>
            <p className="text-xl font-bold text-navy">
              ${projection.summary.finalPropertyValue.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Final Equity</p>
            <p className="text-xl font-bold text-navy">
              ${projection.summary.finalEquity.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Average Monthly Cash Flow</p>
            <p className={`text-xl font-bold ${
              projection.summary.averageMonthlyCashFlow >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              ${projection.summary.averageMonthlyCashFlow.toFixed(2)}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">BRRRR Status</p>
            <p className={`text-xl font-bold ${
              projection.summary.successfulBRRRR
                ? 'text-green-600'
                : 'text-amber-600'
            }`}>
              {projection.summary.successfulBRRRR ? 'Successful' : 'Partial'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Monthly View */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-800">Monthly View</h4>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 flex items-center">
              <input 
                type="checkbox" 
                checked={compareMode}
                onChange={() => setCompareMode(!compareMode)}
                className="mr-2"
              />
              Compare Months
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Month
            </label>
            <div className="flex items-center">
              <input 
                type="range" 
                min="1" 
                max={projection.monthlySnapshots.length}
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="w-full mr-2"
              />
              <span className="text-gray-700 min-w-14 text-center">
                Month {selectedMonth}
              </span>
            </div>
          </div>
          
          {/* Compare Month Selector (if in compare mode) */}
          {compareMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare with Month
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="1" 
                  max={projection.monthlySnapshots.length}
                  value={compareMonth}
                  onChange={(e) => handleCompareMonthChange(parseInt(e.target.value))}
                  className="w-full mr-2"
                />
                <span className="text-gray-700 min-w-14 text-center">
                  Month {compareMonth}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Month Details */}
        <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 mt-4`}>
          {/* Selected Month */}
          <div className="bg-white rounded-lg shadow p-4">
            <h5 className="font-medium text-lg text-gray-800 mb-2">
              Month {selectedMonth} {selectedSnapshot.eventDescription ? `- ${selectedSnapshot.eventDescription}` : ''}
            </h5>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Property Value</span>
                <span className="font-medium">${selectedSnapshot.propertyValue.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Equity</span>
                <span className="font-medium">${selectedSnapshot.equity.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Loan Balance</span>
                <span className="font-medium">${selectedSnapshot.loanBalance.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Remaining Investment</span>
                <span className="font-medium">${selectedSnapshot.remainingInvestment.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Monthly Cash Flow</span>
                <span className={`font-medium ${
                  selectedSnapshot.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${selectedSnapshot.cashFlow.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Cash-on-Cash Return</span>
                <span className="font-medium">
                  {formatPercentage(selectedSnapshot.cashOnCash)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Compare Month (if in compare mode) */}
          {compareMode && compareSnapshot && (
            <div className="bg-white rounded-lg shadow p-4">
              <h5 className="font-medium text-lg text-gray-800 mb-2">
                Month {compareMonth} {compareSnapshot.eventDescription ? `- ${compareSnapshot.eventDescription}` : ''}
              </h5>
              
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Property Value</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.propertyValue.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.propertyValue - selectedSnapshot.propertyValue !== 0 && (
                        <>
                          {compareSnapshot.propertyValue > selectedSnapshot.propertyValue ? '+' : ''}
                          ${(compareSnapshot.propertyValue - selectedSnapshot.propertyValue).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Equity</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.equity.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.equity - selectedSnapshot.equity !== 0 && (
                        <>
                          {compareSnapshot.equity > selectedSnapshot.equity ? '+' : ''}
                          ${(compareSnapshot.equity - selectedSnapshot.equity).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Loan Balance</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.loanBalance.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.loanBalance - selectedSnapshot.loanBalance !== 0 && (
                        <>
                          {compareSnapshot.loanBalance > selectedSnapshot.loanBalance ? '+' : ''}
                          ${(compareSnapshot.loanBalance - selectedSnapshot.loanBalance).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Remaining Investment</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.remainingInvestment.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.remainingInvestment - selectedSnapshot.remainingInvestment !== 0 && (
                        <>
                          {compareSnapshot.remainingInvestment > selectedSnapshot.remainingInvestment ? '+' : ''}
                          ${(compareSnapshot.remainingInvestment - selectedSnapshot.remainingInvestment).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Monthly Cash Flow</span>
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      compareSnapshot.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${compareSnapshot.cashFlow.toFixed(2)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.cashFlow - selectedSnapshot.cashFlow !== 0 && (
                        <>
                          {compareSnapshot.cashFlow > selectedSnapshot.cashFlow ? '+' : ''}
                          ${(compareSnapshot.cashFlow - selectedSnapshot.cashFlow).toFixed(2)}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Cash-on-Cash Return</span>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {formatPercentage(compareSnapshot.cashOnCash)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.cashOnCash - selectedSnapshot.cashOnCash !== 0 && (
                        <>
                          {compareSnapshot.cashOnCash > selectedSnapshot.cashOnCash ? '+' : ''}
                          {formatPercentage(compareSnapshot.cashOnCash - selectedSnapshot.cashOnCash)}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Timeline View */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Timeline View</h4>
        
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Value
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cash Flow
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cumulative Cash Flow
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projection.monthlySnapshots.map((snapshot, index) => {
                // Show every month for the first year, then only every 12 months
                if (index < 12 || index % 12 === 0 || snapshot.eventDescription) {
                  return (
                    <tr key={index} className={snapshot.month === selectedMonth ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {snapshot.month}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${snapshot.propertyValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={snapshot.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${snapshot.cashFlow.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={snapshot.totalCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${snapshot.totalCashFlow.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${snapshot.equity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {snapshot.eventDescription || ''}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Final Analysis */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-blue-800 mb-4">Final Analysis</h4>
        
        <div className="space-y-4">
          <p className="text-blue-700">
            <strong>BRRRR Status:</strong>{' '}
            {projection.summary.successfulBRRRR 
              ? 'This deal successfully recycles your capital, allowing you to reinvest in your next property.' 
              : 'This is a partial BRRRR deal. You will still have some capital invested in the property.'}
          </p>
          
          <p className="text-blue-700">
            <strong>Cash Flow:</strong>{' '}
            {projection.summary.averageMonthlyCashFlow >= 300
              ? 'This deal has strong cash flow - it should provide good monthly income.'
              : projection.summary.averageMonthlyCashFlow >= 100
              ? 'This deal has moderate cash flow - it should cover expenses with some profit.'
              : projection.summary.averageMonthlyCashFlow >= 0
              ? 'This deal has minimal cash flow - it covers costs but provides limited income.'
              : 'This deal has negative cash flow - you may need to contribute additional funds.'}
          </p>
          
          <p className="text-blue-700">
            <strong>Return on Investment:</strong>{' '}
            {projection.summary.internalRateOfReturn >= 0.15
              ? 'This deal has an excellent IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'
              : projection.summary.internalRateOfReturn >= 0.10
              ? 'This deal has a good IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'
              : 'This deal has a modest IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'}
          </p>
          
          <p className="text-blue-700">
            <strong>Key Refinance Events:</strong>{' '}
            {dealData.config.refinanceEvents && dealData.config.refinanceEvents.length > 0
              ? `You've planned ${dealData.config.refinanceEvents.length} refinance event(s) with the first at month ${dealData.config.refinanceEvents[0].month}.`
              : 'You have not scheduled any refinance events.'}
          </p>
        </div>
      </div>
    </div>
  );
}
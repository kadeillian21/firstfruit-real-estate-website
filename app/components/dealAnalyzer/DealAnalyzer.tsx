'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StrategySelector from './StrategySelector';
import Timeline from '../brrrCalculator/Timeline';
import PropertyInfo from '../brrrCalculator/PropertyInfo';
import AcquisitionDetails from '../brrrCalculator/AcquisitionDetails';
import RehabDetails from '../brrrCalculator/RehabDetails';
import RentalDetails from '../brrrCalculator/RentalDetails';
import RefinanceDetails from '../brrrCalculator/RefinanceDetails';
import ProjectionSettings from '../brrrCalculator/ProjectionSettings';
import DealSummary from '../brrrCalculator/DealSummary';
import ShortTermRentalIncome, { STRIncome } from './ShortTermRentalIncome';
import STRExpenses, { STRExpenses as STRExpensesType } from './STRExpenses';
import MultiFamilyUnits, { RentalUnit } from './MultiFamilyUnits';
import HouseHackDetails, { HouseHackConfiguration } from './HouseHackDetails';
import { ProjectionConfig } from '../../utils/brrrCalculator/projectionEngine';

// Investment strategies supported by the calculator
export type InvestmentStrategy = 'brrrr' | 'longTermRental' | 'shortTermRental' | 'multifamily' | 'houseHack';

// Strategy-specific step configurations
const strategySteps: Record<InvestmentStrategy, Array<{ id: string; label: string }>> = {
  brrrr: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'rehab', label: 'Rehab' },
    { id: 'rental', label: 'Rental' },
    { id: 'refinance', label: 'Refinance' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  longTermRental: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'rental', label: 'Rental' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  shortTermRental: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'str-income', label: 'STR Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  multifamily: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'units', label: 'Units' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  houseHack: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'personal-unit', label: 'Your Unit' },
    { id: 'rental-units', label: 'Rental Units' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ]
};

export type DealData = {
  id: string;
  name: string;
  address: string;
  strategy: InvestmentStrategy;
  createdAt: Date;
  updatedAt: Date;
  config: ExtendedProjectionConfig;
};

// Extended type for our all-strategy config
interface ExtendedProjectionConfig extends ProjectionConfig {
  // STR specific fields
  strIncome?: STRIncome;
  strExpenses?: STRExpensesType;
  // Multi-family specific fields
  units?: RentalUnit[];
  // House hack specific fields
  houseHack?: HouseHackConfiguration;
  // General
  purchasePrice?: number;
}

// Default projection configuration
const defaultConfig: ExtendedProjectionConfig = {
  acquisition: {
    purchasePrice: 100000, // Setting a default purchase price
    closingCosts: 3000,
    rehabCosts: 20000,
    rehabDurationMonths: 2,
    purchaseLoanAmount: 80000, // Setting a default loan amount (80% LTV)
    purchaseLoanRate: 0.07,
    purchaseLoanTermYears: 30,
    otherInitialCosts: 0,
    includeHoldingCosts: {
      mortgage: true,
      taxes: true,
      insurance: true,
      maintenance: true,
      propertyManagement: false,
      utilities: true,
      other: false
    }
  },
  operation: {
    monthlyRent: 0,
    otherMonthlyIncome: 0,
    propertyTaxes: 0,
    insurance: 0,
    maintenance: 0,
    propertyManagement: 8, // percentage
    utilities: 0,
    vacancyRate: 5, // percentage
    otherExpenses: 0
  },
  projectionMonths: 60,
  refinanceEvents: [],
  propertyValueChanges: [],
  rentChangeEvents: [],
  expenseChangeEvents: [],
  capitalExpenseEvents: [],
  
  // Short-term rental specific defaults
  strIncome: {
    peakSeasonDaily: 150,
    peakSeasonOccupancy: 90,
    peakSeasonMonths: [6, 7, 8], // Summer months
    midSeasonDaily: 100,
    midSeasonOccupancy: 70,
    midSeasonMonths: [4, 5, 9, 10], // Spring & Fall
    lowSeasonDaily: 80,
    lowSeasonOccupancy: 50,
    lowSeasonMonths: [1, 2, 3, 11, 12], // Winter months
    cleaningFee: 75,
    otherFees: 25,
    platformFee: 3 // percentage
  },
  strExpenses: {
    propertyManagementFee: 20, // percentage
    cleaningCosts: 85, // per turnover
    suppliesPerMonth: 50,
    utilityExpenses: 200,
    propertyTaxes: 2400, // annual
    insurance: 1800, // annual
    furnitureReplacementPercent: 5, // percentage of revenue
    maintenancePercent: 3, // percentage of revenue
    advertisingPerMonth: 50,
    subscriptionServices: 30, // per month
    otherExpenses: 0 // per month
  },
  
  // Multi-family specific defaults
  units: [],
  
  // House hack specific defaults
  houseHack: {
    ownerUnit: {
      unitNumber: 'A',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      marketRent: 1200,
      personalUsage: 100,
      occupancyRate: 95
    },
    currentHousingCost: 1500,
    personalUtilities: 150,
    combinedUtilities: 100,
    combinedInsurance: 1200,
    combinedPropertyTax: 2400,
    rentalUnits: [],
    futurePlan: 'stay',
    futurePropertyValueChange: 3,
    futureDateOfChange: 12
  },
  
  // Common property price reference
  purchasePrice: 0
};

export default function DealAnalyzer() {
  // State for the selected investment strategy
  const [selectedStrategy, setSelectedStrategy] = useState<InvestmentStrategy | null>(null);
  
  // State for the current step in the process
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for the deal data
  const [dealData, setDealData] = useState<DealData>({
    id: uuidv4(),
    name: '',
    address: '',
    strategy: 'longTermRental',
    createdAt: new Date(),
    updatedAt: new Date(),
    config: defaultConfig
  });

  // State for saved deals (would normally be in a database)
  const [savedDeals, setSavedDeals] = useState<DealData[]>([]);
  
  // State to control whether to show the saved deals grid
  const [showSavedDeals, setShowSavedDeals] = useState(false);

  // Reset step when strategy changes
  useEffect(() => {
    if (selectedStrategy) {
      setCurrentStep(0);
      setDealData(prev => ({
        ...prev,
        strategy: selectedStrategy
      }));
    }
  }, [selectedStrategy]);

  // Load saved deals from localStorage on component mount
  useEffect(() => {
    const savedDealsJSON = localStorage.getItem('investmentDeals');
    if (savedDealsJSON) {
      try {
        const parsed = JSON.parse(savedDealsJSON);
        // Convert string dates back to Date objects
        const parsedWithDates = parsed.map((deal: Record<string, unknown>) => ({
          ...deal,
          createdAt: new Date(String(deal.createdAt)),
          updatedAt: new Date(String(deal.updatedAt))
        }));
        setSavedDeals(parsedWithDates);
      } catch (error) {
        console.error('Failed to parse saved deals', error);
      }
    }
  }, []);

  // Save deals to localStorage when savedDeals changes
  useEffect(() => {
    if (savedDeals.length > 0) {
      localStorage.setItem('investmentDeals', JSON.stringify(savedDeals));
    }
  }, [savedDeals]);

  // Helper to get display name for a strategy
  const getStrategyDisplayName = (strategy: InvestmentStrategy): string => {
    const names: Record<InvestmentStrategy, string> = {
      brrrr: 'BRRRR',
      longTermRental: 'Long-Term Rental',
      shortTermRental: 'Short-Term Rental',
      multifamily: 'Multi-Family',
      houseHack: 'House Hack'
    };
    return names[strategy];
  };

  // Get steps for current strategy
  const getStepsForStrategy = (): Array<{ id: string; label: string }> => {
    return selectedStrategy ? strategySteps[selectedStrategy] : [];
  };

  // Handle moving to the next step
  const handleNext = () => {
    const steps = getStepsForStrategy();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle moving to the previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Jump to a specific step
  const jumpToStep = (stepIndex: number) => {
    const steps = getStepsForStrategy();
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Update deal data
  const updateDealData = (updates: Partial<DealData>) => {
    setDealData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  };

  // Save the current deal
  const saveDeal = async () => {
    try {
      const updatedDeal = {
        ...dealData,
        updatedAt: new Date()
      };
      
      // Save to local storage for backup
      const existingDealIndex = savedDeals.findIndex(deal => deal.id === dealData.id);
      
      if (existingDealIndex >= 0) {
        // Update existing deal
        const updatedDeals = [...savedDeals];
        updatedDeals[existingDealIndex] = updatedDeal;
        setSavedDeals(updatedDeals);
      } else {
        // Add new deal
        setSavedDeals([...savedDeals, updatedDeal]);
      }
      
      // Save to database via API
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDeal)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save deal to database');
      }
      
      const responseData = await response.json();
      console.log('Deal saved to database:', responseData);
      
      alert('Deal saved successfully!');
    } catch (error) {
      console.error('Error saving deal:', error);
      alert(`Error saving deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Create a new deal
  const createNewDeal = () => {
    setSelectedStrategy(null);
    setCurrentStep(0);
  };

  // Load a saved deal
  const loadDeal = (dealId: string) => {
    const dealToLoad = savedDeals.find(deal => deal.id === dealId);
    if (dealToLoad) {
      setDealData(dealToLoad);
      setSelectedStrategy(dealToLoad.strategy);
      // Go directly to the summary (final) step
      const steps = dealToLoad.strategy ? strategySteps[dealToLoad.strategy] : [];
      setCurrentStep(steps.length - 1);
    }
  };

  // Delete a deal
  const deleteDeal = (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setSavedDeals(savedDeals.filter(deal => deal.id !== dealId));
      
      // If the current deal is being deleted, create a new one
      if (dealData.id === dealId) {
        createNewDeal();
      }
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    if (!selectedStrategy) {
      return <StrategySelector onStrategySelect={setSelectedStrategy} />;
    }

    const steps = getStepsForStrategy();
    const currentStepId = steps[currentStep]?.id;

    // Common steps across all strategies
    switch (currentStepId) {
      case 'property':
        return (
          <PropertyInfo 
            dealData={dealData} 
            updateDealData={updateDealData} 
          />
        );
      case 'acquisition':
        return (
          <AcquisitionDetails 
            acquisition={dealData.config.acquisition} 
            updateAcquisition={(acquisition) => 
              updateDealData({ 
                config: { 
                  ...dealData.config, 
                  acquisition,
                  // Keep purchasePrice in sync for components that need it directly
                  purchasePrice: acquisition.purchasePrice
                } 
              })
            } 
          />
        );
      case 'projection':
        return (
          <ProjectionSettings 
            projectionMonths={dealData.config.projectionMonths}
            updateProjectionMonths={(projectionMonths) => 
              updateDealData({ 
                config: { ...dealData.config, projectionMonths } 
              })
            }
            propertyValueChanges={dealData.config.propertyValueChanges || []}
            updatePropertyValueChanges={(propertyValueChanges) => 
              updateDealData({ 
                config: { ...dealData.config, propertyValueChanges } 
              })
            }
            rentChangeEvents={dealData.config.rentChangeEvents || []}
            updateRentChangeEvents={(rentChangeEvents) => 
              updateDealData({ 
                config: { ...dealData.config, rentChangeEvents } 
              })
            }
            expenseChangeEvents={dealData.config.expenseChangeEvents || []}
            updateExpenseChangeEvents={(expenseChangeEvents) => 
              updateDealData({ 
                config: { ...dealData.config, expenseChangeEvents } 
              })
            }
            initialMonthlyRent={dealData.config.operation.monthlyRent || 0}
            annualExpenseAppreciationRate={dealData.config.annualExpenseAppreciationRate || 0.02}
            updateExpenseAppreciationRate={(rate) => 
              updateDealData({ 
                config: { ...dealData.config, annualExpenseAppreciationRate: rate } 
              })
            }
          />
        );
      case 'summary':
        return (
          <DealSummary
            dealData={dealData}
            onSave={saveDeal}
            onDelete={() => deleteDeal(dealData.id)}
          />
        );
    }

    // Strategy-specific steps
    if (selectedStrategy === 'brrrr') {
      switch (currentStepId) {
        case 'rehab':
          return (
            <RehabDetails 
              acquisition={dealData.config.acquisition}
              updateAcquisition={(acquisition) => 
                updateDealData({ 
                  config: { ...dealData.config, acquisition } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
        case 'rental':
          return (
            <RentalDetails 
              operation={dealData.config.operation}
              updateOperation={(operation) => 
                updateDealData({ 
                  config: { ...dealData.config, operation } 
                })
              }
              rentChangeEvents={dealData.config.rentChangeEvents || []}
              updateRentChangeEvents={(rentChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, rentChangeEvents } 
                })
              }
              expenseChangeEvents={dealData.config.expenseChangeEvents || []}
              updateExpenseChangeEvents={(expenseChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, expenseChangeEvents } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
        case 'refinance':
          return (
            <RefinanceDetails 
              refinanceEvents={dealData.config.refinanceEvents || []}
              updateRefinanceEvents={(refinanceEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, refinanceEvents } 
                })
              }
              acquisition={dealData.config.acquisition}
            />
          );
      }
    } 
    else if (selectedStrategy === 'longTermRental') {
      switch (currentStepId) {
        case 'rental':
          return (
            <RentalDetails 
              operation={dealData.config.operation}
              updateOperation={(operation) => 
                updateDealData({ 
                  config: { ...dealData.config, operation } 
                })
              }
              rentChangeEvents={dealData.config.rentChangeEvents || []}
              updateRentChangeEvents={(rentChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, rentChangeEvents } 
                })
              }
              expenseChangeEvents={dealData.config.expenseChangeEvents || []}
              updateExpenseChangeEvents={(expenseChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, expenseChangeEvents } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
      }
    }
    else if (selectedStrategy === 'shortTermRental') {
      switch (currentStepId) {
        case 'str-income':
          return (
            <ShortTermRentalIncome
              strIncome={dealData.config.strIncome || defaultConfig.strIncome!}
              updateSTRIncome={(strIncome) => 
                updateDealData({ 
                  config: { ...dealData.config, strIncome } 
                })
              }
            />
          );
        case 'expenses':
          return (
            <STRExpenses
              strIncome={dealData.config.strIncome || defaultConfig.strIncome!}
              strExpenses={dealData.config.strExpenses || defaultConfig.strExpenses!}
              updateSTRExpenses={(strExpenses) => 
                updateDealData({ 
                  config: { ...dealData.config, strExpenses } 
                })
              }
            />
          );
      }
    }
    else if (selectedStrategy === 'multifamily') {
      switch (currentStepId) {
        case 'units':
          return (
            <MultiFamilyUnits
              units={dealData.config.units || []}
              updateUnits={(units) => 
                updateDealData({ 
                  config: { ...dealData.config, units } 
                })
              }
            />
          );
        case 'expenses':
          return (
            <RentalDetails 
              operation={dealData.config.operation}
              updateOperation={(operation) => 
                updateDealData({ 
                  config: { ...dealData.config, operation } 
                })
              }
              rentChangeEvents={dealData.config.rentChangeEvents || []}
              updateRentChangeEvents={(rentChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, rentChangeEvents } 
                })
              }
              expenseChangeEvents={dealData.config.expenseChangeEvents || []}
              updateExpenseChangeEvents={(expenseChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, expenseChangeEvents } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
      }
    }
    else if (selectedStrategy === 'houseHack') {
      switch (currentStepId) {
        case 'personal-unit':
        case 'rental-units':
        case 'expenses':
          return (
            <HouseHackDetails
              houseHack={{
                ...defaultConfig.houseHack!,
                ...dealData.config.houseHack,
                purchasePrice: dealData.config.acquisition.purchasePrice
              }}
              updateHouseHack={(houseHack) => 
                updateDealData({ 
                  config: { ...dealData.config, houseHack } 
                })
              }
            />
          );
      }
    }
    
    // Default fallback for any undefined steps
    return <div>This step is under development</div>;
  };

  // Don't show the timeline until a strategy is selected
  const steps = selectedStrategy ? getStepsForStrategy() : [];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      {/* Deal selector and controls */}
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {/* Create New Deal button - only show if strategy is selected */}
          {selectedStrategy && (
            <button 
              onClick={createNewDeal}
              className="bg-grass text-white py-2 px-4 rounded-md hover:bg-grass/90 transition-colors font-medium shadow-sm"
            >
              New Deal
            </button>
          )}
          
          {/* Deal Library Button - Toggle saved deals view */}
          {savedDeals.length > 0 && (
            <button
              onClick={() => setShowSavedDeals(!showSavedDeals)}
              className="bg-navy text-white py-2 px-4 rounded-md hover:bg-navy/90 transition-colors font-medium shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {showSavedDeals ? 'Hide Saved Deals' : 'View Saved Deals'}
            </button>
          )}
        </div>
        
        {selectedStrategy && (
          <div>
            <button 
              onClick={saveDeal}
              className="bg-navy text-white py-2 px-4 rounded-md hover:bg-navy/90 transition-colors font-medium shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Deal
            </button>
          </div>
        )}
      </div>
      
      {/* Saved Deals Grid */}
      {showSavedDeals && savedDeals.length > 0 && (
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Saved Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDeals.map(deal => (
              <div 
                key={deal.id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => loadDeal(deal.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{deal.address || "Untitled Deal"}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {new Date(deal.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy text-white">
                    {getStrategyDisplayName(deal.strategy)}
                  </span>
                </div>
                
                {/* Quick stats if available */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm grid grid-cols-2 gap-2">
                  {deal.config.purchasePrice ? (
                    <div>
                      <span className="text-gray-500">Purchase:</span> ${deal.config.purchasePrice.toLocaleString()}
                    </div>
                  ) : null}
                  
                  {deal.config.operation?.monthlyRent ? (
                    <div>
                      <span className="text-gray-500">Monthly Rent:</span> ${deal.config.operation.monthlyRent.toLocaleString()}
                    </div>
                  ) : null}
                </div>
                
                <div className="mt-3 flex justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      loadDeal(deal.id);
                    }}
                    className="text-navy hover:text-navy/80 text-sm font-medium"
                  >
                    View Deal
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDeal(deal.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current deal info */}
      {selectedStrategy && (
        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{dealData.address || "New Deal"}</h2>
            </div>
            <div className="px-3 py-1.5 bg-navy text-white rounded-lg font-medium">
              {getStrategyDisplayName(dealData.strategy)}
            </div>
          </div>
        </div>
      )}

      {/* Timeline navigation */}
      {selectedStrategy && (
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <Timeline 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={jumpToStep} 
          />
        </div>
      )}
      
      {/* Step content */}
      <div className="my-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      {selectedStrategy && (
        <div className="flex justify-between mt-8 border-t border-gray-200 pt-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`py-2 px-6 rounded-md transition-colors font-medium shadow-sm flex items-center ${
              currentStep === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-navy text-white hover:bg-navy/90'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`py-2 px-6 rounded-md transition-colors font-medium shadow-sm flex items-center ${
              currentStep === steps.length - 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-grass text-white hover:bg-grass/90'
            }`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
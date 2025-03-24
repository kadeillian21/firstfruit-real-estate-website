'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Timeline from './Timeline';
import PropertyInfo from './PropertyInfo';
import AcquisitionDetails from './AcquisitionDetails';
import RehabDetails from './RehabDetails';
import RentalDetails from './RentalDetails';
import RefinanceDetails from './RefinanceDetails';
import ProjectionSettings from './ProjectionSettings';
import DealSummary from './DealSummary';
import { ProjectionConfig } from '../../utils/brrrCalculator/projectionEngine';

export type DealData = {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  config: ProjectionConfig;
};

// Default projection configuration
const defaultConfig: ProjectionConfig = {
  acquisition: {
    purchasePrice: 0,
    closingCosts: 0,
    rehabCosts: 0,
    rehabDurationMonths: 0,
    purchaseLoanAmount: 0,
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
  capitalExpenseEvents: []
};

// Steps in the BRRRR calculator process
const steps = [
  { id: 'property', label: 'Property Info' },
  { id: 'acquisition', label: 'Acquisition' },
  { id: 'rehab', label: 'Rehab' },
  { id: 'rental', label: 'Rental' },
  { id: 'refinance', label: 'Refinance' },
  { id: 'projection', label: 'Projection' },
  { id: 'summary', label: 'Summary' }
];

export default function BRRRRCalculator() {
  // State for the current step in the process
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for the deal data
  const [dealData, setDealData] = useState<DealData>({
    id: uuidv4(),
    name: 'New BRRRR Deal',
    address: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    config: defaultConfig
  });

  // State for saved deals (would normally be in a database)
  const [savedDeals, setSavedDeals] = useState<DealData[]>([]);

  // Load saved deals from localStorage on component mount
  useEffect(() => {
    const savedDealsJSON = localStorage.getItem('brrrDeals');
    if (savedDealsJSON) {
      try {
        const parsed = JSON.parse(savedDealsJSON);
        // Convert string dates back to Date objects
        const parsedWithDates = parsed.map((deal: any) => ({
          ...deal,
          createdAt: new Date(deal.createdAt),
          updatedAt: new Date(deal.updatedAt)
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
      localStorage.setItem('brrrDeals', JSON.stringify(savedDeals));
    }
  }, [savedDeals]);

  // Handle moving to the next step
  const handleNext = () => {
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
  const saveDeal = () => {
    const updatedDeal = {
      ...dealData,
      updatedAt: new Date()
    };
    
    // Check if we're updating an existing deal or adding a new one
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

    alert('Deal saved successfully!');
  };

  // Create a new deal
  const createNewDeal = () => {
    setDealData({
      id: uuidv4(),
      name: 'New BRRRR Deal',
      address: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      config: defaultConfig
    });
    setCurrentStep(0);
  };

  // Load a saved deal
  const loadDeal = (dealId: string) => {
    const dealToLoad = savedDeals.find(deal => deal.id === dealId);
    if (dealToLoad) {
      setDealData(dealToLoad);
      setCurrentStep(0);
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
    switch (steps[currentStep].id) {
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
                config: { ...dealData.config, acquisition } 
              })
            } 
          />
        );
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
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      {/* Deal selector and controls */}
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={createNewDeal}
            className="bg-grass text-white py-2 px-4 rounded-md hover:bg-grass/90 transition-colors font-medium shadow-sm"
          >
            New Deal
          </button>
          
          {savedDeals.length > 0 && (
            <select 
              onChange={(e) => loadDeal(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4 text-gray-900 focus:ring-navy focus:border-navy"
              value=""
            >
              <option value="" disabled>Load saved deal</option>
              {savedDeals.map(deal => (
                <option key={deal.id} value={deal.id}>
                  {deal.name} - {deal.address}
                </option>
              ))}
            </select>
          )}
        </div>
        
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
      </div>

      {/* Current deal name and step */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{dealData.name}</h2>
        {dealData.address && <p className="text-gray-900">{dealData.address}</p>}
      </div>

      {/* Timeline navigation */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <Timeline 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={jumpToStep} 
        />
      </div>
      
      {/* Step content */}
      <div className="my-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
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
    </div>
  );
}
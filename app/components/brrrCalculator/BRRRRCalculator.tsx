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
    purchasePrice: 100000,
    closingCosts: 3000,
    rehabCosts: 25000,
    rehabDurationMonths: 2,
    purchaseLoanAmount: 75000,
    purchaseLoanRate: 0.06,
    purchaseLoanTermYears: 30,
    otherInitialCosts: 2000
  },
  operation: {
    monthlyRent: 1200,
    otherMonthlyIncome: 0,
    propertyTaxes: 1800,
    insurance: 1200,
    maintenance: 100,
    propertyManagement: 10, // percentage
    utilities: 0,
    vacancyRate: 5, // percentage
    otherExpenses: 50
  },
  projectionMonths: 60,
  refinanceEvents: [
    {
      month: 3,
      afterRepairValue: 150000,
      refinanceLTV: 0.75,
      refinanceRate: 0.05,
      refinanceTermYears: 30,
      refinanceClosingCosts: 3500
    }
  ],
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
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Deal selector and controls */}
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <button 
            onClick={createNewDeal}
            className="bg-grass text-white py-2 px-4 rounded-lg hover:bg-grass/80 mr-2"
          >
            New Deal
          </button>
          
          {savedDeals.length > 0 && (
            <select 
              onChange={(e) => loadDeal(e.target.value)}
              className="border rounded-lg py-2 px-4"
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
            className="bg-navy text-white py-2 px-4 rounded-lg hover:bg-navy/80"
          >
            Save Deal
          </button>
        </div>
      </div>

      {/* Current deal name and step */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-semibold">{dealData.name}</h2>
        {dealData.address && <p className="text-gray-600">{dealData.address}</p>}
      </div>

      {/* Timeline navigation */}
      <Timeline 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={jumpToStep} 
      />
      
      {/* Step content */}
      <div className="my-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`py-2 px-6 rounded-lg ${
            currentStep === 0 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-navy text-white hover:bg-navy/80'
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className={`py-2 px-6 rounded-lg ${
            currentStep === steps.length - 1 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-grass text-white hover:bg-grass/80'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
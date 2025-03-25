'use client';

import React from 'react';

interface Step {
  id: string;
  label: string;
}

interface TimelineProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export default function Timeline({ steps, currentStep, onStepClick }: TimelineProps) {
  return (
    <div className="relative py-2">
      {/* Horizontal line connecting steps */}
      <div className="hidden sm:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
      
      {/* Progress line (fills in as steps are completed) */}
      <div 
        className="hidden sm:block absolute top-1/2 left-0 h-1 bg-grass -translate-y-1/2 z-0 transition-all duration-300"
        style={{ 
          width: `${currentStep / (steps.length - 1) * 100}%`,
          maxWidth: currentStep === steps.length - 1 ? '100%' : `calc(${currentStep / (steps.length - 1) * 100}% + 1rem)`
        }}
      ></div>
      
      {/* Steps with fixed positioning */}
      <div className="relative flex flex-col sm:grid z-10" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((step, index) => {
          // Determine step status
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          // Calculate percentage position for the bubble
          // const position = index === 0 ? 0 : index === steps.length - 1 ? 100 : (index / (steps.length - 1)) * 100;
          
          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center mb-4 sm:mb-0 cursor-pointer group"
              onClick={() => onStepClick(index)}
            >
              {/* Step circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-grass border-grass text-white shadow-md'
                    : isCurrent
                    ? 'bg-navy border-navy text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-900 group-hover:border-gray-400 group-hover:bg-gray-50'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Step label */}
              <div className="mt-2 text-center">
                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isCurrent
                      ? 'text-navy'
                      : isCompleted
                      ? 'text-grass'
                      : 'text-gray-900 group-hover:text-gray-700'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Mobile connector line (only between steps) */}
              {index < steps.length - 1 && (
                <div className={`sm:hidden w-1 h-8 my-1 ${isCompleted ? 'bg-grass' : 'bg-gray-200'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
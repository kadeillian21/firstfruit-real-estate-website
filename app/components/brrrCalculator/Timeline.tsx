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
    <div className="relative">
      {/* Horizontal line connecting steps */}
      <div className="hidden sm:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
      
      {/* Steps */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center z-10">
        {steps.map((step, index) => {
          // Determine step status
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={step.id} 
              className={`flex flex-col items-center mb-4 sm:mb-0 cursor-pointer group ${
                index === steps.length - 1 ? '' : 'sm:flex-1'
              }`}
              onClick={() => onStepClick(index)}
            >
              {/* Step circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-grass text-white'
                    : isCurrent
                    ? 'bg-navy text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step label */}
              <div className="mt-2 text-center">
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-navy'
                      : isCompleted
                      ? 'text-grass'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Mobile connector line (only between steps) */}
              {index < steps.length - 1 && (
                <div className="sm:hidden w-1 h-6 bg-gray-200 my-1"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import BRRRRCalculator from '../components/brrrCalculator/BRRRRCalculator';

export default function BRRRRCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">BRRRR Deal Calculator</h1>
      <p className="text-center mb-8 max-w-3xl mx-auto text-white/90">
        Analyze your Buy, Rehab, Rent, Refinance, Repeat deals with precision. Track how refinancing
        at different times affects your returns and see the complete financial picture.
      </p>
      <BRRRRCalculator />
    </div>
  );
}
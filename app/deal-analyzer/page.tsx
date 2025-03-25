import React from 'react';
import DealAnalyzer from '../components/dealAnalyzer/DealAnalyzer';

export default function DealAnalyzerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Real Estate Deal Analyzer</h1>
      <p className="text-center mb-8 max-w-3xl mx-auto">
        Analyze different real estate investment strategies including long-term rentals, 
        BRRRR deals, and more. Calculate returns, cash flow, and compare different approaches.
      </p>
      <DealAnalyzer />
    </div>
  );
}
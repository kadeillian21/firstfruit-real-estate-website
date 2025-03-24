'use client';

import React from 'react';
import { DealData } from './BRRRRCalculator';

interface PropertyInfoProps {
  dealData: DealData;
  updateDealData: (updates: Partial<DealData>) => void;
}

export default function PropertyInfo({ dealData, updateDealData }: PropertyInfoProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Property Information</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-600 mb-4">
          Start by giving your BRRRR deal a name and adding the property address.
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="dealName" className="block text-sm font-medium text-gray-700 mb-1">
              Deal Name
            </label>
            <input
              type="text"
              id="dealName"
              value={dealData.name}
              onChange={(e) => updateDealData({ name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-navy focus:border-navy"
              placeholder="e.g., Main Street Duplex"
            />
          </div>
          
          <div>
            <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Property Address
            </label>
            <input
              type="text"
              id="propertyAddress"
              value={dealData.address}
              onChange={(e) => updateDealData({ address: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-navy focus:border-navy"
              placeholder="e.g., 123 Main St, Anytown, USA"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">What is the BRRRR strategy?</h4>
        <p className="text-blue-700 mb-2">
          BRRRR stands for <strong>Buy, Rehab, Rent, Refinance, Repeat</strong>. It's a real estate investing strategy that allows you to build a rental portfolio with limited capital.
        </p>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li><strong>Buy</strong> - Purchase a property below market value</li>
          <li><strong>Rehab</strong> - Renovate to increase the property value</li>
          <li><strong>Rent</strong> - Place quality tenants to generate cash flow</li>
          <li><strong>Refinance</strong> - Pull out equity through a cash-out refinance</li>
          <li><strong>Repeat</strong> - Use the cash-out funds to start again with a new property</li>
        </ul>
      </div>
    </div>
  );
}
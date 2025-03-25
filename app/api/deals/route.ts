import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get or create a default user for the application
async function getOrCreateDefaultUser() {
  // Check if default user exists
  const defaultUser = await prisma.user.findFirst({
    where: {
      email: 'default@firstfruit.com'
    }
  });

  if (defaultUser) {
    return defaultUser;
  }

  // Create a default user if none exists
  return prisma.user.create({
    data: {
      name: 'Default User',
      email: 'default@firstfruit.com',
    }
  });
}

// API route for saving a deal
export async function POST(request: Request) {
  try {
    // Get the deal data from the request body
    let dealData;
    try {
      dealData = await request.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Return a more detailed error message
      return NextResponse.json({ 
        error: `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
        requestContentType: request.headers.get('content-type') 
      }, { status: 400 });
    }
    
    // Check if the deal data is valid
    if (!dealData || !dealData.id || !dealData.name) {
      return NextResponse.json({ error: 'Invalid deal data' }, { status: 400 });
    }
    
    // Get or create the default user
    const user = await getOrCreateDefaultUser();
    
    // Store the deal in the database
    // For now, we'll save it as a Scenario (based on the Prisma schema)
    const savedDeal = await prisma.scenario.create({
      data: {
        name: dealData.name,
        description: dealData.address || '',
        // Use the default user ID
        userId: user.id,
        
        // Map deal fields to Scenario model fields
        purchasePrice: dealData.config.acquisition.purchasePrice,
        closingCosts: dealData.config.acquisition.closingCosts,
        downPaymentPercent: (100 - (dealData.config.acquisition.purchaseLoanAmount / dealData.config.acquisition.purchasePrice * 100)),
        interestRate: dealData.config.acquisition.purchaseLoanRate * 100,
        loanTermYears: dealData.config.acquisition.purchaseLoanTermYears,
        propertyTaxRate: dealData.config.operation.propertyTaxes / dealData.config.acquisition.purchasePrice * 100,
        insuranceAnnual: dealData.config.operation.insurance,
        utilityPriceMonthly: dealData.config.operation.utilities,
        
        // Rehab fields
        rehabCost: dealData.config.acquisition.rehabCosts,
        rehabTimeMonths: dealData.config.acquisition.rehabDurationMonths,
        holdingCostsMonthly: 0, // Would need to calculate from the deal data
        
        // After Repair Value - use the first refinance event if available
        afterRepairValue: dealData.config.refinanceEvents?.[0]?.afterRepairValue || 
          (dealData.config.acquisition.purchasePrice + dealData.config.acquisition.rehabCosts),
        
        // Rental details
        monthlyRent: dealData.config.operation.monthlyRent,
        vacancyRatePercent: dealData.config.operation.vacancyRate,
        propertyMgmtPercent: dealData.config.operation.propertyManagement,
        maintenancePercent: 5, // Default value
        capExPercent: 5, // Default value
        
        // Refinance details if available
        refinanceLTV: dealData.config.refinanceEvents?.[0]?.refinanceLTV * 100 || 75,
        refinanceRate: dealData.config.refinanceEvents?.[0]?.refinanceRate * 100 || null,
        refinanceTermYears: dealData.config.refinanceEvents?.[0]?.refinanceTermYears || null,
        refinanceClosingCosts: dealData.config.refinanceEvents?.[0]?.refinanceClosingCosts || 0,
        
        // Projection settings
        projectionYears: Math.ceil(dealData.config.projectionMonths / 12),
        appreciationPercent: 3, // Default value
        rentGrowthPercent: 2, // Default value
        expenseGrowthPercent: dealData.config.annualExpenseAppreciationRate * 100 || 2,
      }
    });
    
    return NextResponse.json({ success: true, deal: savedDeal });
    
  } catch (error) {
    console.error('Error saving deal:', error);
    // Return a detailed error message
    return NextResponse.json({ 
      error: 'Failed to save deal', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// API route for retrieving deals
export async function GET() {
  try {
    // Get the default user
    const user = await getOrCreateDefaultUser();
    
    // Get deals for the default user
    const deals = await prisma.scenario.findMany({
      where: {
        userId: user.id
      }
    });
    
    return NextResponse.json({ deals });
    
  } catch (error) {
    console.error('Error retrieving deals:', error);
    return NextResponse.json({ error: 'Failed to retrieve deals' }, { status: 500 });
  }
}
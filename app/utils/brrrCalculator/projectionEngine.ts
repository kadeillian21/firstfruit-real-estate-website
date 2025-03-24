import { MonthlyIncome, MonthlyExpenses } from './cashFlowCalculator';
import { calculateMonthlyMortgagePayment } from './mortgageCalculator';
import { RefinanceParams, calculateRefinance } from './refinanceCalculator';

/**
 * Initial property acquisition details
 */
export interface PropertyAcquisition {
  purchasePrice: number;
  closingCosts: number;
  rehabCosts: number;
  rehabDurationMonths: number;
  purchaseLoanAmount?: number;
  purchaseLoanRate?: number;
  purchaseLoanTermYears?: number;
  otherInitialCosts?: number;
}

/**
 * Property operation details
 */
export interface PropertyOperation {
  monthlyRent: number;
  otherMonthlyIncome: number;
  propertyTaxes: number;
  insurance: number;
  maintenance: number;
  propertyManagement: number;
  utilities: number;
  vacancyRate: number;
  otherExpenses: number;
}

/**
 * Refinance event parameters
 */
export interface RefinanceEvent {
  month: number;
  afterRepairValue: number;
  refinanceLTV: number;
  refinanceRate: number;
  refinanceTermYears: number;
  refinanceClosingCosts: number;
}

/**
 * Property value change event (appreciation/depreciation)
 */
export interface PropertyValueChangeEvent {
  month: number;
  newValue: number;
}

/**
 * Rent change event
 */
export interface RentChangeEvent {
  month: number;
  newRent: number;
}

/**
 * Expense change event for any property expense
 */
export interface ExpenseChangeEvent {
  month: number;
  expenseType: keyof MonthlyExpenses;
  newAmount: number;
}

/**
 * One-time capital expense
 */
export interface CapitalExpenseEvent {
  month: number;
  description: string;
  amount: number;
}

/**
 * Configuration for the projection
 */
export interface ProjectionConfig {
  acquisition: PropertyAcquisition;
  operation: PropertyOperation;
  projectionMonths: number;
  refinanceEvents?: RefinanceEvent[];
  propertyValueChanges?: PropertyValueChangeEvent[];
  rentChangeEvents?: RentChangeEvent[];
  expenseChangeEvents?: ExpenseChangeEvent[];
  capitalExpenseEvents?: CapitalExpenseEvent[];
}

/**
 * Monthly financial snapshot
 */
export interface MonthlySnapshot {
  month: number;
  propertyValue: number;
  totalInvestment: number;
  remainingInvestment: number;
  loanBalance: number;
  monthlyIncome: MonthlyIncome;
  monthlyExpenses: MonthlyExpenses;
  cashFlow: number;
  totalCashFlow: number;
  equity: number;
  cashOnCash: number;
  eventDescription?: string;
}

/**
 * Final projection summary
 */
export interface ProjectionSummary {
  totalInvestment: number;
  remainingInvestment: number;
  totalCashFlow: number;
  finalPropertyValue: number;
  finalEquity: number;
  finalLoanBalance: number;
  totalAppreciation: number;
  averageMonthlyCashFlow: number;
  cashOnCashReturn: number;
  returnOnInvestment: number;
  internalRateOfReturn: number;
  successfulBRRRR: boolean;
}

/**
 * Complete projection result
 */
export interface ProjectionResult {
  monthlySnapshots: MonthlySnapshot[];
  summary: ProjectionSummary;
}

/**
 * Generates a complete BRRRR deal projection with month-by-month financials
 * 
 * @param config - Projection configuration
 * @returns Complete projection with monthly snapshots and summary
 */
export function generateProjection(config: ProjectionConfig): ProjectionResult {
  const snapshots: MonthlySnapshot[] = [];
  
  // Initialize tracking variables
  let currentMonth = 1;
  let propertyValue = config.acquisition.purchasePrice;
  let totalInvestment = 
    config.acquisition.purchasePrice + 
    config.acquisition.closingCosts + 
    config.acquisition.rehabCosts +
    (config.acquisition.otherInitialCosts || 0);
  let remainingInvestment = totalInvestment;
  let loanBalance = config.acquisition.purchaseLoanAmount || 0;
  let totalCashFlow = 0;
  let currentRent = config.operation.monthlyRent;
  let isRehab = true;
  let rehabbingMonths = config.acquisition.rehabDurationMonths;
  
  // Create a map of monthly expenses for easier updating
  const currentExpenses: MonthlyExpenses = {
    mortgage: loanBalance > 0 
      ? calculateMonthlyMortgagePayment(
          loanBalance, 
          config.acquisition.purchaseLoanRate || 0, 
          config.acquisition.purchaseLoanTermYears || 30
        ) 
      : 0,
    taxes: config.operation.propertyTaxes / 12,
    insurance: config.operation.insurance / 12,
    maintenance: config.operation.maintenance,
    propertyManagement: currentRent * (config.operation.propertyManagement / 100),
    utilities: config.operation.utilities,
    vacancyAllowance: currentRent * (config.operation.vacancyRate / 100),
    otherExpenses: config.operation.otherExpenses
  };
  
  // Process each month of the projection
  while (currentMonth <= config.projectionMonths) {
    let eventDescription = '';
    
    // Check for refinance event
    const refinanceEvent = (config.refinanceEvents || []).find(e => e.month === currentMonth);
    if (refinanceEvent) {
      propertyValue = refinanceEvent.afterRepairValue;
      
      const refinanceParams: RefinanceParams = {
        afterRepairValue: refinanceEvent.afterRepairValue,
        totalInvestment: remainingInvestment,
        refinanceLTV: refinanceEvent.refinanceLTV,
        refinanceRate: refinanceEvent.refinanceRate,
        refinanceTermYears: refinanceEvent.refinanceTermYears,
        refinanceClosingCosts: refinanceEvent.refinanceClosingCosts
      };
      
      const outcome = calculateRefinance(refinanceParams);
      
      loanBalance = outcome.newLoanAmount;
      remainingInvestment = outcome.remainingInvestment;
      currentExpenses.mortgage = outcome.newMonthlyPayment;
      
      eventDescription = `Refinanced property at ${Math.round(refinanceEvent.refinanceLTV * 100)}% LTV`;
      if (outcome.isBRRRRSuccessful) {
        eventDescription += ' - Successfully pulled out all capital';
      }
    }
    
    // Check for property value change
    const valueChangeEvent = (config.propertyValueChanges || []).find(e => e.month === currentMonth);
    if (valueChangeEvent) {
      propertyValue = valueChangeEvent.newValue;
      eventDescription = `Property value changed to $${valueChangeEvent.newValue.toLocaleString()}`;
    }
    
    // Check for rent change
    const rentChangeEvent = (config.rentChangeEvents || []).find(e => e.month === currentMonth);
    if (rentChangeEvent) {
      currentRent = rentChangeEvent.newRent;
      // Update property management and vacancy based on new rent
      currentExpenses.propertyManagement = currentRent * (config.operation.propertyManagement / 100);
      currentExpenses.vacancyAllowance = currentRent * (config.operation.vacancyRate / 100);
      
      eventDescription = `Rent changed to $${rentChangeEvent.newRent.toLocaleString()} per month`;
    }
    
    // Check for expense changes
    const expenseChangeEvent = (config.expenseChangeEvents || []).find(e => e.month === currentMonth);
    if (expenseChangeEvent) {
      currentExpenses[expenseChangeEvent.expenseType] = expenseChangeEvent.newAmount;
      eventDescription = `${expenseChangeEvent.expenseType} expense changed to $${expenseChangeEvent.newAmount.toLocaleString()}`;
    }
    
    // Check for capital expense
    const capitalExpenseEvent = (config.capitalExpenseEvents || []).find(e => e.month === currentMonth);
    if (capitalExpenseEvent) {
      totalInvestment += capitalExpenseEvent.amount;
      remainingInvestment += capitalExpenseEvent.amount;
      eventDescription = `Capital expense: ${capitalExpenseEvent.description} - $${capitalExpenseEvent.amount.toLocaleString()}`;
    }
    
    // Calculate current income
    const currentIncome: MonthlyIncome = {
      rent: isRehab ? 0 : currentRent,
      otherIncome: isRehab ? 0 : config.operation.otherMonthlyIncome
    };
    
    // Calculate cash flow for this month
    const cashFlow = isRehab ? 0 : (currentIncome.rent + currentIncome.otherIncome) - 
      Object.values(currentExpenses).reduce((sum, value) => sum + value, 0);
    
    // Update total cash flow
    totalCashFlow += cashFlow;
    
    // Calculate equity
    const equity = propertyValue - loanBalance;
    
    // Calculate cash-on-cash return (annualized for this month)
    const annualizedCashFlow = cashFlow * 12;
    const cashOnCash = remainingInvestment > 0 ? annualizedCashFlow / remainingInvestment : 0;
    
    // Add snapshot for this month
    snapshots.push({
      month: currentMonth,
      propertyValue,
      totalInvestment,
      remainingInvestment,
      loanBalance,
      monthlyIncome: { ...currentIncome },
      monthlyExpenses: { ...currentExpenses },
      cashFlow,
      totalCashFlow,
      equity,
      cashOnCash,
      eventDescription: eventDescription || undefined
    });
    
    // Update rehab status
    if (isRehab && rehabbingMonths > 0) {
      rehabbingMonths--;
      if (rehabbingMonths === 0) {
        isRehab = false;
        eventDescription = 'Rehabilitation completed, property ready for rental';
      }
    }
    
    // Move to next month
    currentMonth++;
  }
  
  // Calculate final metrics for summary
  const initialSnapshot = snapshots[0];
  const finalSnapshot = snapshots[snapshots.length - 1];
  
  // Calculate cash flows for IRR
  const cashFlows = [-initialSnapshot.totalInvestment];
  snapshots.forEach(snapshot => {
    cashFlows.push(snapshot.cashFlow);
  });
  
  // Add final property value to last cash flow (as if property was sold)
  cashFlows[cashFlows.length - 1] += finalSnapshot.propertyValue - finalSnapshot.loanBalance;
  
  // Calculate IRR
  let irr = 0;
  try {
    // Use a simple internal IRR calculation (replace with library in production)
    irr = calculateSimpleIRR(cashFlows, 12) || 0;
  } catch (e) {
    console.error('IRR calculation failed:', e);
  }
  
  // Create summary
  const summary: ProjectionSummary = {
    totalInvestment: initialSnapshot.totalInvestment,
    remainingInvestment: finalSnapshot.remainingInvestment,
    totalCashFlow: finalSnapshot.totalCashFlow,
    finalPropertyValue: finalSnapshot.propertyValue,
    finalEquity: finalSnapshot.equity,
    finalLoanBalance: finalSnapshot.loanBalance,
    totalAppreciation: finalSnapshot.propertyValue - initialSnapshot.propertyValue,
    averageMonthlyCashFlow: finalSnapshot.totalCashFlow / snapshots.length,
    cashOnCashReturn: finalSnapshot.remainingInvestment > 0 
      ? (finalSnapshot.cashFlow * 12) / finalSnapshot.remainingInvestment 
      : 0,
    returnOnInvestment: (finalSnapshot.totalCashFlow + finalSnapshot.equity - initialSnapshot.equity) / 
      initialSnapshot.totalInvestment,
    internalRateOfReturn: irr,
    successfulBRRRR: finalSnapshot.remainingInvestment <= 0
  };
  
  return {
    monthlySnapshots: snapshots,
    summary
  };
}

/**
 * Simple IRR calculation method
 * 
 * @param cashFlows - Array of cash flows (first is investment, rest are returns)
 * @param iterations - Number of iterations to attempt
 * @returns Estimated IRR or null if calculation fails
 */
function calculateSimpleIRR(cashFlows: number[], iterations: number = 100): number | null {
  // IRR calculation using trial and error approach
  let guess = 0.1; // Start with 10%
  let step = 0.01;
  
  for (let i = 0; i < iterations; i++) {
    const npv = calculateNPV(cashFlows, guess);
    
    if (Math.abs(npv) < 0.1) {
      return guess;
    }
    
    if (npv > 0) {
      guess += step;
    } else {
      guess -= step;
    }
    
    step = step / 2;
  }
  
  return null;
}

/**
 * Calculate Net Present Value for a series of cash flows
 * 
 * @param cashFlows - Array of cash flows
 * @param rate - Discount rate
 * @returns Net Present Value
 */
function calculateNPV(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((npv, flow, index) => {
    return npv + flow / Math.pow(1 + rate, index);
  }, 0);
}
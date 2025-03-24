-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PURCHASE', 'REHAB_START', 'REHAB_END', 'TENANT_MOVE_IN', 'REFINANCE', 'PROPERTY_SALE', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DECIMAL(65,30) NOT NULL,
    "closingCosts" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "downPaymentPercent" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30) NOT NULL,
    "loanTermYears" INTEGER NOT NULL DEFAULT 30,
    "propertyTaxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "insuranceAnnual" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "utilityPriceMonthly" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rehabCost" DECIMAL(65,30) NOT NULL,
    "rehabTimeMonths" INTEGER NOT NULL DEFAULT 3,
    "holdingCostsMonthly" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "afterRepairValue" DECIMAL(65,30) NOT NULL,
    "monthlyRent" DECIMAL(65,30) NOT NULL,
    "vacancyRatePercent" DECIMAL(65,30) NOT NULL DEFAULT 8.33,
    "propertyMgmtPercent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "maintenancePercent" DECIMAL(65,30) NOT NULL DEFAULT 5,
    "capExPercent" DECIMAL(65,30) NOT NULL DEFAULT 5,
    "refinanceLTV" DECIMAL(65,30) NOT NULL DEFAULT 75,
    "refinanceRate" DECIMAL(65,30),
    "refinanceTermYears" INTEGER,
    "refinanceClosingCosts" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "projectionYears" INTEGER NOT NULL DEFAULT 5,
    "appreciationPercent" DECIMAL(65,30) NOT NULL DEFAULT 3,
    "rentGrowthPercent" DECIMAL(65,30) NOT NULL DEFAULT 2,
    "expenseGrowthPercent" DECIMAL(65,30) NOT NULL DEFAULT 2,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioEvent" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "month" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyCalculation" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "propertyValue" DECIMAL(65,30) NOT NULL,
    "loanBalance" DECIMAL(65,30) NOT NULL,
    "equity" DECIMAL(65,30) NOT NULL,
    "rentalIncome" DECIMAL(65,30) NOT NULL,
    "vacancyLoss" DECIMAL(65,30) NOT NULL,
    "effectiveIncome" DECIMAL(65,30) NOT NULL,
    "mortgagePayment" DECIMAL(65,30) NOT NULL,
    "propertyTax" DECIMAL(65,30) NOT NULL,
    "insurance" DECIMAL(65,30) NOT NULL,
    "propertyManagement" DECIMAL(65,30) NOT NULL,
    "maintenance" DECIMAL(65,30) NOT NULL,
    "capitalExpenditures" DECIMAL(65,30) NOT NULL,
    "utilities" DECIMAL(65,30) NOT NULL,
    "otherExpenses" DECIMAL(65,30) NOT NULL,
    "totalExpenses" DECIMAL(65,30) NOT NULL,
    "cashFlow" DECIMAL(65,30) NOT NULL,
    "totalInvested" DECIMAL(65,30) NOT NULL,
    "totalProfit" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarioIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComparisonSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MonthlyCalculation_scenarioId_month_idx" ON "MonthlyCalculation"("scenarioId", "month");

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioEvent" ADD CONSTRAINT "ScenarioEvent_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyCalculation" ADD CONSTRAINT "MonthlyCalculation_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonSet" ADD CONSTRAINT "ComparisonSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

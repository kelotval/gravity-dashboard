
import { calculateInterestProjections } from './src/utils/PayoffEngine.js';

const mockDebts = [
    {
        id: "kogan",
        name: "Kogan Money Black Card",
        monthlyRepayment: 1530,
        currentBalance: 1581,
        interestRate: 9.99,
        debtType: "Credit Card",
        promoTemporary: true,
        futureRatePct: 21.99,
        promoEndDate: "2026-06-01",
        futureRates: [{ date: "2026-06-01", rate: 21.99 }],
        riskFlag: "Large Rate Jump"
    }
];

const result = calculateInterestProjections(mockDebts);
console.log("Savings Opportunities:", JSON.stringify(result.savingsOpportunities, null, 2));

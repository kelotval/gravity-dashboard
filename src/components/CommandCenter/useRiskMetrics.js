import { useMemo } from 'react';

export function useRiskMetrics(transactions, income, debts, profile) {
    return useMemo(() => {
        // Safe defaults
        const monthlyIncome = Math.max(Object.values(income || {}).reduce((a, b) => a + b, 0), 1); // Avoid div/0
        const totalDebtPayment = (debts || []).reduce((sum, d) => sum + d.monthlyRepayment, 0);

        // 1. Debt Risk Score (Inverse of DTI)
        // DTI > 40% is bad (0 score), < 10% is great (100 score)
        const dti = totalDebtPayment / monthlyIncome;
        let debtScore = 100 - (dti * 200); // 50% DTI = 0 score. 0% DTI = 100.
        debtScore = Math.max(0, Math.min(100, debtScore));

        // 2. Liquidity Score (Emergency Fund / Expenses)
        // 3-6 months is target. 
        const totalExpenses = (transactions || [])
            .filter(tx => tx.amount < 0 && tx.kind !== 'transfer' && tx.kind !== 'payment')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        const assets = profile?.assets || 0; // Using assets as proxy for liquidity for now
        // If assets coverage is 6 months = 100 score. 0 months = 0 score.
        const monthsliq = totalExpenses > 0 ? assets / totalExpenses : 0;
        let liquidityScore = (monthsliq / 6) * 100;
        liquidityScore = Math.max(0, Math.min(100, liquidityScore));

        // 3. Stability (Savings Rate)
        // 20% savings = 80 score. 50% = 100 score. <0% = 0 score.
        const savings = monthlyIncome - totalExpenses;
        const savingsRate = monthlyIncome > 0 ? savings / monthlyIncome : 0;
        let stabilityScore = savingsRate < 0 ? 0 : (savingsRate / 0.3) * 100; // 30% savings = 100
        stabilityScore = Math.max(0, Math.min(100, stabilityScore));

        // 4. Growth (Net Worth Velocity normalized)
        // Arbitrary target: $2000/mo growth = 80 score.
        const monthlyInterest = (debts || []).reduce((sum, d) => sum + ((d.currentBalance * (d.interestRate || 0) / 100) / 12), 0);
        const principalPaid = totalDebtPayment - monthlyInterest; // Rough approx
        const wealthGrowth = savings + principalPaid;

        // Target $3000/mo growth for 100 score? 
        let growthScore = (wealthGrowth / 3000) * 100;
        growthScore = Math.max(0, Math.min(100, growthScore));

        // 5. Expense Control (Inverse of Expense Ratio)
        // Expenses < 50% of income = 100 score. > 90% = 0 score.
        const expRatio = totalExpenses / monthlyIncome;
        let expenseScore = 120 - (expRatio * 100); // 20% expense = 100. 100% expense = 20.
        expenseScore = Math.max(0, Math.min(100, expenseScore));

        // Aggregate Score
        const totalScore = Math.round((debtScore + liquidityScore + stabilityScore + growthScore + expenseScore) / 5);

        return {
            data: [
                { subject: 'Debt Health', A: Math.round(debtScore), fullMark: 100 },
                { subject: 'Liquidity', A: Math.round(liquidityScore), fullMark: 100 },
                { subject: 'Stability', A: Math.round(stabilityScore), fullMark: 100 },
                { subject: 'Growth', A: Math.round(growthScore), fullMark: 100 },
                { subject: 'Expenses', A: Math.round(expenseScore), fullMark: 100 },
            ],
            totalScore
        };

    }, [transactions, income, debts, profile]);
}

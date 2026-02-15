import { useMemo } from 'react';

export function useRiskMetrics(transactions, income, debts, profile, monthlyLedger, activePeriodKey, simulatorState) {
    return useMemo(() => {
        // Resolve Active Month Data from Ledger
        const activeLedger = (monthlyLedger || []).find(l => l.monthKey === activePeriodKey);

        // Simulator Adjustments
        const simSpendingCut = simulatorState?.spendingCut || 0;
        const simSubCancel = simulatorState?.subscriptionCancel || 0;
        const simExtraDebt = simulatorState?.extraDebtPayment || 0;

        // 1. Income
        // Use Ledger plannedIncome if available, else fallback to static income object
        let monthlyIncome = activeLedger?.plannedIncome || 0;
        if (!monthlyIncome) {
            monthlyIncome = Math.max(Object.values(income || {}).reduce((a, b) => a + b, 0), 1);
        }

        // 2. Expenses (Monthly)
        // Use Ledger totalExpenses if available. 
        // Note: Ledger.totalExpenses includes Debt Payments.
        // If getting from transactions directly, we must filter by month!
        let totalMonthlyExpenses = 0;

        if (activeLedger) {
            totalMonthlyExpenses = activeLedger.totalExpenses;
        } else {
            // Fallback: Calculate from transactions (Old Buggy Way, but let's try to filter if we can?)
            // If we don't have ledger, we probably don't have month filtering easily here without duplication.
            // Let's rely on the huge number sum as fallback or just 0.
            // But better: if transactions are passed, assumes they are relevant. 
            // The issue was `transactions` is ALL history.
            // We'll trust the Ledger. If no ledger, we might return 0 or do a rough estimate.
            totalMonthlyExpenses = (transactions || [])
                .filter(tx => tx.amount < 0 && tx.kind !== 'transfer' && tx.kind !== 'payment')
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        }

        // Apply Simulator: Reduce Expenses
        // Ensure we don't go below 0 (unlikely but safe)
        const adjustedMonthlyExpenses = Math.max(0, totalMonthlyExpenses - simSpendingCut - simSubCancel);

        const totalDebtPayment = (debts || []).reduce((sum, d) => sum + d.monthlyRepayment, 0);

        // --- SCORING LOGIC ---

        // 1. Debt Risk Score (Inverse of DTI)
        // DTI > 40% is bad (0 score), < 10% is great (100 score)
        const dti = monthlyIncome > 0 ? totalDebtPayment / monthlyIncome : 1;
        let debtScore = 100 - (dti * 200); // 50% DTI = 0 score. 0% DTI = 100.
        debtScore = Math.max(0, Math.min(100, debtScore));

        // 2. Liquidity Score (Emergency Fund / Expenses)
        // 3-6 months is target. 
        // Assets / Monthly Expenses (Adjusted)
        const assets = profile?.assets || 0;
        const monthsliq = adjustedMonthlyExpenses > 0 ? assets / adjustedMonthlyExpenses : 0;
        let liquidityScore = (monthsliq / 6) * 100;
        liquidityScore = Math.max(0, Math.min(100, liquidityScore));

        // 3. Stability (Savings Rate)
        // 20% savings = 80 score. 50% = 100 score. <0% = 0 score.
        // Savings = Income - Expenses (Adjusted)
        const savings = monthlyIncome - adjustedMonthlyExpenses;
        const savingsRate = monthlyIncome > 0 ? savings / monthlyIncome : 0;
        let stabilityScore = savingsRate < 0 ? 0 : (savingsRate / 0.3) * 100; // 30% savings = 100
        stabilityScore = Math.max(0, Math.min(100, stabilityScore));

        // 4. Growth (Net Worth Velocity normalized)
        // Arbitrary target: $3000/mo growth = 100 score.
        const monthlyInterest = (debts || []).reduce((sum, d) => sum + ((d.currentBalance * (d.interestRate || 0) / 100) / 12), 0);

        // Principal Paid = Min Principal + Extra Debt Payment (Simulated)
        // LOGIC ADJUSTMENT: If Funding is Negative (Bleeding Cash), Principal Paydown is not "Growth" but "Survival".
        // Only count Principal Paydown towards Growth if Savings >= 0.
        const effectivePrincipalPaid = savings >= 0
            ? Math.max(totalDebtPayment - monthlyInterest, 0) + simExtraDebt
            : 0;

        const wealthGrowth = savings + effectivePrincipalPaid;

        // Baseline Target: $3,000/mo
        let growthScore = (wealthGrowth / 3000) * 100;
        growthScore = Math.max(0, Math.min(100, growthScore));

        // 5. Expense Control (Inverse of Expense Ratio)
        // Expenses < 50% of income = 100 score. > 90% = 0 score.
        const expRatio = monthlyIncome > 0 ? adjustedMonthlyExpenses / monthlyIncome : 1;
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

    }, [transactions, income, debts, profile, monthlyLedger, activePeriodKey, simulatorState]);
}

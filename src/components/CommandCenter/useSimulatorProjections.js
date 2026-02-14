import { useMemo } from 'react';

export function useSimulatorProjections(simulatorState, transactions, debts, income, profile) {
    return useMemo(() => {
        // 1. Current Baseline
        const monthlyIncome = Math.max(Object.values(income || {}).reduce((a, b) => a + b, 0), 1);
        const totalDebtBalance = (debts || []).reduce((sum, d) => sum + d.currentBalance, 0);
        const totalMinimums = (debts || []).reduce((sum, d) => sum + d.monthlyRepayment, 0);

        // Calculate current baseline expenses (excluding debt payments to avoid double count if they are in transactions)
        // Actually, assuming transactions includes everything.
        // Let's rely on "Net Cashflow" roughly eq Income - Expenses.
        // Or roughly:
        const totalExpenses = (transactions || [])
            .filter(tx => tx.amount < 0 && tx.kind !== 'transfer' && tx.kind !== 'payment')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        const currentSurplus = monthlyIncome - totalExpenses - totalMinimums; // Rough approximation
        const currentAssets = profile?.assets || 0;
        const currentNetWorth = currentAssets - totalDebtBalance;

        // 2. Simulated Changes
        const { extraDebtPayment, spendingCut, subscriptionCancel } = simulatorState;

        // New Cashflow available
        const efficiencyGains = spendingCut + subscriptionCancel;
        const newSurplus = currentSurplus + efficiencyGains - extraDebtPayment;

        // Debt Payoff Logic
        const newMonthlyDebtPayment = totalMinimums + extraDebtPayment;

        // 3. Projections

        // A. Net Worth in 12 Months
        // Baseline growth: currentSurplus * 12 + PrincipalPaid
        // New growth: newSurplus * 12 + NewPrincipalPaid

        // Estimate interest (average rate)
        const weightedRate = totalDebtBalance > 0
            ? debts.reduce((sum, d) => sum + (d.currentBalance * (d.interestRate || 0)), 0) / totalDebtBalance
            : 0;

        const monthlyInterest = (totalDebtBalance * weightedRate / 100) / 12;
        const initialPrincipalPaid = Math.max(0, totalMinimums - monthlyInterest);

        const newPrincipalPaid = Math.max(0, newMonthlyDebtPayment - monthlyInterest); // Initially

        // Simple linear projection for 12 months (ignoring compounding/amortization curve for speed)
        // Net Worth Change = (Income - Expenses) + (DebtPrincipalReduction)
        //                  = (Surplus + Minimums - Interest) + (Minimums - Interest) ... wait
        // NW Change = Change in Assets + Change in Liabilities
        // Change in Assets = Surplus
        // Change in Liabilities = -PrincipalPaid
        // Net Change = Surplus - (-PrincipalPaid) = Surplus + PrincipalPaid

        const projectedNetWorthChange = (newSurplus * 12) + (newPrincipalPaid * 12);
        const projectedNetWorth = currentNetWorth + projectedNetWorthChange;
        const baselineNetWorth = currentNetWorth + ((currentSurplus + initialPrincipalPaid) * 12);

        const netWorthVisualDelta = projectedNetWorth - baselineNetWorth;

        // B. Debt Free Date
        // Nper = -log(1 - (rate * PV / PMT)) / log(1 + rate)
        // Approximate Nper for aggregate
        let monthsToDebtFree = 0;
        if (totalDebtBalance > 0) {
            if (newMonthlyDebtPayment <= monthlyInterest) {
                monthsToDebtFree = 999; // Never
            } else {
                const r = (weightedRate / 100) / 12;
                if (r === 0) {
                    monthsToDebtFree = totalDebtBalance / newMonthlyDebtPayment;
                } else {
                    monthsToDebtFree = -Math.log(1 - (r * totalDebtBalance / newMonthlyDebtPayment)) / Math.log(1 + r);
                }
            }
        }

        // Baseline Date
        let baselineMonths = 0;
        if (totalDebtBalance > 0) {
            if (totalMinimums <= monthlyInterest) {
                baselineMonths = 999;
            } else {
                const r = (weightedRate / 100) / 12;
                if (r === 0) baselineMonths = totalDebtBalance / totalMinimums;
                else baselineMonths = -Math.log(1 - (r * totalDebtBalance / totalMinimums)) / Math.log(1 + r);
            }
        }

        const monthsSaved = Math.max(0, baselineMonths - monthsToDebtFree);
        const interestSaved = (baselineMonths - monthsToDebtFree) * monthlyInterest; // Very rough approx

        // Formatting Date
        const today = new Date();
        today.setMonth(today.getMonth() + monthsToDebtFree);
        const dateStr = monthsToDebtFree > 120 ? "Never" : today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        return {
            projectedNetWorth,
            netWorthVisualDelta,
            dateStr,
            monthsSaved,
            interestSaved
        };

    }, [simulatorState, transactions, debts, income, profile]);
}

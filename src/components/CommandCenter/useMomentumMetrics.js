import { useMemo } from 'react';

export function useMomentumMetrics(transactions, monthlyLedger, debts) {
    return useMemo(() => {
        // --- 1. Savings Streak ---
        // monthlyLedger is object { 'YYYY-MM': { plannedIncome, ... } }
        // We need actuals. 'transactions' are all transactions.

        // Group transactions by month
        const monthlyNet = {};
        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            // revenue - expenses
            if (tx.amount > 0 && tx.kind !== 'transfer') {
                monthlyNet[key] = (monthlyNet[key] || 0) + tx.amount;
            } else if (tx.amount < 0 && tx.kind !== 'transfer' && tx.kind !== 'payment') {
                monthlyNet[key] = (monthlyNet[key] || 0) + tx.amount; // amount is negative
            }
        });

        // Sort keys desc
        const sortedMonths = Object.keys(monthlyNet).sort().reverse();
        let streak = 0;
        for (const m of sortedMonths) {
            if (monthlyNet[m] > 0) streak++;
            else break;
        }

        // --- 2. Debt Velocity ---
        // Amount paid to debt this month vs last month
        const today = new Date();
        const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

        const getDebtPaid = (monthKey) => {
            return transactions
                .filter(tx => {
                    const d = new Date(tx.date);
                    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    return k === monthKey && (tx.category === 'Debt' || tx.kind === 'payment');
                })
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        };

        const debtPaidThisMonth = getDebtPaid(currentMonthKey);
        const debtPaidLastMonth = getDebtPaid(lastMonthKey);
        // Velocity score? Just show raw amount for now.

        // --- 3. Net Cashflow (Current Month) ---
        const currentNet = monthlyNet[currentMonthKey] || 0;

        return {
            savingsStreak: streak,
            debtVelocity: debtPaidThisMonth,
            debtVelocityPrev: debtPaidLastMonth,
            netCashflow: currentNet
        };

    }, [transactions, monthlyLedger, debts]);
}

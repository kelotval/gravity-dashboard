import { AlertTriangle, Scissors, TrendingUp, TrendingDown, ShieldAlert, Zap } from 'lucide-react';
import { useMemo } from 'react';

export function useFinancialMoves(transactions, debts, recurringExpenses, income) {
    return useMemo(() => {
        const moves = [];

        // --- 1. DEBT ANALYSIS (Critical Priority) ---
        const highInterestDebt = debts.find(d => d.accent === 'red');
        if (highInterestDebt) {
            const monthlyInterest = Math.round((highInterestDebt.currentBalance * (highInterestDebt.interestRate || 18) / 100) / 12);
            moves.push({
                id: 'debt_kill',
                type: 'critical',
                title: `Kill ${highInterestDebt.name}`,
                subtitle: `${highInterestDebt.currentBalance.toLocaleString()} balance at ${highInterestDebt.interestRate}% APR.`,
                impact: `Save $${(monthlyInterest * 12).toLocaleString()}/yr in interest`,
                time: 'Immediate',
                effort: 'Low',
                actionValues: { type: 'repayment', amount: Math.round(highInterestDebt.monthlyRepayment * 0.5) },
                icon: AlertTriangle,
                color: 'rose',
                score: 100 // Highest priority
            });
        }

        // --- 2. SUBSCRIPTION AUDIT (High Priority if high spend) ---
        const subExpenses = recurringExpenses.filter(e => e.category === 'Subscriptions' && e.active !== false);
        const totalSubCost = subExpenses.reduce((sum, e) => sum + e.amount, 0);

        if (totalSubCost > 100) {
            moves.push({
                id: 'sub_audit',
                type: 'high',
                title: 'Audit Subscriptions',
                subtitle: `You're spending $${totalSubCost}/mo on ${subExpenses.length} services.`,
                impact: `Recover $${Math.round(totalSubCost * 0.3 * 12).toLocaleString()}/yr`,
                time: 'This Week',
                effort: 'Medium',
                actionValues: { type: 'cancel', amount: Math.round(totalSubCost * 0.3) },
                icon: Scissors,
                color: 'orange',
                score: 80
            });
        }

        // --- 3. SAVINGS GAP (Medium Priority) ---
        // Calculate savings rate
        const monthlyIncome = Object.values(income).reduce((a, b) => a + b, 0);
        const totalExpenses = transactions
            .filter(tx => tx.amount < 0 && tx.kind !== 'transfer' && tx.kind !== 'payment') // Exclude transfers and cc payments
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) : 0;

        if (savingsRate < 0.2 && monthlyIncome > 0) {
            const shortfall = (monthlyIncome * 0.2) - (monthlyIncome - totalExpenses);
            const safeShortfall = Math.max(shortfall, 100); // At least suggest $100

            moves.push({
                id: 'save_boost',
                type: 'medium',
                title: 'Boost Savings Rate',
                subtitle: `Current savings rate is ${(savingsRate * 100).toFixed(0)}%. Target is 20%.`,
                impact: `Build $${Math.round(safeShortfall * 12).toLocaleString()} wealth/yr`,
                time: 'Monthly',
                effort: 'Low',
                actionValues: { type: 'transfer', amount: Math.round(safeShortfall) },
                icon: TrendingUp,
                color: 'emerald',
                score: 60
            });
        }

        // --- 4. SPENDING SPIKE (Medium Priority) ---
        // Find largest discretionary category
        const categories = {};
        transactions.forEach(tx => {
            if (tx.amount < 0 && !['Housing', 'Transfers', 'Bills Payments', 'Debt', 'Utilities'].includes(tx.category)) {
                categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
            }
        });

        const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
        if (topCat && topCat[1] > 500) { // If spending > $500 on a discretionary category
            moves.push({
                id: 'spend_cut',
                type: 'medium',
                title: `Optimize ${topCat[0]}`,
                subtitle: `High spending detection: $${topCat[1].toLocaleString()} this month.`,
                impact: `Save $${Math.round(topCat[1] * 0.2 * 12).toLocaleString()}/yr`,
                time: 'Weekly',
                effort: 'High',
                actionValues: { type: 'cut', amount: Math.round(topCat[1] * 0.2) },
                icon: TrendingDown,
                color: 'blue',
                score: 50
            });
        }

        // Sort by Score desc and take top 3
        return moves.sort((a, b) => b.score - a.score).slice(0, 3);

    }, [transactions, debts, recurringExpenses, income]);
}

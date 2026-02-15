/**
 * Projects financial metrics over time using deterministic compounding.
 */
export const projectWealth = ({
    initialNetWorth,
    monthlySurplus,
    years = 5,
    growthRate = 0.05, // Investment return
    inflationRate = 0.03, // Expense inflation (applied to surplus deflation)
    debts = []
}) => {
    let currentNetWorth = initialNetWorth;
    // We treat surplus as "investable cash" after expenses.
    // However, if we have debts, we might pay them down first or invest.
    // Simplified model: 
    // 1. Pay minimums on debts (already in surplus calc usually, but let's assume surplus is AFTER minimums).
    // 2. Invest remainder.

    // If we want to mode debt payoff acceleration, we need to know the split.
    // For this engine, we assume "Surplus" is added to Assets.

    const months = years * 12;
    const monthlyGrowth = growthRate / 12;

    const projection = [];

    let assets = initialNetWorth + debts.reduce((sum, d) => sum + d.currentBalance, 0); // Derive assets from NW + Debt
    let totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);

    // Debt amortization (simplified linear or interest based)
    // We need individual debt objects to track balance
    // Clone debts to simulate
    let currentDebts = debts.map(d => ({ ...d }));

    for (let m = 1; m <= months; m++) {
        // 1. Grow Assets
        // Surplus is added to assets
        // Assets grow by investment rate
        assets = assets * (1 + monthlyGrowth) + monthlySurplus;

        // 2. Pay down debts (standard scheduled)
        // If surplus is used for EXTRA payments, that should be handled outside or via "monthlySurplus" being lower and "debtPayment" being higher?
        // Actually, usually "Net Worth" projection just needs (Assets - Liabilities).
        // Let's assume standard minimum payments are happening, reducing debt.

        let monthDebtPaydown = 0;
        currentDebts = currentDebts.map(d => {
            if (d.currentBalance <= 0) return d;

            const interest = d.currentBalance * ((d.interestRate || 0) / 12 / 100);
            const payment = d.monthlyRepayment || 0;
            const principal = payment - interest;

            let newBalance = d.currentBalance - principal;
            if (newBalance < 0) newBalance = 0;

            return { ...d, currentBalance: newBalance };
        });

        totalDebt = currentDebts.reduce((sum, d) => sum + d.currentBalance, 0);
        currentNetWorth = assets - totalDebt;

        if (m % 12 === 0) {
            projection.push({
                year: m / 12,
                netWorth: Math.round(currentNetWorth),
                debt: Math.round(totalDebt),
                assets: Math.round(assets)
            });
        }
    }

    return projection;
};

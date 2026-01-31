
export const calculateDetailedHealthScore = ({ savingsRate, dtiRatio, debts, netSavings, totalIncome }) => {
    let breakdown = [];
    let currentScore = 0;

    // 1. Savings Rate (Weight: 30)
    // Target: > 20% is perfect. < 0% is 0.
    const savingsWeight = 30;
    let savingsScore = 0;
    if (savingsRate >= 20) savingsScore = 30;
    else if (savingsRate <= 0) savingsScore = 0;
    else savingsScore = (savingsRate / 20) * 30;

    breakdown.push({
        label: "Savings Rate",
        value: `${savingsRate}%`,
        score: Math.round(savingsScore),
        weight: savingsWeight,
        impact: savingsScore >= 15 ? "positive" : "negative",
        tooltip: "Aim for at least 20% of your income saved each month.",
        color: savingsScore >= 20 ? "text-emerald-500" : savingsScore >= 10 ? "text-amber-500" : "text-red-500"
    });
    currentScore += savingsScore;

    // 2. DTI Ratio (Weight: 30)
    // Target: < 30% is perfect. > 50% is 0.
    const dtiWeight = 30;
    let dtiScore = 0;
    if (dtiRatio <= 30) dtiScore = 30;
    else if (dtiRatio >= 50) dtiScore = 0;
    else dtiScore = ((50 - dtiRatio) / 20) * 30;

    breakdown.push({
        label: "DTI Ratio",
        value: `${dtiRatio}%`,
        score: Math.round(dtiScore),
        weight: dtiWeight,
        impact: dtiScore >= 20 ? "positive" : "negative",
        tooltip: "Keep your debt repayments below 30% of your income.",
        color: dtiScore >= 20 ? "text-emerald-500" : dtiScore >= 10 ? "text-amber-500" : "text-red-500"
    });
    currentScore += dtiScore;

    // 3. High-Interest Debt Penalty (Weight: 20)
    // Logic: Full 20 pts if no debt > 8% interest. Lose 5 pts per bad debt.
    const badDebts = debts.filter(d => d.interestRate > 8);
    const debtWeight = 20;
    let debtScore = Math.max(0, 20 - (badDebts.length * 10)); // Heavy penalty for bad debt

    breakdown.push({
        label: "Debt Quality",
        value: badDebts.length === 0 ? "Healthy" : `${badDebts.length} High-rate Loans`,
        score: debtScore,
        weight: debtWeight,
        impact: debtScore === 20 ? "positive" : "negative",
        tooltip: "Debts with interest rates above 8% significantly hurt your score.",
        color: debtScore === 20 ? "text-emerald-500" : "text-red-500"
    });
    currentScore += debtScore;

    // 4. Cash Flow (Weight: 10)
    const cashFlowWeight = 10;
    const isPositiveCashFlow = netSavings > 0;
    const cashFlowScore = isPositiveCashFlow ? 10 : 0;

    breakdown.push({
        label: "Cash Flow",
        value: isPositiveCashFlow ? "Positive" : "Negative",
        score: cashFlowScore,
        weight: cashFlowWeight,
        impact: isPositiveCashFlow ? "positive" : "negative",
        tooltip: "Spending less than you earn is the foundation of wealth.",
        color: isPositiveCashFlow ? "text-emerald-500" : "text-red-500"
    });
    currentScore += cashFlowScore;

    // 5. Rate Risk (Weight: 10)
    // Logic: If DTI is high AND has variable loans, risk is high.
    const rateRiskWeight = 10;
    const hasVariableDebt = debts.some(d => !d.isFixed);
    let rateRiskScore = 10;

    if (hasVariableDebt && dtiRatio > 40) rateRiskScore = 0; // Dangerous combo
    else if (hasVariableDebt) rateRiskScore = 5; // Moderate risk

    breakdown.push({
        label: "Rate Risk",
        value: hasVariableDebt ? (dtiRatio > 40 ? "High Exposure" : "Moderate Exposure") : "Protected",
        score: rateRiskScore,
        weight: rateRiskWeight,
        impact: rateRiskScore === 10 ? "positive" : "neutral",
        tooltip: "Exposure to interest rate rises involves variable rate loans.",
        color: rateRiskScore === 10 ? "text-emerald-500" : rateRiskScore === 5 ? "text-amber-500" : "text-red-500"
    });
    currentScore += rateRiskScore;

    return {
        totalScore: Math.round(currentScore),
        breakdown
    };
};

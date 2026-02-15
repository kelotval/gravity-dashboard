/**
 * Estimates Family Tax Benefit Part A and Part B.
 * Note: simplistic estimation, ignores supplements, exact indexation, etc.
 * 
 * @param {object} params
 * @param {number} params.adjustedTaxableIncome - Household income
 * @param {number} params.primaryIncome - Higher earner
 * @param {number} params.secondaryIncome - Lower earner
 * @param {Array<number>} params.childAges - Array of ages of children
 * @param {boolean} params.isCouple - Default true
 */
export const calculateBenefits = ({
    adjustedTaxableIncome,
    primaryIncome,
    secondaryIncome,
    childAges = [],
    isCouple = true
}) => {
    if (childAges.length === 0) return { ftbA: 0, ftbB: 0, total: 0 };

    // --- FTB Part A (2024-25 baseline) ---
    // Max Rate:
    // Child 0-12: ~$6,500/yr
    // Child 13-19: ~$8,400/yr
    const MAX_RATE_UNDER_13 = 6570;
    const MAX_RATE_13_PLUS = 8541;
    const BASE_RATE = 2774; // Base rate for high income

    // Income Test Thresholds
    const INCOME_LIMIT_LOWER = 62634; // No reduction below this
    const INCOME_LIMIT_UPPER = 113032; // Base rate reduction starts here (approx)

    // Calculate Max Rate
    let maxRateTotal = 0;
    let baseRateTotal = 0;

    childAges.forEach(age => {
        if (age < 13) maxRateTotal += MAX_RATE_UNDER_13;
        else if (age <= 19) maxRateTotal += MAX_RATE_13_PLUS; // Student check ignored
        baseRateTotal += BASE_RATE;
    });

    // Income Test 1 (Reduces Max Rate to Base Rate)
    // Reduction: 20c per dollar over 62,634
    let ftbA = maxRateTotal;

    if (adjustedTaxableIncome > INCOME_LIMIT_LOWER) {
        const excess = adjustedTaxableIncome - INCOME_LIMIT_LOWER;
        const reduction = excess * 0.20;
        ftbA = Math.max(baseRateTotal, maxRateTotal - reduction);
    }

    // Income Test 2 (Reduces Base Rate to Zero)
    // Applies if income > Upper Limit
    // Reduction: 30c per dollar over limit
    if (adjustedTaxableIncome > INCOME_LIMIT_UPPER) {
        const excess = adjustedTaxableIncome - INCOME_LIMIT_UPPER;
        const reduction = excess * 0.30;
        ftbA = Math.max(0, ftbA - reduction);
    }

    // --- FTB Part B ---
    // Single Income / Secondary Earner Test
    // Primary Earner Limit: $100,000 (Adjusted taxable income)
    // Max Rate: Under 5 = $4,800, Over 5 = $3,400

    let ftbB = 0;
    const primaryLimit = 112578; // 2024-25 approx

    if (primaryIncome <= primaryLimit) {
        const youngestAge = Math.min(...childAges);
        const maxRateB = youngestAge < 5 ? 4821 : 3508;

        // Secondary Earner Test
        // Income Free Area: $6,443
        // Reduction: 20c per dollar
        const secondaryFreeArea = 6935;

        if (secondaryIncome <= secondaryFreeArea) {
            ftbB = maxRateB;
        } else {
            const excess = secondaryIncome - secondaryFreeArea;
            const reduction = excess * 0.20;
            ftbB = Math.max(0, maxRateB - reduction);
        }
    }

    return {
        ftbA: Math.round(ftbA),
        ftbB: Math.round(ftbB),
        total: Math.round(ftbA + ftbB),
        monthly: Math.round((ftbA + ftbB) / 12)
    };
};

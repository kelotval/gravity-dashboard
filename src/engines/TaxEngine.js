import taxRates from '../data/taxRates_2025_26.json';

/**
 * Calculates net pay and tax components.
 * @param {number} grossAnnual - Gross annual salary + bonus
 * @param {object} options - Options: { hasHecs, hasPrivateHospital, isFamily, combinedFamilyIncome }
 */
export const calculateTax = (grossAnnual, options = {}) => {
    const {
        hasHecs = false,
        hasPrivateHospital = false,
        isFamily = false,
        combinedFamilyIncome = grossAnnual,
        salarySacrifice = 0
    } = options;

    let tax = 0;

    // 0. Taxable Income (Gross - Salary Sacrifice)
    // Note: Salary Sacrifice is taxed at 15% in super fund, but reduces assessable income for PAYG.
    const income = Math.max(0, grossAnnual - salarySacrifice);

    // 1. Income Tax (Resident)
    for (const bracket of taxRates.residentTaxBrackets) {
        if (income > bracket.min) {
            if (income <= bracket.max) {
                tax = bracket.base + (income - bracket.min) * bracket.rate;
                break;
            }
        }
    }

    // 2. Medicare Levy (2%)
    // Low income phase-in: 
    // - No levy if income <= threshold
    // - Shading area: 10% of excess over threshold
    // - Full 2% if income > phaseInLimit
    let medicare = 0;
    if (income > taxRates.medicare.lowIncomeThreshold) {
        if (income <= taxRates.medicare.phaseInLimit) {
            medicare = (income - taxRates.medicare.lowIncomeThreshold) * 0.10;
        } else {
            medicare = income * taxRates.medicare.rate;
        }
    }

    // 3. Medicare Levy Surcharge (MLS)
    // Based on Income for Surcharge Purposes (usually Gross + fringe + etc)
    // Salary sacrifice IS included in surcharge income.
    let mlsRate = 0;
    if (!hasPrivateHospital) {
        const thresholdType = isFamily ? 'family' : 'single';
        // Add back salary sacrifice for MLS calculation
        const incomeForTest = (isFamily ? combinedFamilyIncome : grossAnnual);

        if (incomeForTest > taxRates.medicareSurcharge.tier3[thresholdType]) {
            mlsRate = taxRates.medicareSurcharge.tier3.rate;
        } else if (incomeForTest > taxRates.medicareSurcharge.tier2[thresholdType]) {
            mlsRate = taxRates.medicareSurcharge.tier2.rate;
        } else if (incomeForTest > taxRates.medicareSurcharge.tier1[thresholdType]) {
            mlsRate = taxRates.medicareSurcharge.tier1.rate;
        }
    }
    const mls = (grossAnnual) * mlsRate; // Applied to taxable income + reportable fringe benefits (simplified here) using grossAnnual logic for MLS base typically varies, but often applied to "Income for MLS purposes". For simplicity, let's apply to base income match. Actually MLS is on Taxable Income + FBT. 
    // Refinement: MLS is calculated on Taxable Income + Reportable Fringe Benefits + etc.
    // So base for MLS payment = income (taxable). Rate determined by gross (adjusted).
    const mlsPayment = income * mlsRate;

    // 4. HECS / HELP
    // Repayment income includes taxable income + salary sacrifice + etc.
    let hecs = 0;
    const repaymentIncome = income + salarySacrifice;
    if (hasHecs) {
        const hecsBracket = taxRates.hecs.find(b => repaymentIncome >= b.min && repaymentIncome <= b.max);
        if (hecsBracket) {
            hecs = repaymentIncome * hecsBracket.rate;
        }
    }

    // 5. Low Income Tax Offset (LITO) - 2024-25
    // Max offset $700. 
    // Reduces by 5 cents for every $1 between $37,500 and $45,000.
    // Reduces by 1.5 cents for every $1 over $45,000.
    let lito = 0;
    if (income < 66667) { // Cutoff where LITO reaches 0
        const maxLito = 700;
        if (income <= 37500) {
            lito = maxLito;
        } else if (income <= 45000) {
            lito = maxLito - ((income - 37500) * 0.05);
        } else {
            lito = maxLito - ((45000 - 37500) * 0.05) - ((income - 45000) * 0.015);
        }
        lito = Math.max(0, lito);
    }

    // Total Tax
    const totalTax = Math.max(0, tax - lito) + medicare + mlsPayment + hecs;
    const netPay = income - totalTax;

    return {
        gross: grossAnnual,
        taxableIncome: income,
        tax: tax - lito, // Net income tax after offset
        lito,
        medicare,
        mls: mlsPayment,
        hecs,
        totalTax,
        netPay,
        monthlyNet: netPay / 12,
        fortnightlyNet: netPay / 26,
        weeklyNet: netPay / 52
    };
};

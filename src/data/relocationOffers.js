// Relocation Offers Data Schema and Computation Engine

// Currency conversion helper
export function toAud(amountLocal, currency, assumptions) {
    if (currency === 'AUD') return amountLocal;
    if (currency === 'AED') return amountLocal * (assumptions?.fxRateAedToAud ?? 0.41);
    if (currency === 'SAR') return amountLocal * (assumptions?.fxRateSarToAud ?? 0.40);
    if (currency === 'USD') return amountLocal * (assumptions?.fxRateUsdToAud ?? 1.50);
    return 0;
}

// Default relocation assumptions/settings
export const DEFAULT_RELOCATION_SETTINGS = {
    fxRateAedToAud: 0.41,
    fxRateSarToAud: 0.40,
    fxRateUsdToAud: 1.50,
    costOfLivingMultiplier: {
        sydney: 1.0,
        dubai: 0.85,
        aramco: 0.70
    },
    includeDebtsInScenario: true,
    includeTransfersInSpending: false,
    includeRentInBaseline: true,
    baselineRentAud: 4000,
    baselineNetMonthlyAud: 0, // Derived from income
    partnerIncomeEnabled: false,
    partnerNetMonthlyAud: 0,
    partnerStopsWorking: false,
    discretionaryAdjustmentAud: 0,
    emergencyFundTargetAud: 20000,
    monthsToFund: 6,
    investmentReturnPctAnnual: 7.0,
    volatilityRisk: {
        sydney: 1,
        dubai: 5,
        aramco: 7
    }
};

// Default offers
export const DEFAULT_OFFERS = [
    {
        id: 'sydney',
        name: 'Sydney (Baseline)',
        country: 'Australia',
        currency: 'AUD',
        netMonthlyPayLocal: 15000,
        netMonthlyPayAud: 15000,
        housingMonthlyLocal: 4000,
        housingIncluded: false,
        transportMonthlyLocal: 500,
        utilitiesMonthlyLocal: 300,
        schoolingMonthlyLocal: 0,
        healthcareMonthlyLocal: 200,
        relocationFlightsPerYearLocal: 0,
        annualBonusLocal: 0,
        signOnBonusLocal: 0,
        oneOffRelocationLocal: 0,
        taxNotes: 'PAYG tax already deducted',
        benefits: [
            'Medicare coverage',
            'Superannuation 11.5%',
            'Annual leave 4 weeks',
            'Long service leave',
            'Work-life balance'
        ],
        risks: [
            'High cost of living',
            'Expensive housing market',
            'Limited international exposure'
        ],
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'dubai',
        name: 'Dubai',
        country: 'UAE',
        currency: 'AED',
        netMonthlyPayLocal: 45000,
        netMonthlyPayAud: 0, // Computed via FX
        housingMonthlyLocal: 8000,
        housingIncluded: false,
        transportMonthlyLocal: 2000,
        utilitiesMonthlyLocal: 1000,
        schoolingMonthlyLocal: 5000,
        healthcareMonthlyLocal: 1500,
        relocationFlightsPerYearLocal: 15000,
        annualBonusLocal: 90000,
        signOnBonusLocal: 50000,
        oneOffRelocationLocal: 30000,
        taxNotes: 'Tax-free income',
        benefits: [
            'Tax-free salary',
            'Annual flights for family',
            'Health insurance covered',
            'Schooling allowance',
            'End of service gratuity'
        ],
        risks: [
            'Political instability in region',
            'Extreme weather (summer)',
            'Distance from family',
            'Cultural adjustment',
            'Limited long-term residency'
        ],
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'aramco',
        name: 'Saudi Aramco',
        country: 'Saudi Arabia',
        currency: 'SAR',
        netMonthlyPayLocal: 55000,
        netMonthlyPayAud: 0, // Computed via FX
        housingMonthlyLocal: 0,
        housingIncluded: true,
        transportMonthlyLocal: 0,
        utilitiesMonthlyLocal: 0,
        schoolingMonthlyLocal: 0,
        healthcareMonthlyLocal: 0,
        relocationFlightsPerYearLocal: 25000,
        annualBonusLocal: 110000,
        signOnBonusLocal: 100000,
        oneOffRelocationLocal: 50000,
        taxNotes: 'Tax-free income, zakat may apply',
        benefits: [
            'Tax-free salary',
            'Housing fully provided',
            'All utilities included',
            'Schooling covered 100%',
            'Premium healthcare',
            'Annual flights covered',
            'Compound living',
            'High savings potential'
        ],
        risks: [
            'Strict cultural restrictions',
            'Very far from family',
            'Limited social freedoms',
            'Partner employment restricted',
            'Security concerns',
            'Heat and isolation',
            'Exit restrictions during contract'
        ],
        lastUpdated: new Date().toISOString()
    }
];

// Calculate quality score (0-100)
export function calculateQualityScore(outcome, offer, assumptions) {
    let score = 50; // Start at middle

    // Factor 1: Net after debts (40 points max)
    const netAfterDebts = outcome.netAfterDebtsAudMonthly;
    if (netAfterDebts > 15000) score += 40;
    else if (netAfterDebts > 10000) score += 30;
    else if (netAfterDebts > 5000) score += 20;
    else if (netAfterDebts > 0) score += 10;
    else score -= 20;

    // Factor 2: Emergency runway (20 points max)
    const runway = outcome.runwayMonths;
    if (runway < 3) score -= 10;
    else if (runway < 6) score += 5;
    else if (runway < 12) score += 15;
    else score += 20;

    // Factor 3: Benefits completeness (20 points max)
    const benefitCount = offer.benefits?.length ?? 0;
    score += Math.min(20, benefitCount * 2.5);

    // Factor 4: Volatility risk penalty (deduct up to 20 points)
    const volatility = assumptions.volatilityRisk?.[offer.id] ?? 5;
    score -= volatility * 2;

    // Factor 5: One-off costs friction (deduct up to 10 points)
    const oneOffAud = toAud(offer.oneOffRelocationLocal, offer.currency, assumptions);
    if (oneOffAud > 50000) score -= 10;
    else if (oneOffAud > 30000) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

// Determine verdict
export function determineVerdict(outcome, qualityScore, offer) {
    const reasons = [];
    let label = 'Marginal';

    const netDelta = outcome.netAfterDebtsAudMonthly - outcome.baselineNetAfterDebts;
    const annualDelta = netDelta * 12;

    // Analyze cashflow
    if (netDelta > 5000) {
        reasons.push(`+$${netDelta.toLocaleString()}/mo vs baseline`);
        label = 'Strong Upgrade';
    } else if (netDelta > 2000) {
        reasons.push(`+$${netDelta.toLocaleString()}/mo improvement`);
        label = 'Marginal';
    } else if (netDelta < -1000) {
        reasons.push(`-$${Math.abs(netDelta).toLocaleString()}/mo worse than baseline`);
        label = 'Not Worth It';
    }

    // Analyze quality score
    if (qualityScore >= 80) {
        reasons.push('Excellent quality score');
        if (label !== 'Not Worth It') label = 'Strong Upgrade';
    } else if (qualityScore < 50) {
        reasons.push('Low quality score');
        label = 'High Risk';
    }

    // Analyze risks
    const riskCount = offer.risks?.length ?? 0;
    if (riskCount >= 5) {
        reasons.push(`${riskCount} significant risks identified`);
        if (label === 'Strong Upgrade') label = 'High Risk';
    }

    // Analyze runway
    if (outcome.runwayMonths < 3) {
        reasons.push('Insufficient emergency fund runway');
        label = 'High Risk';
    } else if (outcome.runwayMonths >= 12) {
        reasons.push(`Strong ${Math.round(outcome.runwayMonths)}-month emergency buffer`);
    }

    // Savings rate
    if (outcome.savingsRatePct > 50) {
        reasons.push(`${Math.round(outcome.savingsRatePct)}% savings rate`);
    }

    return {
        label,
        reasons: reasons.slice(0, 5) // Max 5 reasons
    };
}

// Main computation engine
export function computeRelocationOutcome({ offer, baseline, assumptions, debts, transactions }) {
    // Convert all amounts to AUD
    const netMonthlyAud = offer.netMonthlyPayAud || toAud(offer.netMonthlyPayLocal, offer.currency, assumptions);

    // Calculate benefits (amortize annual to monthly)
    const annualBonusAud = toAud(offer.annualBonusLocal, offer.currency, assumptions);
    const flightsAud = toAud(offer.relocationFlightsPerYearLocal, offer.currency, assumptions);
    const totalBenefitsAudMonthly = (annualBonusAud + flightsAud) / 12;

    // Calculate costs
    let housingAud = 0;
    if (!offer.housingIncluded) {
        housingAud = toAud(offer.housingMonthlyLocal, offer.currency, assumptions);
    }

    const transportAud = toAud(offer.transportMonthlyLocal, offer.currency, assumptions);
    const utilitiesAud = toAud(offer.utilitiesMonthlyLocal, offer.currency, assumptions);
    const schoolingAud = toAud(offer.schoolingMonthlyLocal, offer.currency, assumptions);
    const healthcareAud = toAud(offer.healthcareMonthlyLocal, offer.currency, assumptions);
    const discretionaryAud = assumptions.discretionaryAdjustmentAud ?? 0;

    const totalCostsAudMonthly = housingAud + transportAud + utilitiesAud + schoolingAud + healthcareAud + discretionaryAud;

    // Baseline costs
    const baselineRent = assumptions.includeRentInBaseline ? (assumptions.baselineRentAud ?? 4000) : 0;
    const baselineCostsAudMonthly = baselineRent + 800; // Rough estimate for other baseline costs

    // Partner income
    let partnerIncome = 0;
    if (assumptions.partnerIncomeEnabled && !assumptions.partnerStopsWorking) {
        partnerIncome = assumptions.partnerNetMonthlyAud ?? 0;
    }

    // Net disposable
    const netDisposableAudMonthly = netMonthlyAud + totalBenefitsAudMonthly + partnerIncome - totalCostsAudMonthly;

    // Debt load
    const debtLoadAudMonthly = assumptions.includeDebtsInScenario
        ? (debts?.reduce((sum, d) => sum + (d.monthlyRepayment ?? 0), 0) ?? 0)
        : 0;

    // Net after debts
    const netAfterDebtsAudMonthly = netDisposableAudMonthly - debtLoadAudMonthly;

    // Baseline net after debts (for comparison)
    const baselineIncome = assumptions.baselineNetMonthlyAud || 15000;
    const baselinePartnerIncome = assumptions.partnerIncomeEnabled && !assumptions.partnerStopsWorking
        ? (assumptions.partnerNetMonthlyAud ?? 0)
        : 0;
    const baselineNetAfterDebts = baselineIncome + baselinePartnerIncome - baselineCostsAudMonthly - debtLoadAudMonthly;

    // Savings rate
    const totalIncome = netMonthlyAud + totalBenefitsAudMonthly + partnerIncome;
    const savingsRatePct = totalIncome > 0 ? (netAfterDebtsAudMonthly / totalIncome) * 100 : 0;

    // Emergency runway
    const emergencyTarget = assumptions.emergencyFundTargetAud ?? 20000;
    const runwayMonths = netAfterDebtsAudMonthly > 0
        ? emergencyTarget / netAfterDebtsAudMonthly
        : 999;

    const outcome = {
        netMonthlyAud,
        totalBenefitsAudMonthly,
        totalCostsAudMonthly,
        baselineCostsAudMonthly,
        netDisposableAudMonthly,
        debtLoadAudMonthly,
        netAfterDebtsAudMonthly,
        baselineNetAfterDebts,
        savingsRatePct,
        runwayMonths,
        qualityScore: 0, // Computed next
        verdict: null // Computed next
    };

    // Calculate quality score and verdict
    outcome.qualityScore = calculateQualityScore(outcome, offer, assumptions);
    outcome.verdict = determineVerdict(outcome, outcome.qualityScore, offer);

    return outcome;
}

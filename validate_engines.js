import { calculateTax } from './src/engines/TaxEngine.js';
import { calculateBenefits } from './src/engines/BenefitsEngine.js';

console.log("--- Validating Tax Engine (2025-26) ---");

// Case 1: $160,000 Single
const case1 = calculateTax(160000, { hasHecs: false, hasPrivateHospital: true });
console.log(`Income: $160,000 | Net Expected: ~$113k | Actual Net: $${Math.round(case1.netPay)}`);
// 160k tax:
// Bracket 135k-190k: 31288 + (25000 * 0.37) = 31288 + 9250 = 40538
// Med: 3200
// Total Tax: 43738
// Net: 116262
// My taxRates might differ slightly from exact 2025 projections but should be close.

// Case 2: $90,000 with HECS
const case2 = calculateTax(90000, { hasHecs: true, hasPrivateHospital: true });
console.log(`Income: $90,000 + HECS | Net Actual: $${Math.round(case2.netPay)}`);


console.log("\n--- Validating Benefits Engine ---");
// Case 3: Family 160k + 85k, 2 kids (3, 5)
// Total: 245k. FTB A reduced to 0 likely.
const case3 = calculateBenefits({
    adjustedTaxableIncome: 245000,
    primaryIncome: 160000,
    secondaryIncome: 85000,
    childAges: [3, 5],
    isCouple: true
});
console.log(`Family Income $245k, Kids 3&5 | FTB Total: $${case3.total}`);

// Case 4: Low Income Family 60k + 0, 2 kids
const case4 = calculateBenefits({
    adjustedTaxableIncome: 60000,
    primaryIncome: 60000,
    secondaryIncome: 0,
    childAges: [3, 5],
    isCouple: true
});
console.log(`Family Income $60k, Kids 3&5 | FTB Total: $${case4.total}`);

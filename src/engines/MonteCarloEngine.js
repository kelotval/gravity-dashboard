import { projectWealth } from './ProjectionEngine';

/**
 * Runs a Monte Carlo simulation.
 * @param {object} params
 * @param {number} params.iterations - Number of simulations (e.g. 500)
 * @param {object} params.inputs - Base inputs { initialNetWorth, monthlySurplus, years, debts }
 * @param {object} params.variability - Ranges { growthRateMean, growthRateStdDev, inflationMean, inflationStdDev }
 */
export const runSimulation = ({
    iterations = 500,
    inputs,
    variability = {
        growthRateMean: 0.07,
        growthRateStdDev: 0.15, // High volatility for equities
        surplusStdDev: 500 // Monthly variance in spending
    }
}) => {
    const allRuns = [];

    for (let i = 0; i < safeIterations; i++) {
        // Hard Stop Guard
        if (i >= 10000) break;

        // Randomize inputs based on normal distribution (Box-Muller transform)
        const randNormal = () => {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        const growthRate = variability.growthRateMean + (randNormal() * variability.growthRateStdDev);
        const monthlySurplusDetails = (inputs.monthlySurplus || 0) + (randNormal() * variability.surplusStdDev);

        // Run projection
        const projection = projectWealth({
            ...inputs,
            growthRate,
            monthlySurplus: monthlySurplusDetails
        });

        // Safety check: ensure projection is valid
        if (projection && projection.length > 0) {
            allRuns.push(projection);
        }
    }

    // Aggregate results by year
    if (allRuns.length === 0) {
        console.warn("Monte Carlo: No valid runs generated.");
        return null; // Return null to indicate failure (caught by UI) or empty struct
    }

    // projection is array of { year, netWorth, debt ... }
    const years = allRuns[0].length;
    const yearlyStats = [];

    for (let y = 0; y < years; y++) {
        // Extract Net Worths for this specific year across all runs
        const netWorths = allRuns.map(run => run[y].netWorth).sort((a, b) => a - b);

        yearlyStats.push({
            year: allRuns[0][y].year,
            p10: netWorths[Math.floor(safeIterations * 0.1)],
            p50: netWorths[Math.floor(safeIterations * 0.5)],
            p90: netWorths[Math.floor(safeIterations * 0.9)],
        });
    }

    // Probability Metrics
    // Check specific years for milestones
    const debtFreeBy3Y = allRuns.filter(run => run[2] && run[2].debt <= 0).length / safeIterations;
    const debtFreeBy5Y = allRuns.filter(run => run[years - 1].debt <= 0).length / safeIterations;
    const endNetWorths = allRuns.map(run => run[years - 1].netWorth).sort((a, b) => a - b);
    const medianEndNW = endNetWorths[Math.floor(safeIterations * 0.5)];
    const worstCaseNW = endNetWorths[Math.floor(safeIterations * 0.1)];


    return {
        runs: safeIterations,
        yearlyStats, // Array of { year, p10, p50, p90 }
        percentiles: {
            p10: worstCaseNW,
            p50: medianEndNW,
            p90: endNetWorths[Math.floor(safeIterations * 0.9)]
        },
        probabilityMetrics: {
            cashPositive5Years: allRuns.filter(run => run[years - 1].netWorth > 0).length / safeIterations,
            debtFreeBy3Years: debtFreeBy3Y,
            debtFreeByEnd: debtFreeBy5Y
        }
    };
};

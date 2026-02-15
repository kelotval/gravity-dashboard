const { projectWealth } = require('../engines/ProjectionEngine'); // Adjusted for CJS if possible, or use import if module
// Node.js defaults to CJS. The project is likely ESM (Vite).
// I cannot easily Require an ESM file in a CJS script without setup.
// I will rewrite the test script to key off specific inputs I suspect are failing.

// Actually, let's just inspect the failure in the browser console. The user has the devtools open?
// No, I can't see the user's console.
// I have to guess.

// Suspect 1: inputs.monthlySurplus is undefined or string.
// inside runSimulation: 
// const monthlySurplusDetails = inputs.monthlySurplus + ...
// if inputs.monthlySurplus is undefined, it becomes NaN.
// projectWealth receives NaN.
// inside projectWealth: assets = ... + monthlySurplus. Assets become NaN.
// projection array has NaNs.
// sort((a,b) => a - b) on NaNs might behave weirdly but probably won't crash entire script unless it's strictly type checked? 
// But map(run => run[y].netWorth) works.

// Suspect 2: years is missing.
// projectWealth defaults to 5.

// Suspect 3: allRuns[0] is undefined.
// This happens if loop doesn't run. safeIterations = 0?
// Math.min(iterations, 10000). If iterations passed as 0? default is 500.

// Let's look at `SimulationResults.jsx` call again.
/*
                const results = runSimulation({
                    iterations: 500,
                    inputs: {
                        ...inputs,
                        monthlySurplus: inputs.monthlySurplus || 0
                    },
*/
// It passes inputs.
// inputs comes from props.

// Let's add a try-catch inside `MonteCarloEngine.js` to log what's happening if I could.
// Or just harden the code.

// One critical thing: `projectWealth` in `ProjectionEngine.js` exports as named export.
// `MonteCarloEngine.js` imports it.
// `MonteCarloEngine.js` uses `allRuns[0].length`.
// If `allRuns` is empty, it crashes.
// But `safeIterations` is 500.

// What if `projectWealth` returns a non-array?
// In `ProjectionEngine.js`: `const projection = []; ... return projection;`
// It seems fine.

// Wait. `ProjectionEngine.js` line 64: `projection.push({...})`.
// If `years` is 0, months is 0. Loop `m=1 to 0` doesn't run.
// projection is empty [].
// `allRuns[0]` is [].
// `allRuns[0].length` is 0.
// Loop `y=0 to 0` doesn't run.
// `yearlyStats` is [].
// Returns empty stats.
// `p10`, `p50` reads from `yearlyStats`?
// No, `MonteCarloEngine.js` return structure:
/*
    return {
        runs: safeIterations,
        yearlyStats, 
        percentiles: {
            p10: worstCaseNW, // defined as endNetWorths[...]
            ...
*/
// `endNetWorths` = allRuns.map(run => run[years-1].netWorth).
// if `years` is 0, `years-1` is -1. `run[-1]` is undefined.
// `run[-1].netWorth` throws TypeError.
// CRASH!

// Does `inputs` have `years`?
// In `SimulationResults.jsx`:
// `inputs` are passed from parent.
// In `LifeSimulator.jsx`:
/*
    const inputs = {
        initialNetWorth: data?.profile?.netWorth || 0,
        monthlySurplus: intelligence.monthlySurplus,
        years: 5,
        debts: simulatedDebts // derived from debt strategy
    };
*/
// `years` is explicitly 5.

// Wait. `LifeSimulator.jsx` was viewed in step 2.
// Let's verify `inputs` passed to `SimulationResults`.
// I'll check `LifeSimulator.jsx` again.

growthRate = 0.05,
    debts = []
}) => {
    // Simplified Mock of projectWealth
    const projection = [];
    for (let y = 1; y <= years; y++) {
        projection.push({
            year: y,
            netWorth: initialNetWorth + (monthlySurplus * 12 * y) * (1 + growthRate),
            debt: Math.max(0, 1000 - (100 * y))
        });
    }
    return projection;
};

// Paste Monte Carlo Engine Code Here
const runSimulation = ({
    iterations = 500,
    inputs,
    variability = {
        growthRateMean: 0.07,
        growthRateStdDev: 0.15,
        surplusStdDev: 500
    }
}) => {
    const allRuns = [];
    // Only running 5 for test
    const safeIterations = Math.min(iterations, 5);

    for (let i = 0; i < safeIterations; i++) {
        // Randomize
        const randNormal = () => {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        const growthRate = variability.growthRateMean + (randNormal() * variability.growthRateStdDev);
        const monthlySurplusDetails = inputs.monthlySurplus + (randNormal() * variability.surplusStdDev);

        // Run projection
        const projection = projectWealth({
            ...inputs,
            growthRate,
            monthlySurplus: monthlySurplusDetails
        });

        allRuns.push(projection);
    }

    // THE BUG MIGHT BE HERE
    const years = allRuns[0].length;
    const yearlyStats = [];

    for (let y = 0; y < years; y++) {
        const netWorths = allRuns.map(run => run[y].netWorth).sort((a, b) => a - b);

        yearlyStats.push({
            year: allRuns[0][y].year,
            p10: netWorths[Math.floor(safeIterations * 0.1)],
            p50: netWorths[Math.floor(safeIterations * 0.5)],
            p90: netWorths[Math.floor(safeIterations * 0.9)],
        });
    }

    return yearlyStats;
};

try {
    console.log("Running Simulation...");
    const result = runSimulation({
        iterations: 10,
        inputs: {
            initialNetWorth: 100000,
            monthlySurplus: 2000,
            years: 5,
            debts: []
        }
    });
    console.log("Success!", result);
} catch (e) {
    console.error("CRASHED:", e);
}

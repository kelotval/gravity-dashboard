import { projectWealth } from '../engines/ProjectionEngine';

self.onmessage = (e) => {
    const { iterations, inputs, variability } = e.data;

    try {
        const allRuns = [];
        const CHUNK_SIZE = 100;

        // Report start
        self.postMessage({ type: 'status', status: 'running', progress: 0 });

        let currentIter = 0;

        function runChunk() {
            const end = Math.min(currentIter + CHUNK_SIZE, iterations);

            for (let i = currentIter; i < end; i++) {
                // Randomize inputs (Box-Muller)
                const randNormal = () => {
                    let u = 0, v = 0;
                    while (u === 0) u = Math.random();
                    while (v === 0) v = Math.random();
                    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                };

                const growthRate = variability.growthRateMean + (randNormal() * variability.growthRateStdDev);
                const monthlySurplus = (inputs.monthlySurplus || 0) + (randNormal() * variability.surplusStdDev);

                const projection = projectWealth({
                    ...inputs,
                    growthRate,
                    monthlySurplus
                });

                if (projection && projection.length > 0) {
                    allRuns.push(projection);
                }
            }

            currentIter = end;

            // Report progress
            self.postMessage({
                type: 'progress',
                current: currentIter,
                total: iterations
            });

            if (currentIter < iterations) {
                // Schedule next chunk
                setTimeout(runChunk, 0);
            } else {
                // Finished
                finalizeResults(allRuns, iterations);
            }
        }

        runChunk();

    } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
    }
};

function finalizeResults(allRuns, iterations) {
    if (allRuns.length === 0) {
        self.postMessage({ type: 'error', error: "No valid runs generated" });
        return;
    }

    const years = allRuns[0].length;
    const yearlyStats = [];

    for (let y = 0; y < years; y++) {
        const netWorths = allRuns.map(run => run[y].netWorth).sort((a, b) => a - b);

        const p10 = netWorths[Math.floor(allRuns.length * 0.1)];
        const p25 = netWorths[Math.floor(allRuns.length * 0.25)];
        const p50 = netWorths[Math.floor(allRuns.length * 0.5)];
        const p75 = netWorths[Math.floor(allRuns.length * 0.75)];
        const p90 = netWorths[Math.floor(allRuns.length * 0.9)];

        // Calculate deltas for Recharts stacking
        // Base: p10 (transparent)
        // Band 1: p25 - p10 (Outer color)
        // Band 2: p75 - p25 (Inner color, containing Median)
        // Band 3: p90 - p75 (Outer color)

        yearlyStats.push({
            year: allRuns[0][y].year,
            p10,
            p25,
            p50,
            p75,
            p90,
            // Stacked values
            stack_base: p10,
            stack_outer_bottom: p25 - p10,
            stack_inner: p75 - p25,
            stack_outer_top: p90 - p75
        });
    }

    // Probability Metrics
    const debtFreeBy3Y = allRuns.filter(run => run[2] && run[2].debt <= 0).length / allRuns.length;
    const debtFreeBy5Y = allRuns.filter(run => run[years - 1].debt <= 0).length / allRuns.length;
    const endNetWorths = allRuns.map(run => run[years - 1].netWorth).sort((a, b) => a - b);

    const result = {
        runs: allRuns.length,
        yearlyStats,
        percentiles: {
            p10: endNetWorths[Math.floor(allRuns.length * 0.1)],
            p50: endNetWorths[Math.floor(allRuns.length * 0.5)],
            p90: endNetWorths[Math.floor(allRuns.length * 0.9)]
        },
        probabilityMetrics: {
            cashPositive5Years: allRuns.filter(run => run[years - 1].netWorth > 0).length / allRuns.length,
            debtFreeBy3Years: debtFreeBy3Y,
            debtFreeByEnd: debtFreeBy5Y
        }
    };

    self.postMessage({ type: 'result', result });
}

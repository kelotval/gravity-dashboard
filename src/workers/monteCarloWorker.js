import { runSimulation } from '../engines/MonteCarloEngine';

self.onmessage = (e) => {
    const { inputs, variability, iterations } = e.data;

    try {
        console.time("MonteCarlo Computation");
        const start = performance.now();

        const results = runSimulation({
            iterations: iterations || 500,
            inputs,
            variability
        });

        const duration = performance.now() - start;
        console.timeEnd("MonteCarlo Computation");
        console.log(`[Worker] Simulation finished in ${duration.toFixed(2)}ms`);

        self.postMessage({ status: 'success', results, duration });
    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
};

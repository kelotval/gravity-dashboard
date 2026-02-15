import React, { useEffect, useState, useRef, useMemo } from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Loader2, Zap, Info, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import HelpTooltip from '../Tooltip';

export default function SimulationResults({ projection, inputs }) {
    const [monteCarloResult, setMonteCarloResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [advancedMode, setAdvancedMode] = useState(false);
    const [error, setError] = useState(null);

    const workerRef = useRef(null);

    // Initial Projection Data formatted for standard view
    const standardData = useMemo(() => {
        return projection.map(p => ({
            year: p.year,
            netWorth: p.netWorth,
            // For fan chart consistency, we can map base projection to these keys if needed, 
            // but simpler to just swap data source.
        }));
    }, [projection]);

    const runMonteCarlo = () => {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Terminate existing worker if any
        if (workerRef.current) {
            workerRef.current.terminate();
        }

        // Initialize Worker
        workerRef.current = new Worker(new URL('../../workers/MonteCarlo.worker.js', import.meta.url), { type: 'module' });

        // Setup Listeners
        workerRef.current.onmessage = (e) => {
            const { type, result, progress, error: workerError } = e.data;

            if (type === 'progress') {
                setProgress(Math.round((progress.current / progress.total) * 100));
            } else if (type === 'result') {
                setMonteCarloResult(result);
                setLoading(false);
                setProgress(100);
            } else if (type === 'error') {
                console.error("Worker Error:", workerError);
                setError(workerError);
                setLoading(false);
            }
        };

        workerRef.current.onerror = (e) => {
            console.error("Worker Execution Error:", e);
            setError("Simulation failed unexpectedly.");
            setLoading(false);
        };

        // Start Simulation
        workerRef.current.postMessage({
            iterations: 500, // Safe default
            inputs: {
                ...inputs,
                monthlySurplus: inputs.monthlySurplus || 0
            },
            variability: {
                growthRateMean: 0.07,
                growthRateStdDev: 0.12, // 12% std dev for equities
                surplusStdDev: 500      // $500 monthly swing
            }
        });
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) workerRef.current.terminate();
        };
    }, []);

    // Trigger on toggling advanced mode or inputs change
    useEffect(() => {
        if (advancedMode) {
            runMonteCarlo();
        } else {
            // If turning off, maybe clear results? Or keep them cached.
            // Let's keep cached, but maybe cancel running.
            if (workerRef.current && loading) {
                workerRef.current.terminate();
                setLoading(false);
            }
        }
    }, [advancedMode, inputs]); // Re-run when inputs change

    return (
        <SurfaceCard title="Wealth Projection" className="h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-content-secondary">5-Year Net Worth Trajectory</p>
                    {advancedMode && <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] uppercase font-bold rounded">Monte Carlo Active</span>}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-content-secondary">Probability Mode</span>
                        <HelpTooltip content={
                            <div className="space-y-2">
                                <p><strong className="text-brand">P50 (Median):</strong> The most likely outcome.</p>
                                <p><strong className="text-blue-400">P25-P75:</strong> The "Likely Range" (50% of outcomes).</p>
                                <p><strong className="text-blue-900/50">P10-P90:</strong> The "Wide Range" (80% of outcomes).</p>
                                <p className="text-xs text-gray-400 mt-2">Simulates 500 market scenarios with variable returns & spending.</p>
                            </div>
                        }>
                            <Info className="w-3 h-3 text-content-tertiary hover:text-white cursor-help" />
                        </HelpTooltip>
                    </div>
                    <input
                        type="checkbox"
                        checked={advancedMode}
                        onChange={(e) => setAdvancedMode(e.target.checked)}
                        className="toggle toggle-sm toggle-accent"
                    />
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">

                {/* Loading / Error State Overlay */}
                {(loading || error) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm rounded-lg">
                        {error ? (
                            <div className="text-red-400 flex flex-col items-center">
                                <AlertTriangle className="w-8 h-8 mb-2" />
                                <p className="text-sm font-medium">{error}</p>
                                <button
                                    onClick={runMonteCarlo}
                                    className="mt-4 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <>
                                <Loader2 className="w-8 h-8 text-brand animate-spin mb-2" />
                                <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Running {Math.round(500 * (progress / 100))} / 500 Scenarios...</p>
                            </>
                        )}
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={monteCarloResult && advancedMode ? monteCarloResult.yearlyStats : standardData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorBandOuter" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorBandInner" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="year" stroke="#666" fontSize={12} tickFormatter={v => `Year ${v}`} />
                        <YAxis stroke="#666" fontSize={12} tickFormatter={v => `$${v / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ color: '#E5E7EB', fontSize: '12px' }}
                            labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                            formatter={(value, name) => {
                                // Map technical keys to readable labels
                                const map = {
                                    p50: ['Median (Likely)', '#10B981'],
                                    p90: ['Best Case', '#60A5FA'],
                                    p10: ['Worst Case', '#F87171'],
                                    netWorth: ['Projected NW', '#10B981'],
                                    // Stack components - usually hidden but good to check
                                    stack_base: ['P10 Base', 'none'],
                                    stack_outer_bottom: ['P10-P25 Range', 'none'],
                                    stack_inner: ['P25-P75 Range', 'none'],
                                    stack_outer_top: ['P75-P90 Range', 'none']
                                };

                                const [label, color] = map[name] || [name, '#fff'];
                                // Filter out stack helper keys from tooltip if possible, or format nicely
                                if (name.startsWith('stack_')) return [null, null]; // Hide stack keys

                                return [`$${Math.round(value).toLocaleString()}`, label];
                            }}
                            // Only show specific lines in tooltip
                            filterNull={true}
                        />

                        {/* MODE 1: MONTE CARLO (Stacked Bands) */}
                        {monteCarloResult && advancedMode && (
                            <>
                                {/* 
                                    Stacking Strategy for Fan Chart:
                                    1. Invisible Base (0 to P10)
                                    2. Outer Bottom Band (P10 to P25)
                                    3. Inner Band (P25 to P75) -> Contains Median
                                    4. Outer Top Band (P75 to P90)
                                */}
                                <Area type="monotone" dataKey="stack_base" stackId="1" stroke="none" fill="transparent" isAnimationActive={false} />
                                <Area type="monotone" dataKey="stack_outer_bottom" stackId="1" stroke="none" fill="url(#colorBandOuter)" name="Likely Range" />
                                <Area type="monotone" dataKey="stack_inner" stackId="1" stroke="none" fill="url(#colorBandInner)" name="Core Range" />
                                <Area type="monotone" dataKey="stack_outer_top" stackId="1" stroke="none" fill="url(#colorBandOuter)" name="Best Case Range" />

                                {/* Lines on top for clarity */}
                                <Area type="monotone" dataKey="p50" stroke="#10B981" strokeWidth={2} fill="none" name="p50" />
                                <Area type="monotone" dataKey="p10" stroke="#F87171" strokeWidth={1} strokeDasharray="4 4" fill="none" name="p10" />
                                <Area type="monotone" dataKey="p90" stroke="#60A5FA" strokeWidth={1} strokeDasharray="4 4" fill="none" name="p90" />
                            </>
                        )}

                        {/* MODE 2: DETERMINISTIC (Simple Line) */}
                        {(!monteCarloResult || !advancedMode) && (
                            <Area
                                type="monotone"
                                dataKey="netWorth"
                                stroke="#10B981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNw)"
                                name="netWorth"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Metrics Footer */}
            {advancedMode && monteCarloResult && (
                <div className="mt-4 pt-4 border-t border-surface-highlight animate-in fade-in slide-in-from-bottom-2">
                    {/* Insight Summary */}
                    <div className="mb-4 bg-surface-highlight/10 p-3 rounded border border-surface-highlight/20 flex items-start gap-3">
                        {monteCarloResult.probabilityMetrics.cashPositive5Years > 0.9 ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className="text-sm text-white font-medium">
                                {monteCarloResult.probabilityMetrics.cashPositive5Years > 0.9
                                    ? "High Probability of Success (90%+)"
                                    : "Moderate Volatility Risk Detected"}
                            </p>
                            <p className="text-xs text-content-tertiary mt-1">
                                Based on 500 simulations, your median outcome is strong, with a
                                <strong> {(monteCarloResult.probabilityMetrics.debtFreeByEnd * 100).toFixed(0)}%</strong> chance of being debt-free by Year 5.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center group p-2 rounded hover:bg-white/5 transition-colors">
                            <div className="text-[10px] text-content-tertiary uppercase mb-1">Worst Case (P10)</div>
                            <div className="text-lg font-bold text-red-400">
                                ${(monteCarloResult.percentiles.p10).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-center group p-2 rounded hover:bg-white/5 transition-colors">
                            <div className="text-[10px] text-content-tertiary uppercase mb-1">Median (P50)</div>
                            <div className="text-lg font-bold text-emerald-400">
                                ${(monteCarloResult.percentiles.p50).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-center group p-2 rounded hover:bg-white/5 transition-colors">
                            <div className="text-[10px] text-content-tertiary uppercase mb-1">Best Case (P90)</div>
                            <div className="text-lg font-bold text-blue-400">
                                ${(monteCarloResult.percentiles.p90).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SurfaceCard>
    );
}


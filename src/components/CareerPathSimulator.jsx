import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import {
    Globe, TrendingUp, DollarSign, Target, Zap, Brain,
    ArrowRight, CheckCircle2, ChevronRight, Settings, AlertTriangle
} from 'lucide-react';
import { AIInsights } from "./RelocationTabs";
import { SurfaceCard } from "./common/SurfaceCard";

// Re-use logic from previous components if needed, or build fresh for the specific "Simulator" view
// This component aims to be a "Single Pane of Glass" replacing the tabs

export default function CareerPathSimulator({
    relocation,
    updateRelocation,
    selectedOffers,
    outcomes,
    assumptions,
    updateAssumption,
    addNewOffer
}) {
    // Local state for the simulator specific inputs
    // In a real app, these might sync back to the main state, but for a "Simulator" 
    // it's often good to have some ephemeral state for "What-if" analysis
    const [activeOfferId, setActiveOfferId] = useState(selectedOffers.find(o => o.id !== 'sydney')?.id || selectedOffers[0]?.id);
    const [showBaselineSettings, setShowBaselineSettings] = useState(true);

    // Local overrides for "What-if" analysis without persisting to global state immediately
    const [simulationOverrides, setSimulationOverrides] = useState({});

    const handleSimulationChange = (field, value) => {
        setSimulationOverrides(prev => ({
            ...prev,
            [activeOfferId]: {
                ...prev[activeOfferId],
                [field]: value
            }
        }));
    };

    const baselineOffer = selectedOffers.find(o => o.id === 'sydney');
    const originalTargetOffer = selectedOffers.find(o => o.id === activeOfferId);

    // Merge overrides
    const targetOffer = { ...originalTargetOffer, ...(simulationOverrides[activeOfferId] || {}) };

    const baselineOutcome = outcomes['sydney'] || {};
    const targetOutcome = outcomes[activeOfferId] || {};

    // Recalculate outcomes locally for the simulator
    // We start with the original outcome and scale it based on the override salary ratio
    // This is a UI-only trick to avoid duplicating the entire tax engine here
    const originalNet = outcomes[activeOfferId]?.netAfterDebtsAudMonthly || 0;
    const currentSalary = targetOffer.salaryLocal || 0;
    const originalSalary = originalTargetOffer?.salaryLocal || 1;
    const salaryRatio = currentSalary / originalSalary;

    // If we have overrides, scale the net result. If no overrides, use original.
    const simulatedNetMonthly = simulationOverrides[activeOfferId]
        ? originalNet * salaryRatio
        : originalNet;

    const baselineWealthVelocity = (baselineOutcome.netAfterDebtsAudMonthly || 0) * 12;
    const targetWealthVelocity = simulatedNetMonthly * 12;
    const velocityDelta = targetWealthVelocity - baselineWealthVelocity;
    const velocityGrowth = baselineWealthVelocity > 0 ? (velocityDelta / baselineWealthVelocity) * 100 : 0;

    // Simulation Data for Charts
    const generateWealthData = () => {
        const data = [];
        let sydneyAccumulated = 0;
        let targetAccumulated = 0;

        // Simple 5 year projection
        for (let i = 1; i <= 5; i++) {
            sydneyAccumulated += baselineWealthVelocity * Math.pow(1.05, i - 1); // 5% compound growth for simplicity
            targetAccumulated += targetWealthVelocity * Math.pow(1.05, i - 1);

            data.push({
                year: `Year ${i}`,
                Sydney: Math.round(sydneyAccumulated),
                Target: Math.round(targetAccumulated),
            });
        }
        return data;
    };

    const wealthData = useMemo(() => generateWealthData(), [baselineWealthVelocity, targetWealthVelocity]);

    const cashflowData = [
        {
            name: 'Current (Syd)',
            Expenses: Math.round(baselineOutcome.totalMonthlyCostAud || 0),
            Savings: Math.round(baselineOutcome.netAfterDebtsAudMonthly || 0),
        },
        {
            name: 'Target',
            Expenses: Math.round(targetOutcome.totalMonthlyCostAud || 0),
            Savings: Math.round(targetOutcome.netAfterDebtsAudMonthly || 0),
        }
    ];

    if (!targetOffer || !baselineOffer) return <div>Loading Simulator...</div>;

    const chartTheme = {
        grid: { stroke: '#374151', strokeDasharray: '3 3' },
        text: { fill: '#9CA3AF', fontSize: 12 },
        tooltip: {
            contentStyle: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '0.75rem',
                backdropFilter: 'blur(10px)'
            }
        }
    };

    if (!targetOffer || !baselineOffer) return <div>Loading Simulator...</div>;

    return (
        <div className="grid grid-cols-12 gap-6 h-full">
            {/* LEFT SIDEBAR - CONTROLS */}
            <div className="col-span-12 lg:col-span-3 space-y-6">

                {/* 1. Location Selector */}
                <SurfaceCard className="p-5">
                    <div className="flex items-center gap-2 mb-4 text-blue-400">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-wider uppercase">Path Selection</span>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">From</div>
                            <div className="flex items-center gap-2 text-white font-medium">
                                <span>🇦🇺</span> Sydney (Baseline)
                            </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-blue-600 rounded-full p-1 shadow-lg shadow-blue-500/30">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                            <div className="text-xs text-blue-300 mb-1">To Target</div>
                            <select
                                value={activeOfferId}
                                onChange={(e) => setActiveOfferId(e.target.value)}
                                className="w-full bg-transparent text-white font-bold border-none focus:ring-0 p-0 cursor-pointer"
                            >
                                {selectedOffers.filter(o => o.id !== 'sydney').map(offer => (
                                    <option key={offer.id} value={offer.id} className="text-gray-900 bg-white dark:bg-gray-900">
                                        {offer.country === 'United Arab Emirates' ? '🇦🇪' : '🇸🇦'} {offer.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </SurfaceCard>

                {/* 2. Baseline Inputs */}
                <SurfaceCard className="p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Settings className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wider uppercase">Current Baseline</span>
                        </div>
                        <button
                            onClick={() => setShowBaselineSettings(!showBaselineSettings)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            {showBaselineSettings ? 'Hide' : 'Edit'}
                        </button>
                    </div>

                    {showBaselineSettings && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Annual Base (AUD)</label>
                                <input
                                    type="number"
                                    value={baselineOffer.salaryLocal}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    readOnly
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Monthly Rent</label>
                                    <input
                                        type="number"
                                        value={baselineOffer.housingAllowanceLocal || 4000}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Living Costs</label>
                                    <input
                                        type="number"
                                        value={3500}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Net Monthly Cash</span>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${Math.round(baselineOutcome.netAfterDebtsAudMonthly).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </SurfaceCard>

                {/* 3. Target Opportunity Inputs */}
                <SurfaceCard className="p-5 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wider uppercase">Target Opportunity</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Path Selector / New Scenario */}
                            <select
                                value={activeOfferId}
                                onChange={(e) => {
                                    if (e.target.value === 'NEW') {
                                        addNewOffer();
                                    } else {
                                        setActiveOfferId(e.target.value);
                                    }
                                }}
                                className="bg-gray-100 dark:bg-white/10 text-white text-xs px-2 py-1 rounded border border-gray-200 dark:border-white/10 outline-none focus:border-emerald-500"
                            >
                                {selectedOffers.filter(o => o.id !== 'sydney').map(o => (
                                    <option key={o.id} value={o.id} className="text-gray-900 bg-white dark:bg-gray-900">{o.name}</option>
                                ))}
                                <option value="NEW" className="text-gray-900 bg-white dark:bg-gray-900">+ New Scenario</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Offer Stage Toggle */}
                        <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-lg grid grid-cols-3 gap-1">
                            {['Low', 'Mid', 'High'].map((stage) => {
                                const multipliers = { 'Low': 0.9, 'Mid': 1.0, 'High': 1.15 };
                                const isSelected = Math.abs((targetOffer.salaryLocal / (originalTargetOffer?.salaryLocal || 1)) - multipliers[stage]) < 0.05;

                                return (
                                    <button
                                        key={stage}
                                        onClick={() => handleSimulationChange('salaryLocal', (originalTargetOffer?.salaryLocal || 0) * multipliers[stage])}
                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${isSelected
                                            ? 'bg-emerald-600 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        {stage}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Slider for Cash Offer */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Monthly Cash Offer (AUD Eq)</span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${Math.round(simulatedNetMonthly).toLocaleString()} / mo</span>
                            </div>
                            <input
                                type="range"
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                min={Math.round((outcomes[activeOfferId]?.netAfterDebtsAudMonthly || 0) * 0.4)}
                                max={Math.round((outcomes[activeOfferId]?.netAfterDebtsAudMonthly || 0) * 2.0)}
                                value={Math.round(simulatedNetMonthly)}
                                onChange={(e) => {
                                    const newNet = parseFloat(e.target.value);
                                    const currentNet = outcomes[activeOfferId]?.netAfterDebtsAudMonthly || 1;
                                    const ratio = newNet / currentNet;
                                    handleSimulationChange('salaryLocal', (originalTargetOffer.salaryLocal || 0) * ratio);
                                }}
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                <span>Low End</span>
                                <span>High End</span>
                            </div>
                        </div>

                        {/* Package Add-ons Toggles */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Package Add-ons</div>
                            {[
                                { label: 'Housing Allowance', field: 'housingIncluded', icon: '🏠' },
                                { label: 'Education Support', field: 'educationIncluded', icon: '🎓' },
                                { label: 'Annual Flights', field: 'flightsIncluded', icon: '✈️' }
                            ].map((addon, idx) => {
                                const isActive = targetOffer[addon.field] === true;
                                return (
                                    <div key={idx} className="flex justify-between items-center group cursor-pointer" onClick={() => handleSimulationChange(addon.field, !isActive)}>
                                        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                            <span className="opacity-50">{addon.icon}</span>
                                            {addon.label}
                                        </span>
                                        <div
                                            className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isActive ? 'left-6' : 'left-1'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SurfaceCard>

            </div>

            {/* MAIN DASHBOARD - VISUALIZATIONS */}
            <div className="col-span-12 lg:col-span-9 space-y-6">

                {/* AI STRATEGY ADVISOR */}
                <div className="mb-6">
                    <AIInsights
                        selectedOffers={[baselineOffer, targetOffer]}
                        outcomes={{
                            ...outcomes,
                            [targetOffer.id]: {
                                ...outcomes[targetOffer.id],
                                netAfterDebtsAudMonthly: simulatedNetMonthly,
                                qualityScore: outcomes[targetOffer.id]?.qualityScore || 85 // Mock score
                            }
                        }}
                        assumptions={assumptions}
                        baselineId={'sydney'}
                    />
                </div>

                {/* 1. WEALTH VELOCITY HEADER */}
                <SurfaceCard className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Projected Annual Wealth Velocity</div>
                            <div className="flex items-baseline gap-4">
                                <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
                                    ${Math.round(targetWealthVelocity).toLocaleString()}
                                </h1>
                                <div className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +{velocityGrowth.toFixed(1)}% vs Syd
                                </div>
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md">
                                This represents your pure savings potential after all living costs, rent, and tax. This is your "freedom fund" accumulation speed.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Benchmark Status (USD)</div>
                            {[
                                { label: 'Floor ($180k Net Eq)', percent: 100, color: 'bg-emerald-500' },
                                { label: 'Target ($200k Net Eq)', percent: 95, color: 'bg-emerald-500' },
                                { label: 'Ideal ($250k Net Eq)', percent: 76, color: 'bg-blue-500' }
                            ].map((bm, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                                        <span>{bm.label}</span>
                                        <span>{bm.percent}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${bm.color} transition-all duration-1000 ease-out`}
                                            style={{ width: `${bm.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SurfaceCard>

                {/* 2. CHARTS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monthly Cashflow Breakdown */}
                    <SurfaceCard className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            <h3 className="text-white font-bold">Monthly Cashflow Breakdown (AUD)</h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cashflowData} layout="vertical" barSize={30}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.stroke} horizontal={false} />
                                    <XAxis type="number" stroke={chartTheme.text.fill} fontSize={12} tickFormatter={val => `$${val / 1000}k`} />
                                    <YAxis type="category" dataKey="name" stroke={chartTheme.text.fill} fontSize={12} width={100} />
                                    <Tooltip
                                        contentStyle={chartTheme.tooltip.contentStyle}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(val) => `$${val.toLocaleString()}`}
                                    />
                                    <Legend />
                                    <Bar dataKey="Expenses" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Savings" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SurfaceCard>

                    {/* 5-Year Wealth Accumulation */}
                    <SurfaceCard className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-white font-bold">5-Year Wealth Accumulation</h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={wealthData}>
                                    <defs>
                                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSyd" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.stroke} vertical={false} />
                                    <XAxis dataKey="year" stroke={chartTheme.text.fill} fontSize={12} />
                                    <YAxis stroke={chartTheme.text.fill} fontSize={12} tickFormatter={val => `$${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={chartTheme.tooltip.contentStyle}
                                        formatter={(val) => `$${val.toLocaleString()}`}
                                    />
                                    <Area type="monotone" dataKey="Target" stroke="#10B981" fillOpacity={1} fill="url(#colorTarget)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="Sydney" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSyd)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SurfaceCard>
                </div>

                {/* 3. DETAILED BREAKDOWN TABLE */}
                <SurfaceCard className="overflow-hidden p-0">
                    <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                        <h3 className="text-white font-bold">Detailed Financial Breakdown</h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400">*All figures in AUD Equivalent</div>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Component</th>
                                    <th className="px-6 py-4">Current (Sydney)</th>
                                    <th className="px-6 py-4 text-emerald-600 dark:text-emerald-400">Target ({targetOffer.name})</th>
                                    <th className="px-6 py-4">Variance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="px-6 py-4 font-medium">Gross Annual Income</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">${Math.round(baselineOffer.salaryLocal + (baselineOffer.bonusLocal || 0)).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold">${Math.round(targetOffer.salaryLocal + (targetOffer.bonusLocal || 0) + (targetOffer.housingAllowanceLocal || 0) * 12).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">
                                        +${Math.round((targetOffer.salaryLocal + (targetOffer.bonusLocal || 0) + (targetOffer.housingAllowanceLocal || 0) * 12) - (baselineOffer.salaryLocal + (baselineOffer.bonusLocal || 0))).toLocaleString()}
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="px-6 py-4 font-medium">Estimated Tax</td>
                                    <td className="px-6 py-4 text-red-500 dark:text-red-400">-${Math.round((baselineOutcome.netMonthlyPayAud - (baselineOffer.salaryLocal / 12)) * 12 * -1).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">0 (Tax Free)</td>
                                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">
                                        +${Math.round((baselineOutcome.netMonthlyPayAud - (baselineOffer.salaryLocal / 12)) * 12 * -1).toLocaleString()}
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition bg-emerald-50/50 dark:bg-emerald-900/10">
                                    <td className="px-6 py-4 font-bold text-white">Net Monthly Cash</td>
                                    <td className="px-6 py-4 text-white font-bold">${Math.round(baselineOutcome.netAfterDebtsAudMonthly + (baselineOutcome.totalMonthlyCostAud)).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold text-lg">${Math.round(targetOutcome.netAfterDebtsAudMonthly + (targetOutcome.totalMonthlyCostAud)).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold">
                                        +${Math.round((targetOutcome.netAfterDebtsAudMonthly + targetOutcome.totalMonthlyCostAud) - (baselineOutcome.netAfterDebtsAudMonthly + baselineOutcome.totalMonthlyCostAud)).toLocaleString()}
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="px-6 py-4 font-medium">Est. Living Costs</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">${Math.round(baselineOutcome.totalMonthlyCostAud).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">${Math.round(targetOutcome.totalMonthlyCostAud).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">-${Math.round(baselineOutcome.totalMonthlyCostAud - targetOutcome.totalMonthlyCostAud).toLocaleString()}</td>
                                </tr>
                                <tr className="bg-white/5">
                                    <td className="px-6 py-4 font-bold text-lg text-emerald-600 dark:text-emerald-400">Annual Savings Potential</td>
                                    <td className="px-6 py-4 font-bold text-blue-400 text-lg">${Math.round(baselineWealthVelocity).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 text-2xl shadow-glow">${Math.round(targetWealthVelocity).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-white text-lg">
                                        +${Math.round(velocityDelta).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </SurfaceCard>

            </div>
        </div>
    );
}

function BarChart3(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    )
}

import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Globe, TrendingUp, DollarSign, Target, Zap, Brain,
    ArrowRight, CheckCircle2, ChevronRight, Settings, AlertTriangle,
    Plus, Trash2, Copy, Plane, Home, GraduationCap, Building2, Coins, Briefcase, TrendingDown,
    Rocket, Lock, ShieldCheck, Hourglass, Landmark
} from 'lucide-react';
import { AIInsights } from "./RelocationTabs";
import { SurfaceCard } from "./common/SurfaceCard";
import { toAud } from "../data/relocationOffers";

// Internal Component: Scenario Tabs
const ScenarioTabs = ({ offers, activeScenarioId, onSelect, onCreate, onDelete, baselineId }) => {
    return (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {offers.map(offer => {
                const isActive = offer.id === activeScenarioId;
                const isBaseline = offer.id === baselineId;
                return (
                    <div
                        key={offer.id}
                        onClick={() => onSelect(offer.id)}
                        className={`
                            relative flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all whitespace-nowrap border
                            ${isActive
                                ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-black/20'
                                : 'bg-black/20 border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            }
                        `}
                    >
                        <span className="text-lg">{offer.country === 'Australia' ? '🇦🇺' : offer.country === 'United Arab Emirates' ? '🇦🇪' : offer.country === 'Saudi Arabia' ? '🇸🇦' : '🌍'}</span>
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {offer.name}
                        </span>
                        {!isBaseline && isActive && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(offer.id); }}
                                className="ml-2 p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                        {isActive && (
                            <div className="absolute inset-x-0 -bottom-[11px] h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                        )}
                    </div>
                );
            })}
            <button
                onClick={onCreate}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                New Scenario
            </button>
        </div>
    );
};

// Internal Component: Input Group
const InputGroup = ({ label, icon: Icon, children, className, headerColor = "text-gray-400" }) => (
    <div className={`p-4 bg-black/20 rounded-xl border border-white/5 ${className}`}>
        <div className={`flex items-center gap-2 mb-3 ${headerColor}`}>
            {Icon && <Icon className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
        </div>
        {children}
    </div>
);

// Internal Component: Metric Tile
const MetricTile = ({ label, value, subtext, trend, trendLabel, color = "emerald" }) => (
    <div className="flex flex-col">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${color === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>
                {value}
            </span>
            {trend && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        {subtext && <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtext}</span>}
    </div>
);

// Internal Component: AI Wealth Advisor
const AIAdvisor = ({ outcomes, activeScenarioId, baselineId }) => {
    const activeOutcome = outcomes[activeScenarioId] || {};
    const baselineOutcome = outcomes[baselineId] || {};
    const isBaseline = activeScenarioId === baselineId;

    if (isBaseline) {
        return (
            <SurfaceCard className="p-6 relative overflow-hidden group border-blue-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Globe className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Baseline: Sydney</h3>
                        <p className="text-sm text-gray-400 mb-3">
                            This is your reference point. Create or select a new scenario to see how much faster you can build wealth abroad.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                            <ArrowRight className="w-4 h-4" /> Select a destination
                        </div>
                    </div>
                </div>
            </SurfaceCard>
        );
    }

    // Calculations
    const activeSavings = activeOutcome.netAfterDebtsAudMonthly || 0;
    const baselineSavings = baselineOutcome.netAfterDebtsAudMonthly || 0;
    const delta = activeSavings - baselineSavings;
    const multiplier = baselineSavings > 0 ? (activeSavings / baselineSavings).toFixed(1) : "∞";
    const annualExtra = delta * 12;

    // Time to $100k (Micro-FIRE)
    const monthsTo100kActive = activeSavings > 0 ? 100000 / activeSavings : 999;
    const monthsTo100kBaseline = baselineSavings > 0 ? 100000 / baselineSavings : 999;
    const timeSaved = Math.max(0, Math.round(monthsTo100kBaseline - monthsTo100kActive));

    // Tax Efficiency
    const taxSaved = (baselineOutcome.taxMonthlyAud || 0) - (activeOutcome.taxMonthlyAud || 0);

    return (
        <SurfaceCard className="p-0 relative overflow-hidden group border-emerald-500/20">
            {/* Dynamic Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${delta > 0 ? 'from-emerald-900/20 to-black' : 'from-red-900/20 to-black'} opacity-50`} />

            <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${delta > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">AI Wealth Advisor</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">VS SYDNEY BASELINE</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-3xl font-bold ${delta > 0 ? 'text-white' : 'text-red-400'}`}>
                            {delta > 0 ? '+' : ''}{multiplier}x
                        </div>
                        <div className="text-xs text-gray-500">Wealth Velocity</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Insight 1: Wealth Acceleration */}
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                            <Rocket className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Acceleration</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-snug">
                            You are building wealth <span className="text-white font-bold">{multiplier}x faster</span>.
                            That's an extra <span className="text-emerald-400 font-bold">${Math.round(annualExtra).toLocaleString()}</span> per year.
                        </p>
                    </div>

                    {/* Insight 2: Time to Freedom */}
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Hourglass className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Time to $100k</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-snug">
                            Reach $100k savings in <span className="text-white font-bold">{Math.round(monthsTo100kActive)} months</span>.
                            {timeSaved > 0 && <span> You save <span className="text-blue-400 font-bold">{timeSaved} months</span> of working life.</span>}
                        </p>
                    </div>

                    {/* Insight 3: Strategic Trade-off */}
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <Landmark className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Efficiency</span>
                        </div>
                        {taxSaved > 0 ? (
                            <p className="text-sm text-gray-300 leading-snug">
                                <span className="text-white font-bold">Tax Advantage:</span> You save <span className="text-purple-400 font-bold">${Math.round(taxSaved).toLocaleString()}/mo</span> in taxes vs Sydney.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-300 leading-snug">
                                <span className="text-white font-bold">Lifestyle Cost:</span> Higher living costs are offset by income gains.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </SurfaceCard>
    );
};


// Internal Component: Strategic Assessment
const StrategicAssessment = ({ offer, outcome }) => {
    const { label, reasons } = outcome.verdict || { label: 'Analyzing...', reasons: [] };

    return (
        <SurfaceCard className="flex flex-col border-blue-500/10" padding="p-0">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Strategic Assessment</h4>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${label === 'Strong Upgrade' ? 'bg-emerald-500/20 text-emerald-400' :
                    label === 'High Risk' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {label.toUpperCase()}
                </span>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4">
                {/* Verdict Reasons */}
                <div>
                    <span className="text-xs text-gray-500 font-bold uppercase mb-2 block">Key Drivers</span>
                    <ul className="space-y-2">
                        {reasons.length > 0 ? reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                            </li>
                        )) : (
                            <li className="text-sm text-gray-500 italic">Insufficient data for assessment</li>
                        )}
                    </ul>
                </div>

                {/* Benefits & Risks Two-Col */}
                <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-white/5">
                    <div>
                        <span className="text-xs text-emerald-500 font-bold uppercase mb-2 block flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Benefits
                        </span>
                        <ul className="space-y-1.5">
                            {offer.benefits?.slice(0, 3).map((b, i) => (
                                <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                                    <span className="text-emerald-500/50">•</span> {b}
                                </li>
                            ))}
                            {(!offer.benefits || offer.benefits.length === 0) && (
                                <li className="text-xs text-gray-600 italic">No benefits listed</li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <span className="text-xs text-red-500 font-bold uppercase mb-2 block flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Risks
                        </span>
                        <ul className="space-y-1.5">
                            {offer.risks?.slice(0, 3).map((r, i) => (
                                <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                                    <span className="text-red-500/50">•</span> {r}
                                </li>
                            ))}
                            {(!offer.risks || offer.risks.length === 0) && (
                                <li className="text-xs text-gray-600 italic">No risks listed</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </SurfaceCard>
    );
};

export default function CareerPathSimulator({
    offers,
    activeScenarioId,
    setActiveScenarioId,
    outcomes,
    assumptions,
    updateAssumption,
    onUpdateScenario,
    onCreateScenario,
    onDeleteScenario,
    onDuplicateScenario,
    baselineId
}) {
    const activeOffer = offers.find(o => o.id === activeScenarioId) || offers[0];
    const outcome = outcomes[activeScenarioId] || {};
    const baselineOutcome = outcomes[baselineId] || {};
    const isBaseline = activeScenarioId === baselineId;

    // Derived metrics
    const annualSavings = (outcome.netAfterDebtsAudMonthly || 0) * 12;
    const baselineSavings = (baselineOutcome.netAfterDebtsAudMonthly || 0) * 12;
    const savingsDelta = annualSavings - baselineSavings;
    const savingsGrowth = baselineSavings > 0 ? (savingsDelta / baselineSavings) * 100 : 0;

    // Chart Data
    const cashflowData = [
        {
            name: 'Income',
            value: Math.round(outcome.netMonthlyAud + (outcome.totalBenefitsAudMonthly || 0) + (outcome.partnerIncomeAud || 0)),
            fill: '#3B82F6' // Blue
        },
        {
            name: 'Expenses',
            value: Math.round(outcome.totalCostsAudMonthly + outcome.debtLoadAudMonthly),
            fill: '#EF4444' // Red
        },
        {
            name: 'Savings',
            value: Math.round(outcome.netAfterDebtsAudMonthly),
            fill: '#10B981' // Green
        }
    ];

    const generateWealthProjection = () => {
        const data = [];
        let accumulated = 0;
        let baselineAccumulated = 0;
        for (let i = 0; i <= 5; i++) {
            data.push({
                year: `Year ${i}`,
                Scenario: Math.round(accumulated),
                Baseline: Math.round(baselineAccumulated)
            });
            accumulated += annualSavings * Math.pow(1.05, i + 1); // Simple 5% growth
            baselineAccumulated += baselineSavings * Math.pow(1.05, i + 1);
        }
        return data;
    };
    const wealthData = useMemo(() => generateWealthProjection(), [annualSavings, baselineSavings]);


    const renderInputSection = () => (
        <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
            {/* 1. Identity */}
            <InputGroup label="Identity" icon={Globe}>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Scenario Name</label>
                        <input
                            type="text"
                            value={activeOffer.name}
                            onChange={(e) => onUpdateScenario(activeOffer.id, 'name', e.target.value)}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition"
                            disabled={isBaseline}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Country</label>
                        <select
                            value={activeOffer.country}
                            onChange={(e) => onUpdateScenario(activeOffer.id, 'country', e.target.value)}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition [&>option]:bg-gray-900"
                            disabled={isBaseline}
                        >
                            <option value="Australia">Australia</option>
                            <option value="United Arab Emirates">UAE (Dubai)</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="United States">USA</option>
                            <option value="United Kingdom">UK</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Unknown">Other</option>
                        </select>
                    </div>
                </div>
            </InputGroup>

            {/* 2. Income Lever */}
            <InputGroup label="Income Lever" icon={Coins} headerColor="text-blue-400">
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Base Salary (Local)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-xs font-bold">{activeOffer.currency}</span>
                            <input
                                type="number"
                                value={activeOffer.netMonthlyPayLocal || activeOffer.salaryLocal / 12 || 0}
                                onChange={(e) => onUpdateScenario(activeOffer.id, 'netMonthlyPayLocal', parseFloat(e.target.value) || 0)}
                                className="w-full bg-black/40 border border-white/5 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition font-mono"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                            ≈ {Math.round(outcome.netMonthlyAud).toLocaleString()} AUD/mo
                        </p>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Annual Bonus (Local)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-xs font-bold">{activeOffer.currency}</span>
                            <input
                                type="number"
                                value={activeOffer.annualBonusLocal || 0}
                                onChange={(e) => onUpdateScenario(activeOffer.id, 'annualBonusLocal', parseFloat(e.target.value) || 0)}
                                className="w-full bg-black/40 border border-white/5 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition font-mono"
                            />
                        </div>
                    </div>
                </div>
                {/* Benefits Toggles */}
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'housingIncluded', label: 'Housing Inc.', icon: Home },
                        { id: 'schoolingIncluded', label: 'Schools Inc.', icon: GraduationCap } // Mock property
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => onUpdateScenario(activeOffer.id, opt.id, !activeOffer[opt.id])}
                            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-all ${activeOffer[opt.id]
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                : 'bg-black/40 border-white/5 text-gray-500 hover:bg-white/10'
                                }`}
                        >
                            <opt.icon className="w-3" /> {opt.label}
                        </button>
                    ))}
                </div>
            </InputGroup>


            {/* 3. Cost Of Living Lever */}
            <InputGroup label="Lifestyle Costs (Local)" icon={Building2} headerColor="text-red-400">
                <div className="grid grid-cols-2 gap-3">
                    {!activeOffer.housingIncluded && (
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Rent / Housing</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-xs font-bold">{activeOffer.currency}</span>
                                <input
                                    type="number"
                                    value={activeOffer.housingMonthlyLocal || 0}
                                    onChange={(e) => onUpdateScenario(activeOffer.id, 'housingMonthlyLocal', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-black/40 border border-white/5 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500/50 outline-none transition font-mono"
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">General Living</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-xs font-bold">{activeOffer.currency}</span>
                            <input
                                type="number"
                                value={activeOffer.utilitiesMonthlyLocal || 2000} // Mock general field
                                onChange={(e) => onUpdateScenario(activeOffer.id, 'utilitiesMonthlyLocal', parseFloat(e.target.value) || 0)}
                                className="w-full bg-black/40 border border-white/5 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500/50 outline-none transition font-mono"
                            />
                        </div>
                    </div>
                </div>
            </InputGroup>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* 1. SCENARIO TABS */}
            <ScenarioTabs
                offers={offers}
                activeScenarioId={activeScenarioId}
                onSelect={setActiveScenarioId}
                onCreate={onCreateScenario}
                onDelete={onDeleteScenario}
                baselineId={baselineId}
            />

            {/* 2. MAIN DASHBOARD GRID */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                {/* LEFT: INPUTS (The Levers) */}
                <div className="lg:col-span-4 h-full flex flex-col gap-4">
                    <SurfaceCard className="flex-1 p-5 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Settings className="w-4 h-4 text-emerald-500" />
                                Configuration
                            </h3>
                            <button
                                onClick={() => onDuplicateScenario(activeScenarioId)}
                                className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <Copy className="w-3 h-3" /> Duplicate
                            </button>
                        </div>
                        {renderInputSection()}
                    </SurfaceCard>
                </div>

                {/* RIGHT: OUTPUTS (The Results) */}
                <div className="lg:col-span-8 h-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

                    {/* A. HERO METRICS & AI ADVISOR */}
                    <div className="flex flex-col gap-4">
                        <AIAdvisor outcomes={outcomes} activeScenarioId={activeScenarioId} baselineId={baselineId} />
                    </div>

                    {/* B. CHARTS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
                        <SurfaceCard className="p-4 flex flex-col">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Monthly Cashflow (AUD)</h4>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashflowData} layout="vertical" barSize={24} margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={10} width={60} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </SurfaceCard>

                        <SurfaceCard className="p-4 flex flex-col">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">5-Year Wealth Trajectory</h4>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={wealthData} margin={{ left: -20, right: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradientScenario" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="year" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6B7280" fontSize={10} tickFormatter={val => `$${val / 1000}k`} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                                            formatter={(val) => `$${val.toLocaleString()}`}
                                        />
                                        <Area type="monotone" dataKey="Scenario" stroke="#10B981" strokeWidth={2} fill="url(#gradientScenario)" />
                                        <Area type="monotone" dataKey="Baseline" stroke="#6B7280" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </SurfaceCard>
                    </div>

                    {/* C. FINANCIAL BREAKDOWN TABLE */}
                    <SurfaceCard className="overflow-hidden" padding="p-0">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h4 className="text-sm font-bold text-white">Financial Breakdown</h4>
                            <span className="text-xs text-gray-500">*Values in AUD/mo</span>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black/20 text-gray-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-3">Component</th>
                                    <th className="px-4 py-3 text-right">Baseline</th>
                                    <th className="px-4 py-3 text-right text-emerald-400">Target</th>
                                    <th className="px-4 py-3 text-right">Variance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                <tr>
                                    <td className="px-4 py-3">Gross Income</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">${Math.round(baselineOutcome.netMonthlyAud + (baselineOutcome.totalBenefitsAudMonthly || 0)).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-white">${Math.round(outcome.netMonthlyAud + (outcome.totalBenefitsAudMonthly || 0)).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-500">+${Math.round((outcome.netMonthlyAud + (outcome.totalBenefitsAudMonthly || 0)) - (baselineOutcome.netMonthlyAud + (baselineOutcome.totalBenefitsAudMonthly || 0))).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3">Living Costs</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">${Math.round(baselineOutcome.totalCostsAudMonthly).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-white">${Math.round(outcome.totalCostsAudMonthly).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-red-400">-${Math.round(outcome.totalCostsAudMonthly - baselineOutcome.totalCostsAudMonthly).toLocaleString()}</td>
                                </tr>
                                <tr className="bg-white/5 font-bold">
                                    <td className="px-4 py-3 text-white">Net Monthly Cash</td>
                                    <td className="px-4 py-3 text-right font-mono text-emerald-600/70">${Math.round(baselineOutcome.netAfterDebtsAudMonthly).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-emerald-400">${Math.round(outcome.netAfterDebtsAudMonthly).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-emerald-500">+${Math.round(outcome.netAfterDebtsAudMonthly - baselineOutcome.netAfterDebtsAudMonthly).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </SurfaceCard>

                    {/* D. STRATEGIC ASSESSMENT */}
                    <div className="min-h-[200px]">
                        <StrategicAssessment offer={activeOffer} outcome={outcome} />
                    </div>

                </div>
            </div>
        </div>
    );
}

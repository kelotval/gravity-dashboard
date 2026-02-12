// Modern Relocation Tabs with AI Insights
import React, { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Globe, Target, Zap, Brain, AlertCircle, CheckCircle2, Lightbulb, ArrowUpDown, Percent, DollarSign, TrendingUp as Growth } from "lucide-react";
import { toAud } from "../data/relocationOffers";
import { SurfaceCard } from "./common/SurfaceCard";

// AI Insights Component (Deterministic)
export function AIInsights({ selectedOffers, outcomes, assumptions, baselineId }) {
    if (selectedOffers.length === 0) return null;

    const baseline = selectedOffers.find(o => o.id === baselineId);
    const baselineOutcome = outcomes[baseline?.id];

    // Find best offer
    const bestOffer = selectedOffers.reduce((best, offer) => {
        return outcomes[offer.id].qualityScore > outcomes[best.id].qualityScore ? offer : best;
    }, selectedOffers[0]);

    const bestOutcome = outcomes[bestOffer.id];
    const improvement = baselineOutcome ?
        ((bestOutcome.netAfterDebtsAudMonthly - baselineOutcome.netAfterDebtsAudMonthly) / baselineOutcome.netAfterDebtsAudMonthly * 100) : 0;

    // Deterministic insights
    const insights = [];

    if (improvement > 50) {
        insights.push({
            type: 'opportunity',
            icon: <Growth className="w-5 h-5" />,
            title: 'Major Financial Upgrade',
            message: `${bestOffer.name} offers ${Math.round(improvement)}% more monthly cashflow than baseline`,
            confidence: 95
        });
    } else if (improvement > 20) {
        insights.push({
            type: 'positive',
            icon: <CheckCircle2 className="w-5 h-5" />,
            title: 'Solid Improvement',
            message: `${bestOffer.name} provides ${Math.round(improvement)}% increase in monthly savings`,
            confidence: 85
        });
    }

    // Risk insights
    const highRiskOffers = selectedOffers.filter(o =>
        outcomes[o.id].verdict.label === 'High Risk' || outcomes[o.id].verdict.label === 'Not Worth It'
    );

    if (highRiskOffers.length > 0) {
        insights.push({
            type: 'warning',
            icon: <AlertCircle className="w-5 h-5" />,
            title: 'Risk Assessment',
            message: `${highRiskOffers.length} offer(s) flagged as high risk - review quality scores carefully`,
            confidence: 90
        });
    }

    // Runway insights
    if (bestOutcome.runwayMonths >= 12) {
        insights.push({
            type: 'positive',
            icon: <CheckCircle2 className="w-5 h-5" />,
            title: 'Strong Safety Buffer',
            message: `${bestOffer.name} provides ${Math.round(bestOutcome.runwayMonths)} months emergency coverage`,
            confidence: 95
        });
    }

    // FX sensitivity
    const hasFXRisk = selectedOffers.some(o => o.currency !== 'AUD');
    if (hasFXRisk) {
        insights.push({
            type: 'info',
            icon: <Lightbulb className="w-5 h-5" />,
            title: 'Currency Risk',
            message: 'Test FX rate changes in Assumptions tab to understand currency exposure',
            confidence: 80
        });
    }

    return (
        <SurfaceCard className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">AI Financial Advisor</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Data-driven insights</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {insights.map((insight, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-xl border ${insight.type === 'opportunity' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20' :
                                insight.type === 'positive' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/20' :
                                    insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20' :
                                        'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`${insight.type === 'opportunity' ? 'text-emerald-600 dark:text-emerald-400' :
                                    insight.type === 'positive' ? 'text-blue-600 dark:text-blue-400' :
                                        insight.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                            'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {insight.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{insight.message}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-600"
                                                style={{ width: `${insight.confidence}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{insight.confidence}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SurfaceCard>
    );
}

// Money Breakdown Tab - Redesigned
export function MoneyBreakdownTab({ selectedOffers, outcomes, assumptions }) {
    if (selectedOffers.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select offers to view breakdown</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {selectedOffers.map((offer, idx) => {
                const outcome = outcomes[offer.id];
                const income = outcome.totalIncomeAudMonthly;
                const expenses = outcome.totalExpensesAudMonthly;
                const net = outcome.netAfterDebtsAudMonthly;

                return (
                    <SurfaceCard key={offer.id} className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-2xl text-white">{offer.name}</h3>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Quality Score</div>
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{outcome.qualityScore}/100</div>
                                </div>
                            </div>

                            {/* Waterfall Visualization */}
                            <div className="mb-6">
                                <div className="relative h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                                    {/* Income bar */}
                                    <div
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold"
                                        style={{ width: '100%' }}
                                    >
                                        <span>Income: ${Math.round(income).toLocaleString()}</span>
                                    </div>

                                    {/* Expenses overlay */}
                                    <div
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500/90 to-red-600/90 flex items-center justify-center text-white font-bold"
                                        style={{ width: `${(expenses / income) * 100}%` }}
                                    >
                                        <span>Costs: ${Math.round(expenses).toLocaleString()}</span>
                                    </div>

                                    {/* Net remaining */}
                                    <div
                                        className="absolute right-0 top-0 h-full border-l-4 border-white dark:border-gray-900 flex items-center px-4"
                                        style={{ width: `${(net / income) * 100}%` }}
                                    >
                                        <span className="text-white font-bold text-sm shadow-black/20 text-shadow">Net: ${Math.round(net).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Income</span>
                                    </div>
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ${Math.round(income).toLocaleString()}
                                    </div>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        <span className="text-xs font-medium text-red-700 dark:text-red-300">Costs</span>
                                    </div>
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        ${Math.round(expenses).toLocaleString()}
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Net</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        ${Math.round(net).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed breakdown */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Income Sources</h4>
                                    {[
                                        { label: 'Base Salary', value: toAud(offer.salaryLocal / 12, offer.currency, assumptions) },
                                        { label: 'Bonus', value: offer.bonusLocal ? toAud(offer.bonusLocal / 12, offer.currency, assumptions) : 0 },
                                        { label: 'Housing Allow.', value: offer.housingAllowanceLocal ? toAud(offer.housingAllowanceLocal, offer.currency, assumptions) : 0 }
                                    ].filter(item => item.value > 0).map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                                            <span className="font-semibold text-white">${Math.round(item.value).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Major Costs</h4>
                                    {[
                                        { label: 'Tax', value: outcome.taxAudMonthly },
                                        { label: 'Housing', value: outcome.housingCostAudMonthly },
                                        { label: 'Living', value: outcome.discretionaryAudMonthly }
                                    ].filter(item => item.value > 0).map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                                            <span className="font-semibold text-white">${Math.round(item.value).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SurfaceCard>
                );
            })}
        </div>
    );
}

// Assumptions Tab - Redesigned
export function AssumptionsTab({ assumptions, updateAssumption, selectedOffers = [], outcomes = {} }) {
    const [testFxRate, setTestFxRate] = useState(null);

    // Calculate sensitivity
    const fxImpact = selectedOffers.length > 0 ? selectedOffers.map(offer => {
        if (offer.currency === 'AUD') return null;
        const outcome = outcomes[offer.id];
        // Simulate 10% FX change
        const impact = outcome.netAfterDebtsAudMonthly * 0.1;
        return { offer: offer.name, impact: Math.abs(impact) };
    }).filter(Boolean) : [];

    return (
        <div className="space-y-6">
            {/* AI Sensitivity Analysis */}
            {fxImpact.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-500/20">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="font-bold text-amber-900 dark:text-amber-300">Sensitivity Analysis</h3>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                        A 10% FX rate change would impact your offers by:
                    </p>
                    <div className="space-y-2">
                        {fxImpact.map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                <span className="font-medium text-white">{item.offer}</span>
                                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    ±${Math.round(item.impact).toLocaleString()}/mo
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FX Rates - Modern Design */}
            <SurfaceCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-bold text-white">Currency Rates to AUD</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { key: 'fxAedToAud', label: 'AED', flag: '🇦🇪', value: assumptions.fxAedToAud },
                        { key: 'fxSarToAud', label: 'SAR', flag: '🇸🇦', value: assumptions.fxSarToAud },
                        { key: 'fxUsdToAud', label: 'USD', flag: '🇺🇸', value: assumptions.fxUsdToAud }
                    ].map(rate => (
                        <div key={rate.key} className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-500/20">
                            <label className="block mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{rate.flag}</span>
                                    <span className="font-semibold text-white">{rate.label} → AUD</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rate.value}
                                    onChange={(e) => updateAssumption(rate.key, parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 text-lg font-bold border-2 border-blue-200 dark:border-blue-700/50 rounded-lg bg-white dark:bg-gray-900/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </label>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                1 {rate.label} = {(rate.value || 0).toFixed(4)} AUD
                            </div>
                        </div>
                    ))}
                </div>
            </SurfaceCard>

            {/* Cost of Living - Modernized */}
            <SurfaceCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-bold text-white">Cost of Living Multipliers</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { key: 'colDubaiMultiplier', label: 'Dubai vs Sydney', flag: '🇦🇪', value: assumptions.colDubaiMultiplier },
                        { key: 'colSaudiMultiplier', label: 'Saudi vs Sydney', flag: '🇸🇦', value: assumptions.colSaudiMultiplier }
                    ].map(mult => (
                        <div key={mult.key} className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-500/20">
                            <label className="block mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{mult.flag}</span>
                                    <span className="font-semibold text-white">{mult.label}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={mult.value}
                                    onChange={(e) => updateAssumption(mult.key, parseFloat(e.target.value))}
                                    className="w-full h-3 bg-purple-200 dark:bg-purple-800 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    <span>50% cheaper</span>
                                    <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{(mult.value || 1).toFixed(1)}x</span>
                                    <span>100% more expensive</span>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </SurfaceCard>
        </div>
    );
}

// Negotiation Simulator - Fixed and Modernized
export function NegotiationSimulatorTab({ selectedOffers = [], outcomes = {}, updateOfferField, baselineId }) {
    if (selectedOffers.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Target className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select offers to simulate</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AIInsights
                selectedOffers={selectedOffers}
                outcomes={outcomes}
                assumptions={{}}
                baselineId={baselineId}
            />

            {selectedOffers.map(offer => {
                const outcome = outcomes[offer.id];
                const baseline = outcomes[baselineId];
                const delta = outcome.netAfterDebtsAudMonthly - (baseline?.netAfterDebtsAudMonthly || 0);

                const salary = offer.salaryLocal || 180000;
                const bonus = offer.bonusLocal || 0;
                const housing = offer.housingAllowanceLocal || 0;
                const schooling = offer.schoolingAllowanceLocal || 0;

                return (
                    <SurfaceCard key={offer.id} className="p-6">
                        <div className="flex justify-between mb-6">
                            <div>
                                <h4 className="font-bold text-2xl text-white mb-1">{offer.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Adjust parameters to see instant impact</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    ${Math.round(outcome.netAfterDebtsAudMonthly).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">net/month</div>
                                {offer.id !== baselineId && (
                                    <div className={`text-sm font-bold mt-1 ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {delta > 0 ? '+' : ''}{delta > 0 ? '$' : '-$'}{Math.abs(Math.round(delta)).toLocaleString()}/mo vs baseline
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Salary Slider */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <label className="block">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-semibold text-white">Annual Salary</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={salary}
                                                onChange={(e) => updateOfferField(offer.id, 'salaryLocal', parseFloat(e.target.value) || 0)}
                                                className="w-28 px-2 py-1 text-right text-sm border border-gray-200 dark:border-gray-600 rounded bg-transparent text-white"
                                            />
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{offer.currency}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={Math.round(salary * 0.7)}
                                        max={Math.round(salary * 1.4)}
                                        step={1000}
                                        value={salary}
                                        onChange={(e) => {
                                            const newValue = parseFloat(e.target.value);
                                            updateOfferField(offer.id, 'salaryLocal', newValue);
                                        }}
                                        className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-800 dark:to-blue-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <span>{Math.round(salary * 0.7).toLocaleString()}</span>
                                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{salary.toLocaleString()}</span>
                                        <span>{Math.round(salary * 1.4).toLocaleString()}</span>
                                    </div>
                                </label>
                            </div>

                            {/* Bonus Slider */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <label className="block">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-semibold text-white">Annual Bonus</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={bonus}
                                                onChange={(e) => updateOfferField(offer.id, 'bonusLocal', parseFloat(e.target.value) || 0)}
                                                className="w-24 px-2 py-1 text-right text-sm border border-gray-200 dark:border-gray-600 rounded bg-transparent text-white"
                                            />
                                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">{offer.currency}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={Math.max(salary * 0.6, bonus * 1.5)} // Dynamic max
                                        step={1000}
                                        value={bonus}
                                        onChange={(e) => {
                                            const newValue = parseFloat(e.target.value);
                                            updateOfferField(offer.id, 'bonusLocal', newValue);
                                        }}
                                        className="w-full h-3 bg-gradient-to-r from-emerald-200 to-emerald-400 dark:from-emerald-800 dark:to-emerald-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <span>0</span>
                                        <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{bonus.toLocaleString()}</span>
                                        <span>{Math.round(Math.max(salary * 0.6, bonus * 1.5)).toLocaleString()}</span>
                                    </div>
                                </label>
                            </div>

                            {/* Housing */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <label className="block">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-semibold text-white">Housing Allowance/mo</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={housing}
                                                onChange={(e) => updateOfferField(offer.id, 'housingAllowanceLocal', parseFloat(e.target.value) || 0)}
                                                className="w-24 px-2 py-1 text-right text-sm border border-gray-200 dark:border-gray-600 rounded bg-transparent text-white"
                                            />
                                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">{offer.currency}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={Math.max(25000, housing * 1.5)}
                                        step={500}
                                        value={housing}
                                        onChange={(e) => {
                                            const newValue = parseFloat(e.target.value);
                                            updateOfferField(offer.id, 'housingAllowanceLocal', newValue);
                                        }}
                                        className="w-full h-3 bg-gradient-to-r from-purple-200 to-purple-400 dark:from-purple-800 dark:to-purple-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <span>0</span>
                                        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{housing.toLocaleString()}</span>
                                        <span>{Math.max(25000, housing * 1.5).toLocaleString()}</span>
                                    </div>
                                </label>
                            </div>

                            {/* Schooling */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <label className="block">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-semibold text-white">Schooling/mo</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={schooling}
                                                onChange={(e) => updateOfferField(offer.id, 'schoolingAllowanceLocal', parseFloat(e.target.value) || 0)}
                                                className="w-24 px-2 py-1 text-right text-sm border border-gray-200 dark:border-gray-600 rounded bg-transparent text-white"
                                            />
                                            <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-1 rounded">{offer.currency}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={12000}
                                        step={250}
                                        value={schooling}
                                        onChange={(e) => {
                                            const newValue = parseFloat(e.target.value);
                                            updateOfferField(offer.id, 'schoolingAllowanceLocal', newValue);
                                        }}
                                        className="w-full h-3 bg-gradient-to-r from-pink-200 to-pink-400 dark:from-pink-800 dark:to-pink-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <span>0</span>
                                        <span className="font-bold text-lg text-pink-600 dark:text-pink-400">{schooling.toLocaleString()}</span>
                                        <span>12,000</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Impact Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quality</div>
                                    <div className="text-2xl font-bold text-white">{outcome.qualityScore}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Runway</div>
                                    <div className="text-2xl font-bold text-white">{Math.round(outcome.runwayMonths)}mo</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Verdict</div>
                                    <div className={`text-sm font-bold ${outcome.verdict.label === 'Strong Upgrade' ? 'text-emerald-600 dark:text-emerald-400' :
                                        outcome.verdict.label === 'High Risk' ? 'text-red-600 dark:text-red-400' :
                                            'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                        {outcome.verdict.label}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SurfaceCard>
                );
            })}
        </div>
    );
}

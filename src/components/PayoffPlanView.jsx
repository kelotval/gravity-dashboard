import React, { useState, useMemo } from "react";
import { Calculator, Calendar, TrendingDown, CheckCircle, Flag, DollarSign, ArrowRight, Wallet, Info } from "lucide-react";
import clsx from "clsx";
import { generatePayoffAllocation, calculateEffectiveRateState, calculateInterestProjections } from "../utils/PayoffEngine";
import InterestRiskPanel from "./InterestRiskPanel";
import { PageContainer } from "./common/PageContainer";
import { SurfaceCard } from "./common/SurfaceCard";

export default function PayoffPlanView({ debts, advancedSettings, onUpdateDebts }) {
    const [surplusCash, setSurplusCash] = useState(500); // Default surplus
    const [horizonDays, setHorizonDays] = useState(90);  // Lookahead window

    // Generate Smart Plan with surplus
    const allocationPlan = useMemo(() => {
        return generatePayoffAllocation(debts, surplusCash, horizonDays);
    }, [debts, surplusCash, horizonDays]);

    // Generate Baseline Plan (0 surplus) for Simulator Comparison
    const baselinePlan = useMemo(() => {
        return generatePayoffAllocation(debts, 0, horizonDays);
    }, [debts, horizonDays]);

    const totalMonthlyCommitment = allocationPlan.reduce((acc, d) => acc + d.allocation.totalPay, 0);

    // Simulator Metrics
    const simMetrics = useMemo(() => {
        if (!allocationPlan || allocationPlan.length === 0 || !baselinePlan || baselinePlan.length === 0) {
            return {
                currentInterest: 0,
                baselineInterest: 0,
                interestSaved: 0,
                timeSaved: 0,
                payoffDate: new Date(),
                priorityDebtMonths: 0,
                priorityDebtSaved: 0
            };
        }

        const currentInterest = allocationPlan.reduce((acc, item) => {
            const val = item.allocation.projectedInterest || 0;
            return val === Infinity ? acc : acc + val;
        }, 0);

        const baselineInterest = baselinePlan.reduce((acc, item) => {
            const val = item.allocation.projectedInterest || 0;
            return val === Infinity ? acc : acc + val;
        }, 0);

        const currentMaxMonths = Math.max(0, ...allocationPlan.map(i => i.allocation.monthsToPayoff));
        const baselineMaxMonths = Math.max(0, ...baselinePlan.map(i => i.allocation.monthsToPayoff));

        // Priority debt (first in allocation plan) metrics
        const priorityDebtCurrent = allocationPlan[0]?.allocation.monthsToPayoff || 0;
        const priorityDebtBaseline = baselinePlan[0]?.allocation.monthsToPayoff || 0;
        const priorityDebtSaved = Math.max(priorityDebtBaseline - priorityDebtCurrent, 0);

        const interestSaved = Math.max(baselineInterest - currentInterest, 0);
        const timeSaved = Math.max(baselineMaxMonths - currentMaxMonths, 0);

        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + (isFinite(currentMaxMonths) ? currentMaxMonths : 0));

        return {
            currentInterest,
            baselineInterest,
            interestSaved,
            timeSaved,
            payoffDate,
            priorityDebtMonths: priorityDebtCurrent,
            priorityDebtSaved
        };
    }, [allocationPlan, baselinePlan]);

    return (
        <PageContainer
            title="Payoff Strategy"
            subtitle="Optimize your debt freedom path"
        >

            {/* Debt Freedom Hero */}
            <SurfaceCard className="!p-0 overflow-hidden relative border-indigo-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 opacity-80" />
                <div className="relative z-10 p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div>
                        <h2 className="text-xs font-semibold text-indigo-300 uppercase tracking-[0.2em] mb-3 flex items-center justify-center sm:justify-start gap-2">
                            <Calendar className="w-4 h-4" />
                            Estimated Debt Free Date
                        </h2>
                        <div className="text-4xl sm:text-6xl font-light text-white tracking-tighter">
                            {simMetrics.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <p className="text-gray-400 mt-2 text-sm">
                            {simMetrics.timeSaved > 0 ? (
                                <span className="text-emerald-400 font-medium">
                                    {simMetrics.timeSaved} months sooner
                                </span>
                            ) : (
                                <span>Based on current strategy</span>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[200px]">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm text-center sm:text-right">
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">Monthly Commitment</label>
                            <span className="text-2xl font-bold text-white block">
                                ${totalMonthlyCommitment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Surplus</label>
                            <div className="flex items-center group">
                                <span className="text-gray-500 mr-1 group-focus-within:text-emerald-400 transition-colors">$</span>
                                <input
                                    type="number"
                                    value={surplusCash}
                                    onChange={(e) => setSurplusCash(Number(e.target.value))}
                                    className="bg-transparent text-lg font-bold w-16 text-right focus:outline-none text-emerald-400 placeholder-gray-600"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SurfaceCard>

            {/* What-If Simulator (Advanced Feature) */}
            {advancedSettings?.interestCostSimulator && (
                <SurfaceCard className="!p-0 overflow-hidden relative border-purple-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 pointer-events-none" />
                    <div className="absolute top-0 right-0 p-32 bg-purple-500 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>

                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
                            <Calculator className="w-5 h-5 text-purple-300" />
                            Interest Cost Simulator
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs text-purple-200 uppercase tracking-wider font-semibold mb-2 block">
                                    Extra Monthly Contribution
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="5000"
                                        step="100"
                                        value={surplusCash}
                                        onChange={(e) => setSurplusCash(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                                    />
                                    <span className="font-mono font-bold text-xl min-w-[80px] text-right text-white">${surplusCash}</span>
                                </div>
                                <p className="text-xs text-blue-200/70 mt-3 flex items-center gap-1.5">
                                    <Info className="w-3 h-3" />
                                    <span>Drag to see how extra payments reduce your life-of-loan interest.</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Total Interest Impact */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col justify-between">
                                    <div>
                                        <p className="text-gray-300 text-xs uppercase font-semibold tracking-wider">Projected Interest</p>
                                        <p className="text-2xl font-bold text-white mt-1">
                                            ${Math.round(simMetrics.currentInterest).toLocaleString()}
                                        </p>
                                    </div>
                                    {surplusCash > 0 && (
                                        <div className="mt-2 text-xs font-bold text-emerald-300 flex items-center gap-1">
                                            <TrendingDown className="w-3 h-3" />
                                            Save ${Math.round(simMetrics.interestSaved).toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                {/* Timeline Impact */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col justify-between">
                                    <div>
                                        <p className="text-gray-300 text-xs uppercase font-semibold tracking-wider">
                                            {simMetrics.timeSaved > 0 ? 'All Debts Cleared' : 'Debt Free By'}
                                        </p>
                                        <p className="text-xl font-bold text-white mt-1">
                                            {simMetrics.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    {surplusCash > 0 && simMetrics.timeSaved > 0 && (
                                        <div className="mt-2 text-xs font-bold text-blue-300 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {simMetrics.timeSaved} Months Sooner
                                        </div>
                                    )}
                                    {surplusCash > 0 && simMetrics.priorityDebtSaved > 0 && simMetrics.timeSaved === 0 && (
                                        <div className="mt-2 text-xs font-bold text-blue-300">
                                            Priority Debt: -{simMetrics.priorityDebtSaved} Mo
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </SurfaceCard>
            )}

            <InterestRiskPanel
                {...calculateInterestProjections(debts)}
            />

            {/* Smart Allocation List */}
            <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-500 uppercase tracking-wider pl-1">
                    Priority Order
                </h3>

                {allocationPlan.map((item, index) => {
                    const isTopPriority = index === 0;
                    const { allocation } = item;
                    const { rateIsSwitched } = calculateEffectiveRateState(item);

                    return (
                        <SurfaceCard key={item.id} padding="p-0" className={clsx("transition-all relative overflow-hidden",
                            isTopPriority
                                ? "border-indigo-500/30 ring-1 ring-indigo-500/20 bg-indigo-500/[0.02]"
                                : "hover:bg-white/[0.02]"
                        )}>
                            {isTopPriority && (
                                <div className="absolute top-0 right-0 bg-indigo-500/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-lg">
                                    FOCUS
                                </div>
                            )}

                            <div className="p-5 flex flex-col sm:flex-row gap-6 items-center">
                                {/* Rank */}
                                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border ${isTopPriority ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                    {index + 1}
                                </div>

                                {/* Debt Details */}
                                <div className="flex-1 text-center sm:text-left min-w-0">
                                    <h4 className="font-semibold text-lg text-white truncate">{item.name}</h4>
                                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-gray-500">
                                        <span>${item.currentBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        <span>•</span>
                                        <span>{item.rate}% APR</span>
                                        {rateIsSwitched && <span className="text-red-400 font-medium text-xs bg-red-500/10 px-1.5 rounded">Rate Switched</span>}
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="flex flex-col items-center sm:items-end gap-1">
                                    <span className="text-2xl font-bold text-white">${allocation.totalPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-gray-500">Monthly</span>
                                        {allocation.extraPay > 0 && (
                                            <span className="text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                +${allocation.extraPay.toLocaleString(undefined, { maximumFractionDigits: 0 })} Extra
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SurfaceCard>
                    );
                })}

                {debts.length === 0 && (
                    <SurfaceCard className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">Debt Free!</h3>
                        <p className="text-gray-500 dark:text-gray-400">You have no active debts. Time to build wealth!</p>
                    </SurfaceCard>
                )}
            </div>
        </PageContainer>
    );
}

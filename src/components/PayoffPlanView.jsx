import React, { useState, useMemo } from "react";
import { Calculator, Calendar, TrendingDown, CheckCircle, Flag, DollarSign, ArrowRight, Wallet, Info, Sparkles, Target, Zap } from "lucide-react";
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-white/10 shadow-2xl mb-8">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 p-24 bg-purple-500/5 rounded-full blur-3xl transform -translate-x-10 translate-y-10" />

                <div className="relative z-10 p-8 sm:p-10">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                        {/* Left: Main Metric */}
                        <div className="text-center lg:text-left space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                Debt Free Target
                            </div>
                            <div>
                                <h2 className="text-5xl sm:text-6xl font-extralight text-white tracking-tight">
                                    {simMetrics.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <p className="text-gray-400 mt-2 text-lg font-light">
                                    {simMetrics.timeSaved > 0 ? (
                                        <span className="flex items-center justify-center lg:justify-start gap-2">
                                            <span className="text-emerald-400 font-medium">
                                                <TrendingDown className="w-4 h-4 inline" /> {simMetrics.timeSaved} months sooner
                                            </span>
                                            <span className="text-gray-500">than baseline</span>
                                        </span>
                                    ) : (
                                        "Based on current payment strategy"
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Right: Controls & Secondary Metrics */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex-1 min-w-[200px]">
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">Total Monthly Pay</label>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white tracking-tight">
                                        ${totalMonthlyCommitment.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex-1 min-w-[200px] group transition-colors hover:bg-white/[0.07]">
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2 flex items-center justify-between">
                                    <span>Extra Payment</span>
                                    <Zap className="w-3 h-3 text-emerald-400" />
                                </label>
                                <div className="flex items-center">
                                    <span className="text-2xl font-medium text-gray-400 mr-1">$</span>
                                    <input
                                        type="number"
                                        value={surplusCash}
                                        onChange={(e) => setSurplusCash(Number(e.target.value))}
                                        className="bg-transparent text-3xl font-bold w-full text-emerald-400 focus:outline-none placeholder-gray-600"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simulator Slider (Integrated) */}
                    {advancedSettings?.interestCostSimulator && (
                        <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs text-indigo-300 font-medium flex items-center gap-2">
                                            <Calculator className="w-3 h-3" /> Simulator: Adjust Extra Cash
                                        </label>
                                        <span className="text-xs text-gray-500">Using extra cash saves interest</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5000"
                                        step="100"
                                        value={surplusCash}
                                        onChange={(e) => setSurplusCash(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400 hover:accent-indigo-300 transition-colors"
                                    />
                                    <div className="flex justify-between mt-1 text-[10px] text-gray-600 font-mono">
                                        <span>$0</span>
                                        <span>$2,500</span>
                                        <span>$5,000</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center md:text-right">
                                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Interest Saved</p>
                                        <p className="text-lg font-bold text-emerald-400">
                                            ${Math.round(simMetrics.interestSaved).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="animate-fade-in-up delay-100">
                <InterestRiskPanel
                    {...calculateInterestProjections(debts)}
                />
            </div>

            {/* Smart Allocation List */}
            <div className="space-y-6 mt-8 animate-fade-in-up delay-200">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Flag className="w-4 h-4" /> Optimization Strategy
                    </h3>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Avalanche Method (Highest Rate First)</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {allocationPlan.map((item, index) => {
                        const isTopPriority = index === 0;
                        const { allocation } = item;
                        const { rateIsSwitched } = calculateEffectiveRateState(item);

                        return (
                            <div key={item.id} className={clsx(
                                "relative group rounded-xl border transition-all duration-300 overflow-hidden",
                                isTopPriority
                                    ? "bg-gradient-to-r from-white/5 to-transparent border-white/10 shadow-lg shadow-black/50"
                                    : "bg-surface border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                            )}>
                                {isTopPriority && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                                )}

                                <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                                    {/* Rank Indicator */}
                                    <div className="flex-shrink-0">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border",
                                            isTopPriority
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-900/10"
                                                : "bg-gray-800 text-gray-500 border-gray-700"
                                        )}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 text-center md:text-left grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center">

                                        {/* Debt Info */}
                                        <div className="col-span-1">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                <h4 className={clsx("font-bold text-lg truncate", isTopPriority ? "text-white" : "text-gray-300")}>
                                                    {item.name}
                                                </h4>
                                                {isTopPriority && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-emerald-500/20">Focus</span>}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-3">
                                                <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> ${item.currentBalance.toLocaleString()}</span>
                                                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                                <span className={clsx(item.rate > 10 ? "text-amber-500" : "text-gray-400")}>{item.rate}% APR</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar (Visual Only for now based on some heuristic or just balance relative to max?) */}
                                        {/* Since we don't have 'original balance', we can't show true progress. We'll show Payoff Timeline instead. */}
                                        <div className="col-span-1 flex flex-col items-center">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Allocated Payment</span>
                                            <div className="text-2xl font-bold text-white flex items-center gap-2">
                                                ${allocation.totalPay.toLocaleString()}
                                                {allocation.extraPay > 0 && (
                                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                        +${allocation.extraPay}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="col-span-1 md:text-right flex flex-col items-center md:items-end">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Payoff In</span>
                                            <div className="flex items-center gap-2 text-white font-medium">
                                                <Calendar className="w-4 h-4 text-gray-600" />
                                                {isFinite(allocation.monthsToPayoff) ? (
                                                    <span>{Math.ceil(allocation.monthsToPayoff)} months</span>
                                                ) : (
                                                    <span className="text-rose-400">Never</span>
                                                )}
                                            </div>
                                            {isFinite(allocation.monthsToPayoff) && allocation.monthsToPayoff > 0 && (
                                                <span className="text-xs text-gray-600 mt-1">
                                                    Est. {new Date(new Date().setMonth(new Date().getMonth() + allocation.monthsToPayoff)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
            </div>
        </PageContainer>
    );
}

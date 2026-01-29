import React, { useState, useMemo } from "react";
import { Calculator, Calendar, TrendingDown, CheckCircle, Flag, DollarSign, ArrowRight, Wallet } from "lucide-react";
import clsx from "clsx";
import { generatePayoffAllocation, calculateEffectiveRateState, calculateInterestProjections } from "../utils/PayoffEngine";
import InterestRiskPanel from "./InterestRiskPanel";

export default function PayoffPlanView({ debts, advancedSettings }) {
    const [surplusCash, setSurplusCash] = useState(500); // Default surplus
    const [horizonDays, setHorizonDays] = useState(90);  // Lookahead window

    // Generate Smart Plan
    const allocationPlan = useMemo(() => {
        return generatePayoffAllocation(debts, surplusCash, horizonDays);
    }, [debts, surplusCash, horizonDays]);

    const totalMonthlyCommitment = allocationPlan.reduce((acc, d) => acc + d.allocation.totalPay, 0);

    return (
        <div className="space-y-8 pb-12">

            {/* Strategy Configuration */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-indigo-400" />
                            Smart Payoff Strategy
                        </h2>
                        <p className="text-gray-400 mt-1 max-w-lg text-sm">
                            Our engine analyzes your rates, upcoming expiry dates, and debt types to recommend the optimal payoff order.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="bg-gray-800/50 p-3 rounded-xl border border-white/10 flex-1 min-w-[200px]">
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Monthly Surplus Checks</label>
                            <div className="flex items-center mt-2 group">
                                <span className="text-gray-500 mr-2 group-focus-within:text-emerald-400 transition-colors">$</span>
                                <input
                                    type="number"
                                    value={surplusCash}
                                    onChange={(e) => setSurplusCash(Number(e.target.value))}
                                    className="bg-transparent text-xl font-bold w-full focus:outline-none text-emerald-400 placeholder-gray-600"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-gray-500">Total Monthly Payment</span>
                            <span className="text-xl font-bold text-white">${totalMonthlyCommitment.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-indigo-500/20 px-3 py-1 rounded text-indigo-300 border border-indigo-500/30 text-xs font-medium">
                        Optimized for Rate Hikes
                    </div>
                </div>
            </div>

            {/* What-If Simulator (Advanced Feature) */}
            {advancedSettings?.interestCostSimulator && (
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-purple-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-purple-500 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>

                    <div className="relative z-10">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
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
                                    <span className="font-mono font-bold text-xl min-w-[80px] text-right">${surplusCash}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Adjusting this slider updates your payoff timeline in real-time.
                                </p>
                            </div>

                            <div className="bg-white/10 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-gray-300 text-sm">Projected Total Interest</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        ${allocationPlan.reduce((acc, item) => acc + (item.allocation.totalInterest || 0), 0).toLocaleString()}
                                        <span className="text-xs font-normal text-gray-400 ml-1">(Estimated)</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-300 text-sm">Debt Free By</p>
                                    <p className="text-xl font-bold text-emerald-400 mt-1">
                                        {new Date(new Date().setMonth(new Date().getMonth() + Math.max(...allocationPlan.map(i => i.allocation.monthsToPayoff)))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <InterestRiskPanel
                {...calculateInterestProjections(debts)}
            />

            {/* Smart Allocation List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Flag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Recommended Priority Order (Next 90 Days)
                </h3>

                {allocationPlan.map((item, index) => {
                    const isTopPriority = index === 0;
                    const { allocation, priorityScore, riskAdjustedRatePct } = item;
                    const { rateIsSwitched, highCostDebtFlag } = calculateEffectiveRateState(item);

                    return (
                        <div key={item.id} className={clsx("rounded-xl border p-5 transition-all relative overflow-hidden",
                            isTopPriority
                                ? "bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100 dark:bg-gray-800 dark:border-indigo-900 dark:ring-indigo-900/50"
                                : "bg-white border-gray-100 shadow-sm opacity-90 hover:opacity-100 dark:bg-gray-800 dark:border-gray-700"
                        )}>
                            {isTopPriority && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                    #1 PRIORITY
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                {/* Rank */}
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-xl font-bold text-gray-400 border border-gray-100 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600">
                                    {index + 1}
                                </div>

                                {/* Debt Details */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h4>
                                        {rateIsSwitched && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold dark:bg-red-900/40 dark:text-red-300">REVERTED</span>}
                                        {highCostDebtFlag && !rateIsSwitched && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold dark:bg-orange-900/40 dark:text-orange-300">HIGH COST</span>}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>Current Bal: <span className="font-medium text-gray-900 dark:text-gray-200">${item.currentBalance.toLocaleString()}</span></span>
                                        <span className="hidden md:inline text-gray-300">•</span>
                                        <span className={clsx(riskAdjustedRatePct > 15 ? "text-orange-600 font-bold dark:text-orange-400" : "")}>
                                            Risk Rate: {riskAdjustedRatePct}%
                                        </span>
                                    </div>
                                </div>

                                {/* Allocation Plan */}
                                <div className="w-full md:w-auto flex flex-col gap-2 min-w-[200px]">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Min Payment</span>
                                        <span className="font-medium dark:text-gray-200">${allocation.minPay.toLocaleString()}</span>
                                    </div>
                                    {allocation.extraPay > 0 && (
                                        <div className="flex justify-between items-center text-sm bg-emerald-50 p-1.5 rounded text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                            <span className="flex items-center gap-1 font-bold"><ArrowRight className="w-3 h-3" /> Extra Allocation</span>
                                            <span className="font-bold">+${allocation.extraPay.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-100 mt-1 pt-1 flex justify-between items-center dark:border-gray-700">
                                        <span className="text-xs font-semibold text-gray-400">Total Monthly</span>
                                        <span className="font-bold text-gray-900 dark:text-white">${allocation.totalPay.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Projections based on this plan */}
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                <div>
                                    Priority Score: {Math.round(item.priorityScore)} (Rate: {Math.round(item.components.rateScore)} / Time: {Math.round(item.components.timeScore)})
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>Est. Payoff:</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        {allocation.monthsToPayoff > 120 ? "> 10 Years" : `${allocation.monthsToPayoff} months`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {debts.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Debt Free!</h3>
                        <p className="text-gray-500 dark:text-gray-400">You have no active debts. Time to build wealth!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

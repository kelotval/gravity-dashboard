import React from "react";
import { DollarSign, TrendingUp, AlertTriangle, ArrowRight, PiggyBank, Clock } from "lucide-react";
import clsx from "clsx";
import Tooltip from "./Tooltip";

export default function InterestRiskPanel({ projections, savingsOpportunities, worstOffender }) {
    if (!projections) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 1. Projected Waste */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Projected Waste</h3>
                        <Tooltip content="Total interest you will pay over the next 12 months if only minimum payments are made.">
                            <DollarSign className="w-4 h-4 text-gray-400 ml-1 cursor-help" />
                        </Tooltip>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Estimated interest cost if you only pay minimums.</p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Next 12 Months</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${projections.months12.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-2">
                        <div>3 Mo: <span className="text-gray-600 font-semibold dark:text-gray-300">${projections.months3.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                        <div className="text-right">6 Mo: <span className="text-gray-600 font-semibold dark:text-gray-300">${projections.months6.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                    </div>
                </div>
            </div>

            {/* 2. Worst Offender */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Cost of Delay</h3>
                        <Tooltip content="The amount of interest accruing every single day you carry this debt.">
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-1 cursor-help" />
                        </Tooltip>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">The single most expensive debt to hold onto right now.</p>
                </div>

                {worstOffender ? (
                    <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-orange-900 dark:text-orange-300">{worstOffender.name}</h4>
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                                ${worstOffender.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm text-orange-600/80 dark:text-orange-400/80">/ month</span>
                        </div>
                        <p className="text-xs text-orange-600 mt-2 dark:text-orange-400/70">
                            Extra cost incurred purely by interest rates.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                        No significant outliers found.
                    </div>
                )}
            </div>

            {/* 3. Savings Opportunity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
                            <PiggyBank className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Savings Ops</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Avoid future rate hikes by paying these off early.</p>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[140px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
                    {savingsOpportunities.length > 0 ? (
                        savingsOpportunities.map((op, i) => (
                            <div key={op.id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{op.name}</p>
                                        <p className="text-[10px] text-gray-500">Save ${Math.round(op.monthly)}/mo</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    ${op.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                            No immediate rate hikes detected.
                        </div>
                    )}
                </div>
                {savingsOpportunities.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-center text-emerald-600 font-medium cursor-pointer hover:text-emerald-700 dark:border-gray-700 dark:text-emerald-400">
                        View details in Payoff Plan <ArrowRight className="w-3 h-3 inline ml-1" />
                    </div>
                )}
            </div>
        </div>
    );
}

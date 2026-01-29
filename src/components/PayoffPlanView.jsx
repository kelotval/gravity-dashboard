import React, { useEffect, useState } from "react";
import { Calculator, Calendar, TrendingDown, CheckCircle, Flag } from "lucide-react";
import clsx from "clsx";

export default function PayoffPlanView({ debts }) {

    // Helper to calculate payoff date
    const getPayoffDate = (balance, monthly) => {
        if (monthly <= 0) return "Never";
        const months = Math.ceil(balance / monthly);
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getMonthsRemaining = (balance, monthly) => {
        if (monthly <= 0) return 999;
        return Math.ceil(balance / monthly);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Debt Payoff Plan</h2>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                    {debts.length} Active Debts
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {debts.map((debt, index) => {
                    const original = debt.originalBalance || (debt.currentBalance * 1.2); // Fallback
                    const current = debt.currentBalance;
                    const paid = original - current;
                    const progress = Math.min(100, Math.max(0, (paid / original) * 100));
                    const monthsLeft = getMonthsRemaining(current, debt.monthlyRepayment);
                    const payoffDate = getPayoffDate(current, debt.monthlyRepayment);

                    // Delay animation staggered by index
                    const [animatedProgress, setAnimatedProgress] = useState(0);
                    useEffect(() => {
                        const t = setTimeout(() => setAnimatedProgress(progress), 100 + (index * 150));
                        return () => clearTimeout(t);
                    }, [progress, index]);

                    return (
                        <div key={debt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-md">

                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("p-3 rounded-xl",
                                        debt.accent === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                            debt.accent === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                    )}>
                                        <TrendingDown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{debt.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> due monthly</span>
                                            <span>•</span>
                                            <span>{debt.note || "Standard Rate"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Payoff Goal</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Flag className="w-4 h-4 text-emerald-500" />
                                        {payoffDate}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Timeline */}
                            <div className="relative pt-6 pb-2">
                                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide dark:text-gray-400">
                                    <span>Start</span>
                                    <span>Progress</span>
                                    <span>Freedom</span>
                                </div>

                                {/* Bar Container */}
                                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative dark:bg-gray-700">
                                    {/* Animated Progress Bar */}
                                    <div
                                        className={clsx("h-full rounded-full transition-all duration-1000 ease-out relative",
                                            debt.accent === 'red' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                                debt.accent === 'orange' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                                    'bg-gradient-to-r from-blue-400 to-blue-600'
                                        )}
                                        style={{ width: `${animatedProgress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                    </div>

                                    {/* Milestone markers (simple dots) */}
                                    {[25, 50, 75].map(m => (
                                        <div key={m} className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10" style={{ left: `${m}%` }}></div>
                                    ))}
                                </div>

                                {/* Labels below bar */}
                                <div className="flex justify-between mt-3 text-sm font-medium">
                                    <div className="text-gray-400 dark:text-gray-500">${original.toLocaleString()}</div>
                                    <div className="text-gray-900 dark:text-white flex flex-col items-center">
                                        <span>${current.toLocaleString()} remaining</span>
                                        <span className={clsx("text-xs font-bold",
                                            debt.accent === 'red' ? 'text-red-600' :
                                                debt.accent === 'orange' ? 'text-orange-600' : 'text-blue-600'
                                        )}>
                                            {Math.round(progress)}% Paid
                                        </span>
                                    </div>
                                    <div className="text-emerald-600 dark:text-emerald-400">$0</div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {debts.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Debt Free!</h3>
                        <p className="text-gray-500 dark:text-gray-400">You have no active debts. Great job!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

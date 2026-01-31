import React, { useMemo, useState } from "react";
import { CreditCard, TrendingDown, Zap, Info, Calendar, DollarSign, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SubscriptionIntelligence({ transactions = [], debts = [], income = {} }) {
    // State for toggled (canceled) subscriptions
    const [canceledSubs, setCanceledSubs] = useState(new Set());

    // Identify and analyze subscriptions
    const subscriptions = useMemo(() => {
        const subTransactions = transactions.filter(tx => tx.category === "Subscriptions");

        // Group by merchant
        const grouped = subTransactions.reduce((acc, tx) => {
            const merchant = tx.description || "Unknown";
            if (!acc[merchant]) {
                acc[merchant] = [];
            }
            acc[merchant].push(tx);
            return acc;
        }, {});

        // Calculate metrics for each subscription
        return Object.entries(grouped).map(([merchant, txs]) => {
            const totalSpent = txs.reduce((sum, tx) => sum + tx.amount, 0);
            const avgMonthly = totalSpent / Math.max(1, txs.length);
            const annualCost = avgMonthly * 12;

            // Find most recent transaction
            const sortedTxs = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastUsed = sortedTxs[0]?.date;

            // Determine usage frequency (transactions per month)
            const uniqueMonths = new Set(txs.map(tx => {
                const d = new Date(tx.date);
                return `${d.getFullYear()}-${d.getMonth()}`;
            })).size;

            const frequency = uniqueMonths > 0 ? txs.length / uniqueMonths : 0;

            return {
                merchant,
                monthlyAvg: avgMonthly,
                annualCost,
                lastUsed,
                transactionCount: txs.length,
                frequency, // Transactions per month
                isLeastUsed: frequency < 1 // Less than monthly
            };
        }).sort((a, b) => a.frequency - b.frequency); // Sort by least used first
    }, [transactions]);

    // Calculate current baseline metrics
    const baselineMetrics = useMemo(() => {
        const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
        const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
        const totalDebtPayments = debts.reduce((acc, d) => acc + (d.monthlyRepayment || 0), 0);
        const monthlySurplus = fullIncome - totalExpenses - totalDebtPayments;

        // Calculate debt-free date
        const maxMonths = debts.length > 0
            ? Math.max(...debts.map(d => {
                const payment = d.monthlyRepayment || 0;
                return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
            }))
            : 0;

        const debtFreeDate = new Date();
        debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

        // Calculate total interest
        const totalInterest = debts.reduce((acc, d) => {
            if (!d.monthlyRepayment || !d.currentBalance) return acc;
            const months = d.monthlyRepayment > 0 ? Math.ceil(d.currentBalance / d.monthlyRepayment) : 0;
            if (months === 0 || months > 999) return acc;
            const totalPaid = d.monthlyRepayment * months;
            const interest = Math.max(0, totalPaid - d.currentBalance);
            return acc + (isNaN(interest) ? 0 : interest);
        }, 0);

        return {
            monthlySurplus,
            monthsToDebtFree: maxMonths < 999 ? maxMonths : null,
            debtFreeDate: maxMonths < 999 ? debtFreeDate : null,
            totalInterest: Math.round(totalInterest)
        };
    }, [income, transactions, debts]);

    // Calculate simulated metrics with canceled subscriptions
    const simulatedMetrics = useMemo(() => {
        const canceledAmount = subscriptions
            .filter(sub => canceledSubs.has(sub.merchant))
            .reduce((sum, sub) => sum + sub.monthlyAvg, 0);

        const newSurplus = baselineMetrics.monthlySurplus + canceledAmount;

        // Recalculate debt payoff with extra surplus applied to debts
        const extraPaymentPerDebt = canceledAmount / Math.max(1, debts.length);

        const adjustedDebts = debts.map(d => ({
            ...d,
            monthlyRepayment: (d.monthlyRepayment || 0) + extraPaymentPerDebt
        }));

        const maxMonths = adjustedDebts.length > 0
            ? Math.max(...adjustedDebts.map(d => {
                const payment = d.monthlyRepayment || 0;
                return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
            }))
            : 0;

        const debtFreeDate = new Date();
        debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

        // Calculate interest with accelerated payments
        const totalInterest = adjustedDebts.reduce((acc, d) => {
            if (!d.monthlyRepayment || !d.currentBalance || !d.interestRate) return acc;
            const months = d.monthlyRepayment > 0 ? Math.ceil(d.currentBalance / d.monthlyRepayment) : 0;
            if (months === 0 || months > 999) return acc;
            const monthlyInterest = (d.currentBalance * d.interestRate / 100) / 12;
            const interest = monthlyInterest * months;
            return acc + (isNaN(interest) ? 0 : interest);
        }, 0);

        return {
            monthlySurplus: newSurplus,
            monthsToDebtFree: maxMonths < 999 ? maxMonths : null,
            debtFreeDate: maxMonths < 999 ? debtFreeDate : null,
            totalInterest: Math.round(totalInterest),
            savedFromCancellations: canceledAmount
        };
    }, [subscriptions, canceledSubs, baselineMetrics, debts]);

    // Toggle subscription cancellation
    const toggleSubscription = (merchant) => {
        setCanceledSubs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(merchant)) {
                newSet.delete(merchant);
            } else {
                newSet.add(merchant);
            }
            return newSet;
        });
    };

    // Calculate summary statistics
    const totalMonthlySpend = subscriptions.reduce((sum, sub) => sum + sub.monthlyAvg, 0);
    const totalAnnualSpend = subscriptions.reduce((sum, sub) => sum + sub.annualCost, 0);
    const leastUsedCount = subscriptions.filter(sub => sub.isLeastUsed).length;
    const canceledCount = canceledSubs.size;

    // Calculate diffs
    const surplusDiff = simulatedMetrics.monthlySurplus - baselineMetrics.monthlySurplus;
    const monthsDiff = (baselineMetrics.monthsToDebtFree || 0) - (simulatedMetrics.monthsToDebtFree || 0);
    const interestSaved = baselineMetrics.totalInterest - simulatedMetrics.totalInterest;
    const annualSavings = surplusDiff * 12;

    if (subscriptions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center dark:bg-gray-800 dark:border-gray-700">
                        <div className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6 dark:from-blue-900/40 dark:to-purple-900/40">
                            <CreditCard className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            No Subscriptions Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                            Categorize recurring payments as "Subscriptions" to analyze them here
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Discover hidden costs, identify waste, and optimize your spending!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-1">Subscription Intelligence</h1>
                                <p className="text-blue-100 text-lg">
                                    Uncover hidden costs, cancel waste, maximize savings
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Active Subs</div>
                                <div className="text-3xl font-bold">{subscriptions.length}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Monthly Total</div>
                                <div className="text-3xl font-bold">${totalMonthlySpend.toFixed(0)}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Least Used</div>
                                <div className="text-3xl font-bold">{leastUsedCount}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Simulated Cancels</div>
                                <div className="text-3xl font-bold">{canceledCount}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Impact Preview - Always Visible */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 dark:bg-gray-800/80 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-6">
                        <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Financial Impact Preview
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Monthly Surplus */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl transform hover:scale-105 transition-transform group relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Monthly Surplus</div>
                                <div className="relative">
                                    <Info className="w-4 h-4 text-white/60 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        Extra cash available each month after expenses and debt payments
                                    </div>
                                </div>
                            </div>
                            <div className="text-4xl font-bold mb-2">
                                ${Math.round(simulatedMetrics.monthlySurplus).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 text-emerald-100 text-sm font-bold">
                                {surplusDiff > 0 ? (
                                    <>
                                        <span>↑</span>
                                        <span>+${Math.round(surplusDiff).toLocaleString()}/mo</span>
                                    </>
                                ) : (
                                    <span>Cancel subscriptions to see impact</span>
                                )}
                            </div>
                        </div>

                        {/* Debt-Free Acceleration */}
                        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-xl transform hover:scale-105 transition-transform group relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Debt-Free</div>
                                <div className="relative">
                                    <Info className="w-4 h-4 text-white/60 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        How much sooner you'll be debt-free by redirecting savings to debt
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold mb-2">
                                {simulatedMetrics.debtFreeDate ? simulatedMetrics.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            </div>
                            <div className="flex items-center gap-1 text-purple-100 text-sm font-bold">
                                {monthsDiff > 0 && (
                                    <>
                                        <span>↑</span>
                                        <span>{monthsDiff} months sooner</span>
                                    </>
                                )}
                                {monthsDiff === 0 && <span>No change</span>}
                            </div>
                        </div>

                        {/* Total Wealth Impact */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-xl transform hover:scale-105 transition-transform group relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Total Wealth Impact</div>
                                <div className="relative">
                                    <Info className="w-4 h-4 text-white/60 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        Combined benefit: direct subscription savings over payoff period + interest saved from faster debt reduction
                                    </div>
                                </div>
                            </div>
                            <div className="text-4xl font-bold mb-2">
                                ${canceledCount > 0 ? (((annualSavings * Math.max(1, (baselineMetrics.monthsToDebtFree || 12) / 12)) + interestSaved) / 1000).toFixed(1) : '0.0'}K
                            </div>
                            <div className="text-orange-100 text-sm font-bold">
                                {canceledCount > 0 ? `${((interestSaved || 0) / 1000).toFixed(1)}K interest + ${((annualSavings * Math.max(1, (baselineMetrics.monthsToDebtFree || 12) / 12)) / 1000).toFixed(1)}K savings` : 'Select subscriptions to see impact'}
                            </div>
                        </div>

                        {/* Annual Savings */}
                        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-xl transform hover:scale-105 transition-transform group relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Annual Savings</div>
                                <div className="relative">
                                    <Info className="w-4 h-4 text-white/60 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        Total amount saved per year from canceled subscriptions
                                    </div>
                                </div>
                            </div>
                            <div className="text-4xl font-bold mb-2">
                                ${Math.round(annualSavings).toLocaleString()}
                            </div>
                            <div className="text-blue-100 text-sm font-bold">
                                Per year
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 dark:bg-gray-800/80 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <TrendingDown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Your Subscriptions
                            </h2>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Click to simulate cancellation
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {subscriptions.map((sub) => {
                            const isCanceled = canceledSubs.has(sub.merchant);
                            const isLeastUsed = sub.isLeastUsed;

                            return (
                                <button
                                    key={sub.merchant}
                                    onClick={() => toggleSubscription(sub.merchant)}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left transform hover:scale-105 hover:shadow-xl ${isCanceled
                                        ? 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 opacity-75 scale-95'
                                        : isLeastUsed
                                            ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 shadow-md'
                                            : 'border-gray-200 dark:border-gray-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-700/50 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {sub.merchant}
                                                </span>
                                                {isLeastUsed && !isCanceled && (
                                                    <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow animate-pulse">
                                                        🔔 LEAST USED
                                                    </span>
                                                )}
                                                {isCanceled && (
                                                    <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-lg shadow">
                                                        ✗ CANCELED
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Last: {new Date(sub.lastUsed).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>{sub.transactionCount} charge{sub.transactionCount !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                ${sub.monthlyAvg.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">per month</div>
                                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                                                ${Math.round(sub.annualCost).toLocaleString()}/year
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 text-sm font-medium pt-3 border-t ${isCanceled
                                        ? 'border-red-200 dark:border-red-700 text-red-700 dark:text-red-400'
                                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {isCanceled ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Click to restore subscription</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Click to simulate cancellation</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Total Monthly Spend</div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    ${totalMonthlySpend.toFixed(2)}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Total Annual Cost</div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    ${Math.round(totalAnnualSpend).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

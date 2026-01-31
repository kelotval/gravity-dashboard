import React, { useState, useMemo } from "react";
import { Wallet, Car, AlertCircle, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { getRateWarnings, calculatePayoffStrategy, getCurrentRate, deriveDebtStatus, calculateEffectiveRateState } from "../utils/PayoffEngine";
import kiaImage from "../assets/kia_sportage.png";
import Tooltip from "./Tooltip";

export default function ActiveLiabilities({ debts, onUpdateDebts, advancedSettings }) {
    const [strategy, setStrategy] = useState('AVALANCHE'); // AVALANCHE or SNOWBALL

    // 1. Calculations
    const totalDebt = debts.reduce((acc, debt) => acc + debt.currentBalance, 0);
    const totalMonthly = debts.reduce((acc, debt) => acc + debt.monthlyRepayment, 0);

    // 2. Strategy Engine
    const sortedDebts = useMemo(() => calculatePayoffStrategy(debts, strategy), [debts, strategy]);
    const topPriority = sortedDebts.length > 0 ? sortedDebts[0] : null;

    // 3. Warnings
    const warnings = useMemo(() => getRateWarnings(debts), [debts]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Liabilities</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage your debt repayments and loan tracking.</p>
                </div>

                {/* Strategy Selector */}
                <div className="bg-white p-1.5 rounded-lg border border-gray-200 flex dark:bg-gray-800 dark:border-gray-700">
                    <Tooltip content="Focuses on paying off highest interest rate debts first. Mathematically saves the most money.">
                        <button
                            onClick={() => setStrategy('AVALANCHE')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${strategy === 'AVALANCHE' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                        >
                            Avalanche (Save Interest)
                        </button>
                    </Tooltip>
                    <Tooltip content="Focuses on paying off smallest balances first. Builds psychological momentum quickly.">
                        <button
                            onClick={() => setStrategy('SNOWBALL')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${strategy === 'SNOWBALL' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                        >
                            Snowball (Fast Wins)
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Smart Recommendations Engine */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Priority Action */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium border border-white/20">Recommendation</span>
                                {warnings.length > 0 && (
                                    <span className="bg-red-500/80 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Rate Hike Risk
                                    </span>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold mb-1">
                                {topPriority ? `Focus on ${topPriority.name}` : "Debt Free!"}
                            </h3>
                            <p className="text-indigo-100 max-w-lg">
                                {strategy === 'AVALANCHE'
                                    ? `Paying this ${getCurrentRate(topPriority)}% debt first saves you the most money in long-term interest.`
                                    : `Clearing this balance ($${topPriority?.currentBalance.toLocaleString()}) gives you a quick win and frees up cash flow.`}
                            </p>
                        </div>

                        {topPriority && (
                            <div className="mt-6 flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                                    <p className="text-xs text-indigo-200 uppercase tracking-wider">Current Rate</p>
                                    <p className="font-bold text-lg">{getCurrentRate(topPriority)}%</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                                    <p className="text-xs text-indigo-200 uppercase tracking-wider">Target Payoff</p>
                                    <p className="font-bold text-lg">+ $250/mo</p>
                                </div>
                            </div>
                        )}

                        {/* AI Insight Card (Advanced Feature) */}
                        {advancedSettings?.aiInsights && topPriority && (
                            <div className="mt-4 bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-lg backdrop-blur-md relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                                <h4 className="flex items-center gap-2 text-indigo-200 font-bold text-sm mb-2 uppercase tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                    AI Analysis
                                </h4>
                                <p className="text-sm text-indigo-100/90 leading-relaxed">
                                    My algorithms selected <strong>{topPriority.name}</strong> as your primary target because its
                                    <strong className="text-white"> {getCurrentRate(topPriority)}% rate</strong> generates the highest daily interest cost relative to its balance.
                                    {topPriority.promoEndDate && <span> Note: Pending rate hike detected on <strong>{new Date(topPriority.promoEndDate).toLocaleDateString()}</strong>.</span>}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Warnings / Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        Alerts & Signals
                    </h4>

                    <div className="flex-1 overflow-y-auto space-y-3">
                        {warnings.map((warn, i) => (
                            <div key={i} className="bg-red-50 p-3 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-800">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1 dark:text-red-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{warn.debtName}</p>
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{warn.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {warnings.length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <p>No immediate risks detected.</p>
                                <p className="text-xs mt-1">Great job managing your rates!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Active Debt</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2 dark:text-white">${totalDebt.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                        <Wallet className="w-8 h-8" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Monthly Repayments</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2 dark:text-white">${totalMonthly.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Debt Cards Grid */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Credit Cards & Loans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debts.map((debt) => {
                    const currentRate = getCurrentRate(debt);
                    const isPriority = topPriority && topPriority.id === debt.id;
                    const { statusChip, statusLevel } = deriveDebtStatus(debt);
                    const { effectiveRatePct, rateIsSwitched, highCostDebtFlag } = calculateEffectiveRateState(debt);
                    const { payoffPriorityHint, strategyHint, riskFlag } = debt;

                    // Generate chart data
                    const chartData = [
                        { name: "Start", value: debt.originalBalance || debt.currentBalance * 1.5 },
                        { name: "Now", value: debt.currentBalance },
                        { name: "Zero", value: 0 },
                    ];

                    const color = debt.accent === 'red' ? '#ef4444' : debt.accent === 'orange' ? '#f97316' : '#3b82f6';
                    const gradientId = `color-${debt.id}`;

                    return (
                        <div key={debt.id} className={`bg-white rounded-xl shadow-sm border ${isPriority ? 'border-indigo-300 ring-2 ring-indigo-100 dark:ring-indigo-900' : 'border-gray-100'} overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700 transition-all duration-300`}>
                            <div className={`h-1 w-full ${debt.accent === 'red' ? 'bg-red-500' :
                                debt.accent === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                                }`} />
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{debt.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                                {debt.dueLabel}
                                            </span>
                                            {isPriority && (
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <ArrowRight className="w-3 h-3" /> Priority
                                                </span>
                                            )}
                                            {statusLevel !== 'none' && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1
                                                    ${statusLevel === 'critical'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                        : statusLevel === 'high'
                                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                                            : statusLevel === 'medium'
                                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                                                                : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                    }
                                                `}>
                                                    {statusChip}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="h-24 -mx-4 opacity-75">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <RechartsTooltip />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={color}
                                                    fillOpacity={1}
                                                    fill={`url(#${gradientId})`}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="flex justify-between text-sm mb-1 mt-2">
                                        <span className="text-gray-500 dark:text-gray-400">Current Balance</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">${debt.currentBalance.toLocaleString()}</span>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700/50 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Payment</span>
                                            <span className="font-bold text-gray-900 dark:text-white">${debt.monthlyRepayment.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                            <div className="flex flex-col">
                                                <Tooltip content="The true cost of the loan including fees, compounding frequency, and introductory rates.">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 border-b border-dotted border-gray-400 cursor-help">Effective Rate</span>
                                                </Tooltip>
                                                {rateIsSwitched && (
                                                    <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                                                        Revert rate active
                                                    </span>
                                                )}
                                                {riskFlag && !rateIsSwitched && (
                                                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                                                        {riskFlag}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <span className={`text-xs font-bold ${highCostDebtFlag ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {effectiveRatePct}%
                                                </span>
                                                {highCostDebtFlag && (
                                                    <div className="text-[10px] text-red-500 font-medium">High Cost Debt</div>
                                                )}
                                                {payoffPriorityHint && (
                                                    <div className="text-[10px] text-red-600 font-bold bg-red-50 px-1 rounded mt-0.5 dark:bg-red-900/30">
                                                        Priority: {payoffPriorityHint}
                                                    </div>
                                                )}
                                                {strategyHint && (
                                                    <div className="text-[10px] text-blue-600 font-medium mt-0.5 dark:text-blue-400">
                                                        {strategyHint}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {debt.note && (
                                        <p className="text-xs text-gray-400 italic pt-2">
                                            "{debt.note}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Vehicle Section */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Assets</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-3 dark:bg-gray-800 dark:border-gray-700">
                <div className="lg:col-span-1 bg-gray-100 relative h-64 lg:h-auto">
                    <img
                        src={kiaImage}
                        alt="Kia Sportage"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
                <div className="p-8 lg:col-span-2 flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                        <Car className="w-6 h-6 text-blue-600 mr-2" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Kia Sportage 2024</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loan Balance</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">$35,000.00</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Repayment</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">$1,475.00</p>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start dark:bg-green-900/20 dark:border-green-800">
                        <AlertCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5 dark:text-green-400" />
                        <div>
                            <h5 className="font-semibold text-green-800 text-sm dark:text-green-300">Green Slip (CTP) Status: Active</h5>
                            <p className="text-sm text-green-700 mt-1 dark:text-green-400">
                                Compulsory Third Party insurance covers personal injury liability in NSW. Ensure renewal by registration due date.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

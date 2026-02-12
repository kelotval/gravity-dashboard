import React, { useState, useMemo } from "react";
import { Wallet, Car, AlertCircle, TrendingUp, AlertTriangle, ArrowRight, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { getRateWarnings, calculatePayoffStrategy, getCurrentRate, deriveDebtStatus, calculateEffectiveRateState } from "../utils/PayoffEngine";
import kiaImage from "../assets/kia_sportage.png";
import Tooltip from "./Tooltip";
import { PageContainer } from "./common/PageContainer";
import { GlassCard } from "./common/GlassCard";

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

    const StrategySelector = (
        <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex">
            <Tooltip content="Focuses on paying off highest interest rate debts first. Mathematically saves the most money.">
                <button
                    onClick={() => setStrategy('AVALANCHE')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${strategy === 'AVALANCHE' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Avalanche (Save Interest)
                </button>
            </Tooltip>
            <Tooltip content="Focuses on paying off smallest balances first. Builds psychological momentum quickly.">
                <button
                    onClick={() => setStrategy('SNOWBALL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${strategy === 'SNOWBALL' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Snowball (Fast Wins)
                </button>
            </Tooltip>
        </div>
    );

    return (
        <PageContainer
            title="Active Liabilities"
            subtitle="Manage your debt repayments and loan tracking"
            action={StrategySelector}
        >

            {/* Smart Recommendations Engine */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Priority Action */}
                <GlassCard className="lg:col-span-2 !p-0 relative overflow-hidden group border-indigo-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/10 text-indigo-200 px-2 py-0.5 rounded text-xs font-medium border border-white/10 backdrop-blur-sm">Recommendation</span>
                                {warnings.length > 0 && (
                                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Rate Hike Risk
                                    </span>
                                )}
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">
                                {topPriority ? `Focus on ${topPriority.name}` : "Debt Free!"}
                            </h3>
                            <p className="text-indigo-200 max-w-lg">
                                {strategy === 'AVALANCHE'
                                    ? `Paying this ${getCurrentRate(topPriority)}% debt first saves you the most money in long-term interest.`
                                    : `Clearing this balance ($${topPriority?.currentBalance.toLocaleString()}) gives you a quick win and frees up cash flow.`}
                            </p>
                        </div>

                        {topPriority && (
                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <div className="bg-black/20 p-4 rounded-xl backdrop-blur-md border border-white/5">
                                    <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Current Rate</p>
                                    <p className="font-bold text-2xl text-white">{getCurrentRate(topPriority)}%</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl backdrop-blur-md border border-white/5">
                                    <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Target Payoff</p>
                                    <p className="font-bold text-2xl text-white">+ $250/mo</p>
                                </div>
                            </div>
                        )}

                        {/* AI Insight Card (Advanced Feature) */}
                        {advancedSettings?.aiInsights && topPriority && (
                            <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                                <h4 className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-2 uppercase tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                    AI Analysis
                                </h4>
                                <p className="text-sm text-indigo-100/80 leading-relaxed">
                                    My algorithms selected <strong>{topPriority.name}</strong> as your primary target because its
                                    <strong className="text-white"> {getCurrentRate(topPriority)}% rate</strong> generates the highest daily interest cost relative to its balance.
                                    {topPriority.promoEndDate && <span> Note: Pending rate hike detected on <strong>{new Date(topPriority.promoEndDate).toLocaleDateString()}</strong>.</span>}
                                </p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* 2. Warnings / Stats */}
                <GlassCard className="flex flex-col gap-4">
                    <h4 className="font-bold text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        Alerts & Signals
                    </h4>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                        {warnings.map((alert, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                                alert.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/20' :
                                    'bg-blue-500/10 border-blue-500/20'
                                }`}>
                                <div className="flex items-start gap-3">
                                    {alert.severity === 'critical' ? (
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                                    ) : alert.severity === 'warning' ? (
                                        <AlertCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                                    ) : (
                                        <Info className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h5 className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${alert.severity === 'critical' ? 'text-red-400' :
                                                alert.severity === 'warning' ? 'text-orange-400' :
                                                    'text-blue-400'
                                                }`}>
                                                {alert.label}
                                            </h5>
                                            {alert.timeframe && (
                                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono font-medium text-gray-400">
                                                    {alert.timeframe}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm font-semibold text-gray-200 mb-1">{alert.debtName}</p>
                                        <p className="text-xs text-gray-400 leading-snug">{alert.message}</p>

                                        {(alert.action || alert.impact) && (
                                            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                                                {alert.action && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300">
                                                        {alert.action}
                                                    </span>
                                                )}
                                                {alert.impact && (
                                                    <span className="text-[10px] font-mono font-bold text-red-400">
                                                        {alert.impact}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {warnings.length === 0 && (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                                <p>No immediate risks detected.</p>
                                <p className="text-xs mt-1">Great job managing your rates!</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Active Debt</p>
                        <h3 className="text-3xl font-bold text-white mt-2">${totalDebt.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                        <Wallet className="w-8 h-8" />
                    </div>
                </GlassCard>
                <GlassCard className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Monthly Repayments</p>
                        <h3 className="text-3xl font-bold text-white mt-2">${totalMonthly.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </GlassCard>
            </div>

            {/* Debt Cards Grid */}
            <div>
                <h3 className="text-xl font-bold text-white mb-6 pl-1">Credit Cards & Loans</h3>
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
                            <GlassCard key={debt.id} className={`!p-0 overflow-hidden flex flex-col transition-all duration-300 ${isPriority ? 'ring-2 ring-indigo-500/50' : ''}`}>
                                <div className={`h-1 w-full ${debt.accent === 'red' ? 'bg-red-500' :
                                    debt.accent === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{debt.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-white/5">
                                                    {debt.dueLabel}
                                                </span>
                                                {isPriority && (
                                                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded flex items-center gap-1 border border-indigo-500/30">
                                                        <ArrowRight className="w-3 h-3" /> Priority
                                                    </span>
                                                )}
                                                {statusLevel !== 'none' && (
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 border
                                                    ${statusLevel === 'critical'
                                                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                                            : statusLevel === 'high'
                                                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                                                : statusLevel === 'medium'
                                                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                                                    : 'bg-green-500/20 text-green-300 border-green-500/30'
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
                                                    <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
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
                                            <span className="font-semibold text-white">${debt.currentBalance.toLocaleString()}</span>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/5 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Payment</span>
                                                <span className="font-bold text-white">${debt.monthlyRepayment.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
                                                <div className="flex flex-col">
                                                    <Tooltip content="The true cost of the loan including fees, compounding frequency, and introductory rates.">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 border-b border-dotted border-gray-400 dark:border-gray-600 cursor-help">Effective Rate</span>
                                                    </Tooltip>
                                                    {rateIsSwitched && (
                                                        <span className="text-[10px] font-semibold text-orange-500 dark:text-orange-400">
                                                            Revert rate active
                                                        </span>
                                                    )}
                                                    {riskFlag && !rateIsSwitched && (
                                                        <span className="text-[10px] font-semibold text-purple-500 dark:text-purple-400">
                                                            {riskFlag}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className={`text-xs font-bold ${highCostDebtFlag ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                                        {effectiveRatePct}%
                                                    </span>
                                                    {highCostDebtFlag && (
                                                        <div className="text-[10px] text-red-400 font-medium">High Cost Debt</div>
                                                    )}
                                                    {payoffPriorityHint && (
                                                        <div className="text-[10px] text-red-300 font-bold bg-red-500/20 px-1 rounded mt-0.5 border border-red-500/30">
                                                            Priority: {payoffPriorityHint}
                                                        </div>
                                                    )}
                                                    {strategyHint && (
                                                        <div className="text-[10px] text-blue-400 font-medium mt-0.5">
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
                            </GlassCard>
                        );
                    })}
                </div>
            </div>

            {/* Vehicle Section */}
            <h3 className="text-xl font-bold text-white pl-1">Vehicle Assets</h3>
            <GlassCard className="!p-0 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-800 relative h-64 lg:h-auto">
                    <img
                        src={kiaImage}
                        alt="Kia Sportage"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
                <div className="p-8 lg:col-span-2 flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                        <Car className="w-6 h-6 text-blue-500 mr-2" />
                        <h3 className="text-2xl font-bold text-white">Kia Sportage 2024</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loan Balance</p>
                            <p className="text-xl font-bold text-white">$35,000.00</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Repayment</p>
                            <p className="text-xl font-bold text-white">$1,475.00</p>
                        </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start">
                        <AlertCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-semibold text-green-700 dark:text-green-300 text-sm">Green Slip (CTP) Status: Active</h5>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Compulsory Third Party insurance covers personal injury liability in NSW. Ensure renewal by registration due date.
                            </p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </PageContainer>
    );
}

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, Zap, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WealthTrajectory({ wealthMetrics }) {
    // Safely extract values with defaults
    const netWorth = wealthMetrics?.netWorth ?? 0;
    const monthlyVelocity = wealthMetrics?.monthlyVelocity ?? 0;
    const monthlyInterestBurn = wealthMetrics?.monthlyInterestBurn ?? 0;

    // Calculate projections
    const projections = useMemo(() => {
        const projection6M = netWorth + (monthlyVelocity * 6);
        const projection12M = netWorth + (monthlyVelocity * 12);

        // Calculate months to positive if net worth is negative
        let monthsToPositive = null;
        if (netWorth < 0 && monthlyVelocity > 0) {
            monthsToPositive = Math.ceil(Math.abs(netWorth) / monthlyVelocity);
        }

        // Generate chart data for 12 months
        const chartData = [];
        for (let i = 0; i <= 12; i++) {
            const projectedValue = netWorth + (monthlyVelocity * i);
            chartData.push({
                month: i === 0 ? 'Now' : `+${i}m`,
                value: Math.round(projectedValue)
            });
        }

        return {
            projection6M,
            projection12M,
            monthsToPositive,
            chartData
        };
    }, [netWorth, monthlyVelocity]);

    const isNegative = netWorth < 0;
    const velocityPositive = monthlyVelocity > 0;

    return (
        <div className="bg-surface rounded-3xl shadow-lg border border-surface-highlight p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Wealth Trajectory</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your financial path forward</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Metrics */}
                <div className="space-y-4">
                    {/* Current Net Worth */}
                    <div className="bg-surface-highlight rounded-2xl p-5 shadow-sm border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Net Worth</span>
                            <DollarSign className={`w-5 h-5 ${isNegative ? 'text-red-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className={`text-3xl font-bold ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            ${Math.abs(netWorth).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            {isNegative && <span className="text-lg ml-1">debt</span>}
                        </div>
                    </div>

                    {/* Monthly Velocity */}
                    <div className="bg-surface-highlight rounded-2xl p-5 shadow-sm border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Velocity</span>
                            {velocityPositive ? (
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                        <div className={`text-2xl font-bold ${velocityPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {velocityPositive ? '+' : ''}${monthlyVelocity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Net worth change per month
                        </p>
                    </div>

                    {/* Monthly Interest Burn */}
                    <div className="bg-surface-highlight rounded-2xl p-5 shadow-sm border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Interest Burn</span>
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ${monthlyInterestBurn.toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Interest paid on debts
                        </p>
                    </div>
                </div>

                {/* Right: Chart */}
                <div className="bg-surface-highlight rounded-2xl p-5 shadow-sm border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">12-Month Projection</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={projections.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickFormatter={(val) => `$${val / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #374151',
                                    backgroundColor: '#1f2937',
                                    color: '#f3f4f6',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ fontSize: '12px' }}
                                formatter={(value) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Net Worth']}
                                labelStyle={{ color: '#9ca3af', marginBottom: '8px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="url(#colorWealth)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Based on monthly velocity of ${monthlyVelocity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                    </p>
                </div>
            </div>
        </div>
    );
}

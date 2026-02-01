import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, Zap, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl shadow-lg border border-indigo-100 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wealth Trajectory</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your financial path forward</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Metrics */}
                <div className="space-y-4">
                    {/* Current Net Worth */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Net Worth</span>
                            <DollarSign className={`w-5 h-5 ${isNegative ? 'text-red-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className={`text-3xl font-bold ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            ${Math.abs(netWorth).toLocaleString()}
                            {isNegative && <span className="text-lg ml-1">debt</span>}
                        </div>
                    </div>

                    {/* Monthly Velocity */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Velocity</span>
                            {velocityPositive ? (
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                        <div className={`text-2xl font-bold ${velocityPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {velocityPositive ? '+' : ''}${monthlyVelocity.toLocaleString()}/mo
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Net worth change per month
                        </p>
                    </div>

                    {/* Monthly Interest Burn */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Interest Burn</span>
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ${monthlyInterestBurn.toLocaleString()}/mo
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Interest paid on debts
                        </p>
                    </div>

                    {/* Projections */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-600">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Projections</div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">6 Months</span>
                                <span className={`font-bold ${projections.projection6M < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                    ${Math.abs(projections.projection6M).toLocaleString()}
                                    {projections.projection6M < 0 && <span className="text-xs ml-1">debt</span>}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">12 Months</span>
                                <span className={`font-bold ${projections.projection12M < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    ${Math.abs(projections.projection12M).toLocaleString()}
                                    {projections.projection12M < 0 && <span className="text-xs ml-1">debt</span>}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Months to Positive (if negative) */}
                    {isNegative && projections.monthsToPositive && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 shadow-sm border border-emerald-200 dark:border-emerald-800">
                            <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-3">
                                Path to Positive Net Worth
                            </div>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                                {projections.monthsToPositive} months
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (6 / projections.monthsToPositive) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                                At current velocity of ${monthlyVelocity.toLocaleString()}/mo
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Chart */}
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">12-Month Projection</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={projections.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                            <XAxis
                                dataKey="month"
                                stroke="#6b7280"
                                className="dark:stroke-gray-400"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                className="dark:stroke-gray-400"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px'
                                }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Net Worth']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ fill: '#6366f1', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            {/* Zero line if crossing */}
                            {projections.chartData.some(d => d.value < 0) && projections.chartData.some(d => d.value >= 0) && (
                                <Line
                                    type="monotone"
                                    dataKey={() => 0}
                                    stroke="#dc2626"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Based on monthly velocity of ${monthlyVelocity.toLocaleString()}/mo
                    </p>
                </div>
            </div>
        </div>
    );
}

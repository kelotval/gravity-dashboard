import React, { useMemo, useState } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Sparkles, AlertCircle, Target, Zap, BarChart3 } from "lucide-react";

export default function TrendsView({ income = {}, transactions = [], debts = [] }) {
    const [selectedPeriod, setSelectedPeriod] = useState('6mo'); // 3mo, 6mo, 12mo, ytd, all

    // Group transactions by month
    const monthlyData = useMemo(() => {
        // Calculate period start date based on selected period
        const now = new Date();
        let startDate;

        switch (selectedPeriod) {
            case '3mo':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case '6mo':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                break;
            case '12mo':
                startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
                break;
            case 'ytd':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all':
                startDate = new Date(2020, 0, 1); // Far back enough
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        }

        const grouped = {};
        const totalIncome = Object.values(income).reduce((a, b) => a + b, 0);

        console.log('TrendsView Debug:', {
            period: selectedPeriod,
            startDate: startDate.toISOString(),
            totalTransactions: transactions.length,
            totalIncome
        });

        transactions.forEach(tx => {
            if (!tx.date) {
                console.log('Transaction without date:', tx);
                return;
            }

            // Try parsing date - handle both string and Date object
            let txDate;
            if (tx.date instanceof Date) {
                txDate = tx.date;
            } else {
                txDate = new Date(tx.date);
            }

            // Check if date is valid
            if (isNaN(txDate.getTime())) {
                console.log('Invalid date:', tx.date, tx);
                return;
            }

            if (txDate < startDate) return;

            const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    month: monthKey,
                    monthLabel: txDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    income: totalIncome,
                    expenses: 0,
                    byCategory: {},
                    txCount: 0
                };
            }

            if (tx.amount > 0) {
                grouped[monthKey].expenses += tx.amount;
                grouped[monthKey].txCount += 1;
                const category = tx.category || 'Uncategorized';
                grouped[monthKey].byCategory[category] = (grouped[monthKey].byCategory[category] || 0) + tx.amount;
            }
        });

        console.log('Grouped months:', Object.keys(grouped).length, grouped);

        // Convert to array and sort by month
        const result = Object.values(grouped)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map(m => ({
                ...m,
                surplus: m.income - m.expenses,
                savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income * 100) : 0
            }));

        console.log('Final monthlyData:', result);
        return result;
    }, [transactions, income, selectedPeriod]); // Added selectedPeriod to dependencies

    // Calculate debt trajectory
    const debtTrajectory = useMemo(() => {
        const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
        const totalMonthlyPayment = debts.reduce((sum, d) => sum + (d.monthlyRepayment || 0), 0);

        return monthlyData.map((m, idx) => ({
            ...m,
            totalDebt: Math.max(0, totalDebt - (totalMonthlyPayment * idx))
        }));
    }, [monthlyData, debts]);

    // Category velocity analysis
    const categoryVelocity = useMemo(() => {
        if (monthlyData.length < 2) return { increasing: [], decreasing: [] };

        const currentMonth = monthlyData[monthlyData.length - 1];
        const previousMonth = monthlyData[monthlyData.length - 2];

        const changes = [];
        const allCategories = new Set([
            ...Object.keys(currentMonth.byCategory || {}),
            ...Object.keys(previousMonth.byCategory || {})
        ]);

        allCategories.forEach(cat => {
            const current = currentMonth.byCategory[cat] || 0;
            const previous = previousMonth.byCategory[cat] || 0;
            const change = current - previous;
            const percentChange = previous > 0 ? (change / previous * 100) : 0;

            if (Math.abs(change) > 50) { // Only show significant changes
                changes.push({
                    category: cat,
                    current,
                    previous,
                    change,
                    percentChange
                });
            }
        });

        changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

        return {
            increasing: changes.filter(c => c.change > 0).slice(0, 3),
            decreasing: changes.filter(c => c.change < 0).slice(0, 3)
        };
    }, [monthlyData]);

    // Predictive insights
    const insights = useMemo(() => {
        if (monthlyData.length < 2) return [];

        const results = [];
        const avgSavingsRate = monthlyData.reduce((sum, m) => sum + m.savingsRate, 0) / monthlyData.length;
        const latestSavings = monthlyData[monthlyData.length - 1]?.savingsRate || 0;
        const savingsTrend = latestSavings - avgSavingsRate;

        // Savings rate trend
        if (savingsTrend > 5) {
            results.push({
                type: 'positive',
                icon: TrendingUp,
                message: `Savings rate trending up by ${savingsTrend.toFixed(1)}% - excellent progress!`
            });
        } else if (savingsTrend < -5) {
            results.push({
                type: 'warning',
                icon: AlertCircle,
                message: `Savings rate declining by ${Math.abs(savingsTrend).toFixed(1)}% - review expenses`
            });
        }

        // Debt projection
        const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
        const avgSurplus = monthlyData.reduce((sum, m) => sum + m.surplus, 0) / monthlyData.length;
        if (totalDebt > 0 && avgSurplus > 0) {
            const monthsToDebtFree = Math.ceil(totalDebt / avgSurplus);
            const debtFreeDate = new Date();
            debtFreeDate.setMonth(debtFreeDate.getMonth() + monthsToDebtFree);
            results.push({
                type: 'info',
                icon: Target,
                message: `At current rate, debt-free by ${debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
            });
        }

        // Annual projection
        if (avgSurplus > 0) {
            const annualSavings = avgSurplus * 12;
            results.push({
                type: 'positive',
                icon: Sparkles,
                message: `On track to save $${annualSavings.toLocaleString()} this year`
            });
        }

        return results;
    }, [monthlyData, debts]);

    return (
        <div className="space-y-6 pb-12">
            {/* Header with Period Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Trends</h2>
                    <p className="text-gray-500 dark:text-gray-400">Historical analysis from real transaction data</p>
                </div>
                <div className="flex gap-2">
                    {['3mo', '6mo', '12mo', 'ytd', 'all'].map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedPeriod === period
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {period === 'ytd' ? 'YTD' : period === 'all' ? 'All' : period.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Predictive Insights */}
            {insights.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Predictive Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 p-4 rounded-xl ${insight.type === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                    insight.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                        'bg-blue-100 dark:bg-blue-900/30'
                                    }`}
                            >
                                <insight.icon className={`w-5 h-5 ${insight.type === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
                                    insight.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                        'text-blue-600 dark:text-blue-400'
                                    }`} />
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {insight.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Income vs Expenses Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Income vs Expenses Trajectory</h3>
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => `$${value.toLocaleString()}`}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2} name="Income" />
                            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#colorExpenses)" strokeWidth={2} name="Expenses" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Savings Rate Evolution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Savings Rate Evolution</h3>
                        <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => `${value.toFixed(1)}%`}
                                />
                                <Line type="monotone" dataKey="savingsRate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Savings Rate %" />
                                <Line type="monotone" dataKey={() => 20} stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" name="Target (20%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Debt Trajectory */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Debt Reduction Progress</h3>
                        <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={debtTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Area type="monotone" dataKey="totalDebt" stroke="#a855f7" fill="url(#colorDebt)" strokeWidth={3} name="Total Debt" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Category Velocity */}
            {(categoryVelocity.increasing.length > 0 || categoryVelocity.decreasing.length > 0) && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category Spending Velocity</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">(Month-over-Month)</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Increasing */}
                        {categoryVelocity.increasing.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Increasing Categories
                                </h4>
                                <div className="space-y-2">
                                    {categoryVelocity.increasing.map((cat, idx) => (
                                        <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-gray-900 dark:text-white">{cat.category}</span>
                                                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                                    +${Math.abs(cat.change).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                ${cat.previous.toLocaleString()} → ${cat.current.toLocaleString()}
                                                <span className="ml-2 text-red-600 dark:text-red-400 font-bold">
                                                    ({cat.percentChange > 0 ? '+' : ''}{cat.percentChange.toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Decreasing */}
                        {categoryVelocity.decreasing.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4" />
                                    Decreasing Categories
                                </h4>
                                <div className="space-y-2">
                                    {categoryVelocity.decreasing.map((cat, idx) => (
                                        <div key={idx} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-gray-900 dark:text-white">{cat.category}</span>
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    -${Math.abs(cat.change).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                ${cat.previous.toLocaleString()} → ${cat.current.toLocaleString()}
                                                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                                    ({cat.percentChange.toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Data State */}
            {monthlyData.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Transaction Data Available</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add transactions to see historical trends and insights
                    </p>
                </div>
            )}
        </div>
    );
}

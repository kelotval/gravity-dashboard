import React, { useMemo, useState } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Sparkles, AlertCircle, Target, Zap, BarChart3 } from "lucide-react";
import { PageContainer } from "./common/PageContainer";
import { SurfaceCard } from './common/SurfaceCard';

import { getComputedTransactionsForMonth, parseAmount, inferTransactionKind } from "../utils/transactionHelpers";

export default function TrendsView({ income = {}, transactions = [], debts = [], monthlyLedger = [], recurringExpenses = [] }) {
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

        // Use Monthly Ledger if available (Source of Truth for Totals)
        if (monthlyLedger && monthlyLedger.length > 0) {
            const startDateStr = startDate.toISOString().substring(0, 7); // YYYY-MM

            const filteredLedger = monthlyLedger.filter(row => row.monthKey >= startDateStr);

            return filteredLedger.map(row => {
                // Compute detailed transactions for category breakdown
                const computedTx = getComputedTransactionsForMonth(row.monthKey, transactions, recurringExpenses);

                const byCategory = computedTx
                    .map(tx => ({ ...tx, kind: tx.kind || inferTransactionKind(tx) }))
                    .filter(tx => tx.kind === 'expense' && tx.category !== 'Transfers')
                    .reduce((acc, tx) => {
                        const cat = tx.category || 'Uncategorized';
                        acc[cat] = (acc[cat] || 0) + Math.abs(parseAmount(tx.amount));
                        return acc;
                    }, {});

                // Parse month label from YYYY-MM
                const [y, m] = row.monthKey.split('-');
                const dateObj = new Date(Number(y), Number(m) - 1, 1);
                const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

                return {
                    month: row.monthKey,
                    monthLabel,
                    income: row.plannedIncome,
                    expenses: row.totalExpenses, // Consistent with Overview (includes Debt + Recurring)
                    surplus: row.netSavings,
                    savingsRate: row.savingsRate,
                    byCategory,
                    txCount: row.transactionCount
                };
            });
        }

        // Fallback (Should typically not be reached if App passes ledger)
        const grouped = {};
        // ... (Legacy fallback logic if needed, but we rely on Ledger)
        return [];
    }, [transactions, income, selectedPeriod, monthlyLedger, recurringExpenses]);

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

    const [activeChart, setActiveChart] = useState('cashflow'); // cashflow, savings, debt

    // ... (keep monthlyData, debtTrajectory, categoryVelocity, insights logic same) ...

    const PeriodSelector = (
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {['3mo', '6mo', '12mo', 'ytd', 'all'].map(period => (
                <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedPeriod === period
                        ? 'bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                        }`}
                >
                    {period === 'ytd' ? 'YTD' : period === 'all' ? 'All' : period.toUpperCase()}
                </button>
            ))}
        </div>
    );

    return (
        <PageContainer
            title="Financial Trends"
            subtitle="Historical analysis & patterns"
            action={PeriodSelector}
        >
            {/* Predictive Insights - Key Takeaways */}
            {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {insights.map((insight, idx) => (
                        <SurfaceCard
                            key={idx}
                            className={`!p-4 flex items-start gap-3 transition-all ${insight.type === 'positive' ? 'border-emerald-500/20' :
                                insight.type === 'warning' ? 'border-amber-500/20' :
                                    'border-blue-500/20'
                                }`}
                        >
                            <insight.icon className={`w-4 h-4 mt-0.5 ${insight.type === 'positive' ? 'text-emerald-400' :
                                insight.type === 'warning' ? 'text-amber-400' :
                                    'text-blue-400'
                                }`} />
                            <span className="text-sm text-gray-300 leading-relaxed font-light">
                                {insight.message}
                            </span>
                        </SurfaceCard>
                    ))}
                </div>
            )}

            {/* Chart Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-1">
                <button
                    onClick={() => setActiveChart('cashflow')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeChart === 'cashflow' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Cash Flow
                </button>
                <button
                    onClick={() => setActiveChart('savings')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeChart === 'savings' ? 'border-emerald-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Savings Rate
                </button>
                <button
                    onClick={() => setActiveChart('debt')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeChart === 'debt' ? 'border-rose-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Debt Reduction
                </button>
            </div>

            {/* Main Chart Area */}
            <SurfaceCard className="min-h-[400px]">
                {activeChart === 'cashflow' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-medium text-white tracking-tight">Income vs Expenses</h3>
                                <p className="text-sm text-gray-500 mt-1">Cash flow analysis over time</p>
                            </div>
                            <BarChart3 className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34D399" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F87171" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis
                                        dataKey="monthLabel"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#525252', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#525252', fontSize: 11 }}
                                        tickFormatter={(val) => `$${val / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(23, 23, 23, 0.9)',
                                            borderColor: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '1rem',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                            color: '#F3F4F6',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                        itemStyle={{ fontSize: '12px' }}
                                        formatter={(value) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, undefined]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                    <Area type="monotone" dataKey="income" stroke="#34D399" fill="url(#colorIncome)" strokeWidth={2} name="Income" />
                                    <Area type="monotone" dataKey="expenses" stroke="#F87171" fill="url(#colorExpenses)" strokeWidth={2} name="Expenses" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeChart === 'savings' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-medium text-white tracking-tight">Savings Rate</h3>
                                <p className="text-sm text-gray-500 mt-1">Target: 20%</p>
                            </div>
                            <Target className="w-5 h-5 text-emerald-500/50" />
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#525252', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#525252', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem' }}
                                        formatter={(value) => [`${value.toFixed(1)}%`, undefined]}
                                    />
                                    <Line type="monotone" dataKey="savingsRate" stroke="#34D399" strokeWidth={3} dot={{ fill: '#059669' }} activeDot={{ r: 6 }} name="Savings Rate %" />
                                    <Line type="monotone" dataKey={() => 20} stroke="#525252" strokeWidth={1} strokeDasharray="4 4" name="Target (20%)" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeChart === 'debt' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-medium text-white tracking-tight">Debt Reduction</h3>
                                <p className="text-sm text-gray-500 mt-1">Projected pay-down path</p>
                            </div>
                            <Activity className="w-5 h-5 text-indigo-500/50" />
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={debtTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#525252', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#525252', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem' }}
                                        formatter={(value) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, undefined]}
                                    />
                                    <Area type="monotone" dataKey="totalDebt" stroke="#6366F1" fill="url(#colorDebt)" strokeWidth={2} name="Total Debt" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </SurfaceCard>

            {/* Category Velocity (Simplified) */}
            {(categoryVelocity.increasing.length > 0 || categoryVelocity.decreasing.length > 0) && (
                <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Spending Shifts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categoryVelocity.increasing.map((cat, idx) => (
                            <div key={`inc-${idx}`} className="flex items-center justify-between p-3 bg-rose-500/[0.05] border border-rose-500/10 rounded-lg">
                                <span className="text-sm font-medium text-gray-300">{cat.category}</span>
                                <span className="text-sm font-bold text-rose-400">+{Math.round(cat.percentChange)}%</span>
                            </div>
                        ))}
                        {categoryVelocity.decreasing.map((cat, idx) => (
                            <div key={`dec-${idx}`} className="flex items-center justify-between p-3 bg-emerald-500/[0.05] border border-emerald-500/10 rounded-lg">
                                <span className="text-sm font-medium text-gray-300">{cat.category}</span>
                                <span className="text-sm font-bold text-emerald-400">{Math.round(cat.percentChange)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </PageContainer>
    );

}

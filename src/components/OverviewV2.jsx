
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Activity, Wallet, CreditCard, Layers, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// --- Helper Components ---
const GlassCard = ({ children, className = '' }) => (
    <div className={`relative bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden ${className}`}>
        {/* Subtle gradient blob for atmosphere */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

const StatBadge = ({ value, label, isPositive }) => (
    <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {value}
        </div>
        <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
    </div>
);

// --- Overview V2 Component ---
export default function OverviewV2({
    netWorth,
    healthScore,
    cashflow,
    incomeExpenseData, // Array for chart [{name, Income, Expenses}]
    handleNavigate,
    transactions,
    debts,
    activeMonth,
    setActiveMonth,
    availableMonths = [],
    monthlyLedger = [],
    incomeHistory = []
}) {
    const [animate, setAnimate] = useState(false);
    const [timeRange, setTimeRange] = useState('last6'); // 'last6' or 'ytd'

    useEffect(() => {
        setAnimate(true);
    }, []);

    // Filter chart data based on selected time range
    const getFilteredChartData = () => {
        if (!incomeExpenseData || incomeExpenseData.length === 0) {
            return [{ name: 'Current', Income: 0, Expenses: 0 }];
        }

        if (timeRange === 'ytd') {
            // Filter for current year only
            const currentYear = new Date().getFullYear();
            return incomeExpenseData.filter(d => d.name && d.name.startsWith(String(currentYear)));
        } else {
            // Last 6 months (default)
            return incomeExpenseData.slice(-6);
        }
    };

    const chartData = getFilteredChartData();

    // Get ledger data for the currently active month
    const activeLedgerData = (monthlyLedger || []).find(l => l.monthKey === activeMonth) || {};

    // Format currency
    const fmt = (n) => n?.toLocaleString();

    return (
        <div className={`min-h-screen bg-[#0B0E14] text-white p-3 sm:p-6 space-y-4 sm:space-y-6 transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>

            {/* Header Section */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-100 to-gray-500 bg-clip-text text-transparent mb-1">
                        Financial Overview
                    </h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-gray-500 font-medium text-sm">
                        <span className="hidden sm:inline">Your wealth strategy command center</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                            Viewing: {activeMonth}
                        </span>
                    </div>

                    {/* DEBUG PANEL */}
                    <div className="hidden">
                        <h4 className="font-bold border-b border-yellow-500/30 mb-2 pb-1">DEBUG DATA ({activeMonth})</h4>
                        {(() => {
                            const thisMonthLedger = (monthlyLedger || []).find(l => l.monthKey === activeMonth);
                            if (!thisMonthLedger) return <div>No ledger entry found for {activeMonth}</div>;

                            const thisMonthTx = transactions.filter(t => (t.periodKey || t.date?.slice(0, 7)) === activeMonth);

                            return (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div>Income: ${thisMonthLedger.totalIncome?.toLocaleString()}</div>
                                        <div>Expenses: ${thisMonthLedger.totalExpenses?.toLocaleString()}</div>
                                        <div>Inflows: ${thisMonthLedger.totalInflows?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div>Total Tx: {thisMonthTx.length}</div>
                                        <div>Expense Tx Check: {thisMonthTx.filter(t => t.kind === 'expense').length}</div>
                                        <div>Sample Tx:</div>
                                        {thisMonthTx.slice(0, 2).map(t => (
                                            <div key={t.id} className="text-gray-400 ml-2">
                                                - {t.description?.slice(0, 15)}... (${t.amount}, {t.kind})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Month Selector */}
                    <div className="relative flex-1 sm:flex-initial">
                        <select
                            value={activeMonth}
                            onChange={(e) => setActiveMonth(e.target.value)}
                            className="appearance-none bg-gray-900 border border-gray-700 text-white pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-gray-800 transition-colors w-full"
                        >
                            {availableMonths.map(m => (
                                <option key={m} value={m}>{m} {m === new Date().toISOString().substring(0, 7) ? '(Current)' : ''}</option>
                            ))}
                            {!availableMonths.includes(activeMonth) && <option value={activeMonth}>{activeMonth}</option>}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-400">
                            <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                    </div>

                    <button
                        onClick={() => handleNavigate('transactions')}
                        className="px-3 sm:px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl text-xs sm:text-sm font-medium transition-all border border-white/5 flex items-center gap-1 sm:gap-2"
                    >
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Recent Txns</span><span className="sm:hidden">Txns</span>
                    </button>
                    <button
                        onClick={() => handleNavigate('scenarios')}
                        className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1 sm:gap-2"
                    >
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4" /> Simulator
                    </button>
                </div>
            </header>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                {/* 1. Hero Card: Net Worth (Spans 8 cols) */}
                <GlassCard className="lg:col-span-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                    {/* Dynamic Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent group-hover:from-indigo-800/30 transition-all duration-1000" />

                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-white/5 rounded-lg text-indigo-400">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Net Worth</span>
                            </div>
                            <div className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-4">
                                ${fmt(netWorth)}
                            </div>
                            <div className="mt-2 text-sm font-medium text-gray-400">
                                {netWorth < 0 ? "Net worth improving, but still below zero" : "Net worth positive and growing"}
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
                                <StatBadge value="+12.5%" label="Change vs last month" isPositive={true} />
                                <StatBadge value="+$145k" label="12-month trajectory" isPositive={true} />
                            </div>
                        </div>

                        {/* Health Score Circular Gauge */}
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="CurrentColor" strokeWidth="8" fill="none" className="text-gray-800" />
                                <circle
                                    cx="64" cy="64" r="56"
                                    stroke="CurrentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={351}
                                    strokeDashoffset={351 - (351 * healthScore) / 100}
                                    className={`text-emerald-500 transition-all duration-1000 ease-out`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold text-white">{healthScore}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Health</span>
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] font-medium text-emerald-400 opacity-60">Improving trend</span>
                        </div>
                    </div>

                    {/* Mini Sparkline for Net Worth History (Simulated for V2 visual) */}
                    <div className="h-16 w-full mt-auto opacity-50">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { v: netWorth * 0.9 }, { v: netWorth * 0.92 }, { v: netWorth * 0.91 },
                                { v: netWorth * 0.94 }, { v: netWorth * 0.97 }, { v: netWorth }
                            ]}>
                                <defs>
                                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="#818cf8" fill="url(#splitColor)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* 2. Quick Stats Column (Spans 4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Cashflow Card */}
                    <GlassCard>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">Monthly Cashflow</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${cashflow > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {cashflow > 0 ? 'Positive' : 'Cashflow Deficit'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Income</span>
                                    <span className="text-emerald-400 font-bold">${fmt(activeLedgerData.plannedIncome || 0)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full rounded-full" />
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-3 mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <div>
                                        <span className="text-gray-400 block">Expenses</span>
                                        <span className="text-[10px] text-gray-600">Includes debt repayments</span>
                                    </div>
                                    <span className="text-rose-400 font-bold">${fmt(activeLedgerData.totalExpenses || 0)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                    {/* Simple ratio calculation */}
                                    <div
                                        className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(((activeLedgerData.totalExpenses || 0) / (activeLedgerData.plannedIncome || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-end">
                            <div>
                                <span className="text-xs text-gray-500 block">Net Savings</span>
                                <span className={`text-lg font-bold ${cashflow >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                    {cashflow >= 0 ? '+' : ''}${fmt(cashflow)}
                                </span>
                            </div>
                        </div>

                        {/* Deterministic Insight Line */}
                        <div className="mt-4 pt-3 border-t border-white/5 text-center">
                            <p className="text-[10px] text-indigo-300 font-medium">
                                {(() => {
                                    if (cashflow >= 0) return "Surplus is being effectively directed to savings";

                                    const totalDebtPayment = debts?.reduce((sum, d) => sum + d.monthlyRepayment, 0) || 0;
                                    const discretionaryEx = ['Dining Out', 'Entertainment', 'Shopping', 'Travel', 'Coffee', 'Hobbies'];
                                    const discretionarySpend = transactions
                                        .filter(t => discretionaryEx.includes(t.category))
                                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                                    if (cashflow + totalDebtPayment > 0) return "Spending is within income, debt is the main drag";
                                    if (cashflow + discretionarySpend > 0) return "Cashflow would be positive without discretionary spending";
                                    return "Debt repayments exceed surplus income this month";
                                })()}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleNavigate('liabilities')}
                            className="bg-gray-900/40 border border-white/5 p-4 rounded-2xl hover:bg-gray-800 transition-colors text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3 group-hover:bg-orange-500/30">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-bold text-gray-300">Liability Visualizer</div>
                        </button>

                        <button
                            onClick={() => handleNavigate('relocation')}
                            className="bg-gray-900/40 border border-white/5 p-4 rounded-2xl hover:bg-gray-800 transition-colors text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:bg-blue-500/30">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-bold text-gray-300">Future Projections</div>
                        </button>
                    </div>
                </div >

                {/* 3. Main Chart Section (Spans 12 cols) */}
                < GlassCard className="lg:col-span-12" >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Financial Performance</h3>
                            <p className="text-sm text-gray-500">Income vs Expenses over time</p>
                        </div>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-gray-950 border border-gray-800 text-gray-400 text-sm rounded-lg px-3 py-1 outline-none hover:bg-gray-900 cursor-pointer transition-colors"
                        >
                            <option value="last6">Last 6 Months</option>
                            <option value="ytd">Year to Date</option>
                        </select>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                    label={{ value: 'Months', position: 'insideBottomRight', offset: -5, fill: '#4b5563', fontSize: 10 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                    label={{ value: 'AUD', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 10, dy: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    cursor={{ stroke: '#4b5563', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                />
                                <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" opacity={0.5} />
                                <Area
                                    type="monotone"
                                    dataKey="Income"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Expenses"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e', filter: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.5))' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard >

                {/* 4. Quick Action Insights (Spans 12 cols) */}
                <div className="lg:col-span-12">
                    <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-3 sm:mb-4 ml-1 sm:ml-2">Quick Action Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Largest Expense This Month */}
                        {(() => {
                            const thisMonthTx = transactions.filter(t => (t.periodKey || t.date?.slice(0, 7)) === activeMonth);
                            const expenses = thisMonthTx.filter(tx => tx.amount < 0 && tx.kind !== 'transfer');
                            const largest = expenses.sort((a, b) => a.amount - b.amount)[0];

                            return (
                                <GlassCard className="hover:border-rose-500/30 transition-all cursor-pointer group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-3 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                                            <TrendingDown className="w-5 h-5 text-rose-400" />
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">{activeMonth}</span>
                                    </div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Largest Expense</div>
                                    {largest ? (
                                        <>
                                            <div className="text-2xl font-bold text-white mb-1">${Math.abs(largest.amount).toLocaleString()}</div>
                                            <div className="text-sm text-gray-400 truncate">{largest.item || largest.description}</div>
                                            <div className="mt-2 text-xs text-rose-400 font-medium">{largest.category}</div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-gray-500">No expenses yet</div>
                                    )}
                                </GlassCard>
                            );
                        })()}

                        {/* Spending Trend */}
                        {(() => {
                            const currentLedger = monthlyLedger.find(l => l.monthKey === activeMonth);
                            const currentMonthIndex = monthlyLedger.findIndex(l => l.monthKey === activeMonth);
                            const previousLedger = currentMonthIndex > 0 ? monthlyLedger[currentMonthIndex - 1] : null;

                            const currentExpenses = currentLedger?.totalExpenses || 0;
                            const previousExpenses = previousLedger?.totalExpenses || 0;
                            const change = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;
                            const isUp = change > 0;

                            return (
                                <GlassCard className={`hover:border-${isUp ? 'rose' : 'emerald'}-500/30 transition-all cursor-pointer group`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-3 bg-${isUp ? 'rose' : 'emerald'}-500/10 rounded-xl group-hover:bg-${isUp ? 'rose' : 'emerald'}-500/20 transition-colors`}>
                                            <Activity className={`w-5 h-5 text-${isUp ? 'rose' : 'emerald'}-400`} />
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">vs Last Month</span>
                                    </div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Spending Trend</div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <div className="text-2xl font-bold text-white">${currentExpenses.toLocaleString()}</div>
                                        {previousExpenses > 0 && (
                                            <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                {Math.abs(change).toFixed(1)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {isUp ? 'Spending increased' : 'Spending decreased'}
                                    </div>
                                </GlassCard>
                            );
                        })()}

                        {/* Upcoming Bills Alert */}
                        {(() => {
                            // This is a placeholder - you'd need to pass recurringExpenses as a prop
                            // For now, we'll show a simple alert based on debt payments
                            const highPriorityDebts = debts.filter(d => d.accent === 'red').length;

                            return (
                                <GlassCard className="hover:border-orange-500/30 transition-all cursor-pointer group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                                            <CreditCard className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">Priority</span>
                                    </div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Payment Focus</div>
                                    <div className="text-2xl font-bold text-white mb-1">{highPriorityDebts}</div>
                                    <div className="text-sm text-gray-400">
                                        {highPriorityDebts === 0 ? 'No urgent payments' :
                                            highPriorityDebts === 1 ? 'High-priority debt' :
                                                'High-priority debts'}
                                    </div>
                                    {highPriorityDebts > 0 && (
                                        <div className="mt-2 text-xs text-orange-400 font-medium">Requires attention</div>
                                    )}
                                </GlassCard>
                            );
                        })()}

                        {/* Budget Status */}
                        {(() => {
                            const currentLedger = monthlyLedger.find(l => l.monthKey === activeMonth);
                            const income = currentLedger?.totalIncome || 0;
                            const expenses = currentLedger?.totalExpenses || 0;
                            const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
                            const isHealthy = savingsRate >= 20;

                            return (
                                <GlassCard className={`hover:border-${isHealthy ? 'emerald' : 'yellow'}-500/30 transition-all cursor-pointer group`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-3 bg-${isHealthy ? 'emerald' : 'yellow'}-500/10 rounded-xl group-hover:bg-${isHealthy ? 'emerald' : 'yellow'}-500/20 transition-colors`}>
                                            <Wallet className={`w-5 h-5 text-${isHealthy ? 'emerald' : 'yellow'}-400`} />
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">Target: 20%</span>
                                    </div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Savings Rate</div>
                                    <div className="text-2xl font-bold text-white mb-1">{savingsRate.toFixed(1)}%</div>
                                    <div className="text-sm text-gray-400">
                                        {isHealthy ? 'On track!' : 'Below target'}
                                    </div>
                                    {!isHealthy && savingsRate > 0 && (
                                        <div className="mt-2 text-xs text-yellow-400 font-medium">
                                            {(20 - savingsRate).toFixed(1)}% to goal
                                        </div>
                                    )}
                                </GlassCard>
                            );
                        })()}

                    </div>
                </div>

                {/* 5. Category Spending Breakdown */}
                <div className="lg:col-span-12">
                    <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-3 sm:mb-4 ml-1 sm:ml-2">Spending by Category</h3>
                    <GlassCard>
                        {(() => {
                            const thisMonthTx = transactions.filter(t => (t.periodKey || t.date?.slice(0, 7)) === activeMonth);
                            const expenses = thisMonthTx.filter(tx => tx.amount < 0 && tx.kind !== 'transfer');

                            // Group by category
                            const categoryMap = {};
                            expenses.forEach(tx => {
                                const cat = tx.category || 'Uncategorized';
                                categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(tx.amount);
                            });

                            // Sort and get top 6
                            const sortedCategories = Object.entries(categoryMap)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 6);

                            const totalExpenses = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

                            if (sortedCategories.length === 0) {
                                return (
                                    <div className="text-center py-12 text-gray-500">
                                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>No expenses recorded for {activeMonth}</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {sortedCategories.map(([category, amount], index) => {
                                        const percentage = (amount / totalExpenses) * 100;
                                        const colors = [
                                            'bg-indigo-500',
                                            'bg-purple-500',
                                            'bg-pink-500',
                                            'bg-rose-500',
                                            'bg-orange-500',
                                            'bg-yellow-500'
                                        ];
                                        const color = colors[index % colors.length];

                                        return (
                                            <div key={category} className="group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                                        <span className="text-white font-medium">{category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-400 text-sm font-mono">{percentage.toFixed(1)}%</span>
                                                        <span className="text-white font-bold font-mono">${amount.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${color} transition-all duration-500 ease-out group-hover:opacity-80`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Total */}
                                    <div className="pt-4 mt-4 border-t border-gray-700/50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total Expenses</span>
                                            <span className="text-white text-xl font-bold font-mono">${totalExpenses.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </GlassCard>
                </div>

            </div >
        </div >
    );
}

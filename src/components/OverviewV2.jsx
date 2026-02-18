import React, { useState, useEffect } from 'react';
import {
    ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
    DollarSign, Activity, Wallet, CreditCard, Layers, Eye,
    Shield, Target, Zap, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { PageContainer } from './common/PageContainer';
import { SurfaceCard } from './common/SurfaceCard';

// --- Premium Components ---

// --- Premium Components ---

const HeroCommandCenter = ({ netWorth, healthScore, animate }) => (
    <div className="relative overflow-hidden rounded-2xl bg-surface p-8 sm:p-10 border border-surface-highlight group shadow-sm transition-all duration-500 hover:shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.03] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-500/[0.05] transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/[0.02] rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-0">
            {/* Net Worth Section */}
            <div className="text-center sm:text-left">
                <h2 className="text-xs font-semibold text-content-tertiary uppercase tracking-[0.2em] mb-2">Total Net Worth</h2>
                <div className={`text-4xl sm:text-6xl font-light text-white tracking-tighter transition-all duration-1000 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>+2.4%</span>
                    </div>
                    <span className="text-content-tertiary text-xs">vs last month</span>
                </div>
            </div>

            {/* Divider (Hidden on Mobile) */}
            <div className="hidden sm:block w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

            {/* Health Score Section */}
            <div className="flex flex-col items-center sm:items-end">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                    {/* Simple Circular Progress (SVG) */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="45%" className="stroke-white/5 fill-none stroke-[6]" />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            className="stroke-indigo-500 fill-none stroke-[6] transition-all duration-1000 ease-out"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * healthScore) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-bold text-white">{healthScore}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Health</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MinimalStatBlock = ({ label, value, trend, trendValue, isPositive }) => (
    <div className="flex flex-col h-full justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">{label}</span>
        <div className="mt-2">
            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-light text-white tracking-tight">{value}</span>
            </div>
            {trend && (
                <div className={`flex items-center text-xs font-medium mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {trendValue}
                </div>
            )}
        </div>
    </div>
);

const ElegantChart = ({ data }) => (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F87171" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#525252"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="#525252"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
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
                    formatter={(value) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, undefined]}
                />
                <Area
                    type="monotone"
                    dataKey="Income"
                    stroke="#34D399"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                />
                <Area
                    type="monotone"
                    dataKey="Expenses"
                    stroke="#F87171"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);



const CompactDebtCard = ({ debt }) => (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group flex-1 min-h-[80px]">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{debt.name}</span>
                {(debt.isHighInterest || debt.highCostDebtFlag) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" title="High Interest" />
                )}
            </div>
            <div className="text-xs text-gray-500">
                {debt.interestRate}% APR • ${debt.monthlyRepayment}/mo
            </div>
            <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider font-medium">
                {debt.debtType || 'Loan'} • {debt.dueLabel || 'Monthly'}
            </div>
        </div>
        <div className="text-right">
            <div className="text-sm font-medium text-white">${(debt.currentBalance || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            {debt.payoffDate && <div className="text-xs text-gray-500">{debt.payoffDate}</div>}
        </div>
    </div>
);

// --- Main Component ---

export default function OverviewV2({
    netWorth,
    healthScore,
    cashflow,
    incomeExpenseData,
    handleNavigate,
    transactions,
    spending,
    debts,
    activeMonth,
    availableMonths,
    setActiveMonth
}) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, [debts]);

    const chartData = incomeExpenseData && incomeExpenseData.length > 0
        ? incomeExpenseData.slice(-6)
        : [{ name: 'Current', Income: 0, Expenses: 0 }];

    return (
        <PageContainer
            title="Overview"
            subtitle="At a glance"
            activeMonth={activeMonth}
        >
            <div className="space-y-8 max-w-7xl mx-auto">

                {/* 1. Command Center */}
                <HeroCommandCenter netWorth={netWorth} healthScore={healthScore} animate={animate} />

                {/* 2. Key Signals - Unified Card */}
                <SurfaceCard padding="p-6 sm:p-8" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-content-tertiary uppercase tracking-wider">Key Signals</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MinimalStatBlock
                            label="Monthly Cashflow"
                            value={`$${cashflow?.toLocaleString() || '0'}`}
                            trend={true}
                            trendValue="12%"
                            isPositive={true}
                        />
                        <MinimalStatBlock
                            label="Savings Rate"
                            value="32%"
                            trend={true}
                            trendValue="Stable"
                            isPositive={true}
                        />
                        <MinimalStatBlock
                            label="Runway"
                            value="8.4 mo"
                            trend={false}
                            isPositive={true}
                        />
                    </div>
                </SurfaceCard>

                {/* 3. Main Split: Analysis vs Action */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                    {/* Left: Financial Trends */}
                    <div className="lg:col-span-2 flex flex-col">
                        <SurfaceCard className="p-6 sm:p-8 h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Income vs Expenses</h3>
                                    <p className="text-sm text-content-tertiary">6 Month Trend</p>
                                </div>
                                <button onClick={() => handleNavigate('trends')} className="text-xs font-bold text-brand hover:text-brand-hover tracking-wide uppercase">View Report</button>
                            </div>
                            <ElegantChart data={chartData} />
                        </SurfaceCard>
                    </div>

                    {/* Right: Action & Liabilities */}
                    <div className="flex flex-col">
                        <SurfaceCard className="h-full flex flex-col p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold text-content-tertiary uppercase tracking-wider">Active Liabilities</h3>
                                <div className="text-xs text-content-tertiary">
                                    {debts ? debts.length : 0} Active
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
                                {debts && debts.length > 0 ? (
                                    debts.map((debt, i) => (
                                        <CompactDebtCard key={i} debt={debt} />
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-content-tertiary opacity-50 flex-1">
                                        <Shield className="w-12 h-12 mb-2" />
                                        <p className="text-sm italic">No active liabilities</p>
                                    </div>
                                )}
                            </div>
                        </SurfaceCard>
                    </div>
                </div>

            </div>
        </PageContainer>
    );
}

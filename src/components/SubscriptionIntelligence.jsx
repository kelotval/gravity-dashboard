import React, { useMemo, useState } from "react";
import { CreditCard, TrendingDown, Zap, Calendar, Sparkles, Filter, BarChart3, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { PageContainer } from './common/PageContainer';
import { SurfaceCard } from './common/SurfaceCard';

// Enterprise Color Palette
const COLORS = {
    brand: '#10B981',
    brandLight: 'rgba(16, 185, 129, 0.2)',
    accent: '#6366F1',
    accentLight: 'rgba(99, 102, 241, 0.2)',
    danger: '#F43F5E',
    dangerLight: 'rgba(244, 63, 94, 0.1)',
    text: '#9CA3AF',
    grid: '#2A2D35',
    tooltipBg: '#15171B',
    tooltipBorder: '#2A2D35'
};

export default function SubscriptionIntelligence({ transactions = [], debts = [], income = {} }) {
    // State for toggled (canceled) subscriptions, month filtering, and sorting
    const [canceledSubs, setCanceledSubs] = useState(new Set());
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [sortBy, setSortBy] = useState("cost-desc"); // cost-desc, cost-asc, activity-desc, activity-asc, name-asc, recent-desc

    // 1. Get all available months from transactions
    const availableMonths = useMemo(() => {
        const months = new Set();
        transactions.forEach(tx => {
            if (tx.date) {
                months.add(tx.date.substring(0, 7)); // YYYY-MM
            }
        });
        return Array.from(months).sort().reverse();
    }, [transactions]);

    // 2. Identify all subscription transactions
    const allSubTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (!tx.category) return false;
            const cat = tx.category.toLowerCase().trim();
            return cat.includes("subscription");
        });
    }, [transactions]);

    // 3. Calculate Trend Data (Monthly Totals)
    const trendData = useMemo(() => {
        const monthlyTotals = {};

        // Initialize last 12 months with 0
        const today = new Date();
        for (let i = 0; i < 11; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyTotals[key] = 0;
        }

        allSubTransactions.forEach(tx => {
            if (!tx.date) return;
            const monthKey = tx.date.substring(0, 7);
            if (monthlyTotals.hasOwnProperty(monthKey) || monthKey >= Object.keys(monthlyTotals).sort()[0]) {
                monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Math.abs(tx.amount);
            }
        });

        return Object.entries(monthlyTotals)
            .map(([month, total]) => ({
                month,
                total: Math.round(total),
                displayDate: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            }))
            .sort((a, b) => a.month.localeCompare(b.month)); // Oldest to newest for chart
    }, [allSubTransactions]);


    // Helper: Normalize merchant names to avoid duplicates (e.g., "Paypal *Netflix" vs "Netflix")
    const normalizeMerchantName = (name) => {
        const raw = (name || "Unknown").trim();
        let n = raw.toLowerCase();

        // Remove common prefixes
        n = n.replace(/^(paypal|sq \*|sp \*|apple\.com\/bill|google \*|dd \d+ |direct debit )/g, "");

        // Remove common suffixes or IDs (very basic)
        n = n.replace(/\*.*$/, ""); // Remove everything after * if it wasn't at start
        n = n.replace(/ pty ltd/g, "").replace(/ ltd/g, "");

        // Clean up
        n = n.replace(/[^a-z0-9 ]/g, " ").trim();

        // If cleanup resulted in empty string (e.g. just symbols), fall back to raw
        if (!n) return raw;

        // Capitalize words for display
        return n.replace(/\b\w/g, c => c.toUpperCase());
    };

    // 4. Filter Transactions for View
    const displayedSubscriptions = useMemo(() => {
        let items = [];

        // If "All Time" selected, use average logic
        if (selectedMonth === "all") {
            const grouped = allSubTransactions.reduce((acc, tx) => {
                // Use original merchant logic or category, then normalize
                const rawName = tx.description || tx.item || tx.category || "Unknown";
                const merchant = normalizeMerchantName(rawName);

                if (!acc[merchant]) acc[merchant] = [];
                acc[merchant].push(tx);
                return acc;
            }, {});

            items = Object.entries(grouped).map(([merchant, txs]) => {
                const totalSpent = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                const avgMonthly = totalSpent / Math.max(1, txs.length);
                const annualCost = avgMonthly * 12;

                const sortedTxs = [...txs].sort((a, b) => {
                    const dateA = a.date ? new Date(a.date) : new Date(0);
                    const dateB = b.date ? new Date(b.date) : new Date(0);
                    return dateB - dateA;
                });
                const lastUsed = sortedTxs[0]?.date || null;

                const uniqueMonths = new Set(txs.map(tx => tx.date ? tx.date.substring(0, 7) : 'unknown')).size;
                const frequency = uniqueMonths > 0 ? txs.length / uniqueMonths : 0;

                return {
                    merchant,
                    cost: avgMonthly,
                    annualCost,
                    lastUsed,
                    transactionCount: txs.length,
                    isLeastUsed: frequency < 1,
                    type: 'average'
                };
            });
        }

        // If specific month selected, show actual transactions
        else {
            const monthlyTxs = allSubTransactions.filter(tx => tx.date && tx.date.startsWith(selectedMonth));

            // Group by merchant for the month (e.g. multiple charges same month)
            const grouped = monthlyTxs.reduce((acc, tx) => {
                const rawName = tx.description || tx.item || tx.category || "Unknown";
                const merchant = normalizeMerchantName(rawName);

                if (!acc[merchant]) acc[merchant] = [];
                acc[merchant].push(tx);
                return acc;
            }, {});

            items = Object.entries(grouped).map(([merchant, txs]) => {
                const totalAmount = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                return {
                    merchant,
                    cost: totalAmount,
                    annualCost: totalAmount * 12, // Projected
                    lastUsed: txs[0].date,
                    transactionCount: txs.length,
                    isLeastUsed: false,
                    type: 'actual'
                };
            });
        }

        // Apply Sorting
        return items.sort((a, b) => {
            switch (sortBy) {
                case "cost-desc": return Math.abs(b.cost) - Math.abs(a.cost);
                case "cost-asc": return Math.abs(a.cost) - Math.abs(b.cost);
                case "activity-desc": return b.transactionCount - a.transactionCount;
                case "activity-asc": return a.transactionCount - b.transactionCount;
                case "name-asc": return a.merchant.localeCompare(b.merchant);
                case "recent-desc":
                    const dateA = a.lastUsed ? new Date(a.lastUsed) : new Date(0);
                    const dateB = b.lastUsed ? new Date(b.lastUsed) : new Date(0);
                    return dateB - dateA;
                default: return Math.abs(b.cost) - Math.abs(a.cost);
            }
        });

    }, [allSubTransactions, selectedMonth, sortBy]);


    // 5. Baseline Metrics (derived from MAIN props, ignoring filter for "Impact" calc)
    // We want impact to always be based on "Average" savings being toggled
    const baselineMetrics = useMemo(() => {
        const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
        const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
        const totalDebtPayments = debts.reduce((acc, d) => acc + (d.monthlyRepayment || 0), 0);
        const monthlySurplus = fullIncome - totalExpenses - totalDebtPayments;

        const maxMonths = debts.length > 0
            ? Math.max(...debts.map(d => {
                const payment = d.monthlyRepayment || 0;
                return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
            })) : 0;

        return { monthlySurplus, monthsToDebtFree: maxMonths < 999 ? maxMonths : null };
    }, [income, transactions, debts]);

    // 6. Simulated Metrics ( Impact Calculation )
    // This needs to know the "Monthly Average Cost" of checked items, regardless of view
    // We need a helper to get average cost of ANY merchant
    const getAverageCost = (merchantName) => {
        const txs = allSubTransactions.filter(t => (t.description || "Unknown") === merchantName);
        if (!txs.length) return 0;
        const total = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return total / Math.max(1, txs.length); // Simplified avg
    };

    const simulatedMetrics = useMemo(() => {
        const canceledAmount = Array.from(canceledSubs).reduce((sum, merchant) => {
            return sum + getAverageCost(merchant);
        }, 0);

        const newSurplus = baselineMetrics.monthlySurplus + canceledAmount;

        // Simple debt payoff recalculation for speed
        const extraPaymentPerDebt = canceledAmount / Math.max(1, debts.length);
        const adjustedDebts = debts.map(d => ({
            ...d,
            monthlyRepayment: (d.monthlyRepayment || 0) + extraPaymentPerDebt
        }));

        const maxMonths = adjustedDebts.length > 0
            ? Math.max(...adjustedDebts.map(d => {
                const payment = d.monthlyRepayment || 0;
                return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
            })) : 0;

        return {
            monthlySurplus: newSurplus,
            monthsToDebtFree: maxMonths < 999 ? maxMonths : null,
            savedFromCancellations: canceledAmount
        };
    }, [canceledSubs, baselineMetrics, debts, allSubTransactions]);


    // Toggle Handler
    const toggleSubscription = (merchant) => {
        setCanceledSubs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(merchant)) newSet.delete(merchant);
            else newSet.add(merchant);
            return newSet;
        });
    };

    // Calculate Totals for Header
    const totalMonthlySpend = displayedSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);
    const surplusDiff = simulatedMetrics.monthlySurplus - baselineMetrics.monthlySurplus;
    const monthsDiff = (baselineMetrics.monthsToDebtFree || 0) - (simulatedMetrics.monthsToDebtFree || 0);

    // Header Controls
    const renderControls = () => (
        <div className="flex flex-wrap gap-2">
            {/* Sort Selector */}
            <div className="bg-surface border border-surface-highlight rounded-lg p-1 flex items-center shadow-surface-sm">
                <Filter className="w-4 h-4 text-content-tertiary ml-2" />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-xs font-medium text-content-primary focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 outline-none"
                >
                    <option value="cost-desc" className="bg-surface">Highest Cost</option>
                    <option value="cost-asc" className="bg-surface">Lowest Cost</option>
                    <option value="activity-desc" className="bg-surface">Most Frequent</option>
                    <option value="activity-asc" className="bg-surface">Least Frequent</option>
                    <option value="recent-desc" className="bg-surface">Recent Activity</option>
                    <option value="name-asc" className="bg-surface">Name: A-Z</option>
                </select>
            </div>

            {/* Month Selector */}
            <div className="bg-surface border border-surface-highlight rounded-lg p-1 flex items-center shadow-surface-sm">
                <Calendar className="w-4 h-4 text-content-tertiary ml-2" />
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent border-none text-xs font-medium text-content-primary focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 outline-none"
                >
                    <option value="all" className="bg-surface">All Time (Average)</option>
                    <option disabled className="bg-surface">──────────</option>
                    {availableMonths.map(m => (
                        <option key={m} value={m} className="bg-surface">
                            {new Date(m + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    if (allSubTransactions.length === 0) {
        return (
            <PageContainer title="Subscription Intelligence" subtitle="Analyze recurring costs">
                <SurfaceCard className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 bg-surface-highlight rounded-full inline-block mb-4">
                        <CreditCard className="w-8 h-8 text-content-tertiary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">No Subscriptions Found</h3>
                    <p className="text-content-secondary">Categorize transactions as 'Subscriptions' to see them here.</p>
                </SurfaceCard>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Subscription Intelligence"
            subtitle="Analyze recurring costs and simulate the impact of cancellations"
            action={renderControls()}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Chart (Spans 8 cols) */}
                <SurfaceCard className="lg:col-span-8 flex flex-col justify-between min-h-[320px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-brand" />
                                Monthly Trend
                            </h3>
                            <div className="text-xs text-content-secondary">
                                Drag across bars or click to filter specific months
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-content-tertiary uppercase tracking-wider font-semibold mb-1">Average Monthly Cost</div>
                            <div className="text-2xl font-bold text-white">${totalMonthlySpend.toFixed(0)}</div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={trendData}
                                onClick={(data) => {
                                    if (data && data.activePayload && data.activePayload[0]) {
                                        const clickedMonth = data.activePayload[0].payload.month;
                                        setSelectedMonth(clickedMonth);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.brand} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor={COLORS.brand} stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis
                                    dataKey="displayDate"
                                    tick={{ fontSize: 11, fill: COLORS.text }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: COLORS.text }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                                    contentStyle={{
                                        backgroundColor: COLORS.tooltipBg,
                                        color: '#fff',
                                        borderRadius: '8px',
                                        border: `1px solid ${COLORS.tooltipBorder}`,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(val) => [`$${val}`, 'Spent']}
                                />
                                <Bar
                                    dataKey="total"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                    fill="url(#colorBar)"
                                    className="hover:opacity-80 transition-opacity duration-200"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SurfaceCard>

                {/* Impact Stats (Spans 4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <SurfaceCard className="flex-1 group hover:border-brand/40 transition-all">
                        <div className="relative z-10">
                            <div className="text-brand text-xs font-bold uppercase tracking-wider mb-2">Simulated Annual Savings</div>
                            <div className="text-4xl font-bold text-white mb-2">
                                ${Math.round(surplusDiff * 12).toLocaleString()}
                            </div>
                            <p className="text-sm text-content-secondary leading-relaxed">
                                {surplusDiff > 0
                                    ? "Potential extra cash per year if selected items are canceled."
                                    : "Select subscriptions from the list below to simulate savings."}
                            </p>
                        </div>
                    </SurfaceCard>

                    <SurfaceCard className="flex-1 group hover:border-accent/40 transition-all">
                        <div className="relative z-10">
                            <div className="text-accent text-xs font-bold uppercase tracking-wider mb-2">Debt-Free Acceleration</div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <div className="text-4xl font-bold text-white">
                                    {monthsDiff > 0 ? `${monthsDiff}` : "0"}
                                </div>
                                <div className="text-lg text-content-secondary">Months</div>
                            </div>
                            <p className="text-sm text-content-secondary leading-relaxed">
                                {monthsDiff > 0
                                    ? "Sooner you could be debt-free by reinvesting these savings."
                                    : "Redirecting subscription costs to debt repayment accelerates freedom."}
                            </p>
                        </div>
                    </SurfaceCard>
                </div>

            </div>

            {/* --- 3. Subscription List --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-content-secondary font-semibold uppercase text-xs tracking-wider ml-2">
                        {selectedMonth === 'all' ? 'Active Subscriptions (Avg)' : `Transactions in ${selectedMonth}`}
                    </h3>
                    <div className="text-xs text-content-tertiary">
                        {displayedSubscriptions.length} item{displayedSubscriptions.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedSubscriptions.map((sub) => {
                        const isCanceled = canceledSubs.has(sub.merchant);

                        return (
                            <SurfaceCard
                                key={`${sub.merchant}-${selectedMonth}`}
                                className={`!p-4 hover:border-surface-highlight transition-all cursor-default ${isCanceled ? 'bg-danger/5 border-danger/20' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg ${isCanceled ? 'bg-danger/10 text-danger' : 'bg-surface-highlight text-content-primary'} transition-colors`}>
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={`font-medium text-base ${isCanceled ? 'text-content-tertiary line-through' : 'text-white'}`}>
                                                {sub.merchant}
                                            </div>
                                            <div className="text-[10px] text-content-tertiary uppercase tracking-wider font-semibold mt-0.5">
                                                {sub.transactionCount} Transaction{sub.transactionCount !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono font-bold text-lg ${isCanceled ? 'text-content-tertiary' : 'text-white'}`}>
                                            ${sub.cost.toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-content-tertiary uppercase">
                                            {selectedMonth === 'all' ? '/mo avg' : 'total'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-highlight">
                                    <div className="flex items-center gap-2 text-xs text-content-secondary">
                                        <Calendar className="w-3 h-3 text-content-tertiary" />
                                        {sub.lastUsed ? new Date(sub.lastUsed).toLocaleDateString() : 'N/A'}
                                    </div>

                                    <button
                                        onClick={() => toggleSubscription(sub.merchant)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${isCanceled
                                            ? 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20'
                                            : 'bg-surface-highlight text-content-secondary hover:text-white hover:bg-surface-active border border-surface-highlight'
                                            }`}
                                    >
                                        {isCanceled ? (
                                            <>
                                                <CheckCircle2 className="w-3 h-3" /> Restore
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="w-3 h-3" /> Cancel
                                            </>
                                        )}
                                    </button>
                                </div>
                            </SurfaceCard>
                        );
                    })}
                </div>
            </div>
        </PageContainer>
    );
}

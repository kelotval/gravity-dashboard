import React, { useMemo, useState } from "react";
import { CreditCard, TrendingDown, Zap, Calendar, Sparkles, Filter, BarChart3, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// --- Shared Glass Component (inline to ensure self-containment) ---
const GlassCard = ({ children, className = '' }) => (
    <div className={`relative bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden ${className}`}>
        {/* Subtle gradient blob for atmosphere */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

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

    // Color helpers for gradient chart
    const getBarGradient = (index) => {
        return `url(#colorBar)`;
    };


    if (allSubTransactions.length === 0) {
        return (
            <div className="min-h-screen bg-[#0B0E14] text-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="p-4 bg-gray-800 rounded-full inline-block mb-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Subscriptions Found</h3>
                    <p className="text-gray-400">Categorize transactions as 'Subscriptions' to see them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white p-3 sm:p-6 space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- 1. Header & Controls --- */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3 mb-1">
                            Subscription Intelligence
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Analyze recurring costs and simulate the impact of cancellations
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Sort Selector */}
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-1 flex items-center">
                            <Filter className="w-4 h-4 text-gray-500 ml-2" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-xs font-medium text-gray-300 focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 outline-none"
                            >
                                <option value="cost-desc" className="bg-gray-800">Highest Cost</option>
                                <option value="cost-asc" className="bg-gray-800">Lowest Cost</option>
                                <option value="activity-desc" className="bg-gray-800">Most Frequent</option>
                                <option value="activity-asc" className="bg-gray-800">Least Frequent</option>
                                <option value="recent-desc" className="bg-gray-800">Recent Activity</option>
                                <option value="name-asc" className="bg-gray-800">Name: A-Z</option>
                            </select>
                        </div>

                        {/* Month Selector */}
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-1 flex items-center">
                            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none text-xs font-medium text-gray-300 focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 outline-none"
                            >
                                <option value="all" className="bg-gray-800">All Time (Average)</option>
                                <option disabled className="bg-gray-800">──────────</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m} className="bg-gray-800">
                                        {new Date(m + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {/* --- 2. Chart & Key Metrics Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Chart (Spans 8 cols) */}
                    <GlassCard className="lg:col-span-8 flex flex-col justify-between min-h-[320px]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                                    Monthly Trend
                                </h3>
                                <div className="text-xs text-gray-500">
                                    Drag across bars or click to filter specific months
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Average Monthly Cost</div>
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
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#c084fc" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                                    <XAxis
                                        dataKey="displayDate"
                                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#374151', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '12px', border: '1px solid #374151', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(val) => [`$${val}`, 'Spent']}
                                    />
                                    <Bar
                                        dataKey="total"
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                        fill="url(#colorBar)"
                                        className="hover:opacity-80 transition-opacity duration-300"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Impact Stats (Spans 4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <GlassCard className="flex-1 !bg-gradient-to-br !from-indigo-600/20 !to-blue-600/20 !border-indigo-500/30 group hover:!border-indigo-500/50 transition-all">
                            <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Simulated Annual Savings</div>
                            <div className="text-4xl font-extrabold text-white mb-2">
                                ${Math.round(surplusDiff * 12).toLocaleString()}
                            </div>
                            <p className="text-sm text-indigo-200/70 leading-relaxed">
                                {surplusDiff > 0
                                    ? "Potential extra cash per year if selected items are canceled."
                                    : "Select subscriptions from the list below to simulate savings."}
                            </p>
                        </GlassCard>

                        <GlassCard className="flex-1 !bg-gradient-to-br !from-purple-600/20 !to-pink-600/20 !border-purple-500/30 group hover:!border-purple-500/50 transition-all">
                            <div className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Debt-Free Acceleration</div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <div className="text-4xl font-extrabold text-white">
                                    {monthsDiff > 0 ? `${monthsDiff}` : "0"}
                                </div>
                                <div className="text-lg text-purple-200">Months</div>
                            </div>
                            <p className="text-sm text-purple-200/70 leading-relaxed">
                                {monthsDiff > 0
                                    ? "Sooner you could be debt-free by reinvesting these savings."
                                    : "Redirecting subscription costs to debt repayment accelerates freedom."}
                            </p>
                        </GlassCard>
                    </div>

                </div>

                {/* --- 3. Subscription List --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider ml-2">
                            {selectedMonth === 'all' ? 'Active Subscriptions (Avg)' : `Transactions in ${selectedMonth}`}
                        </h3>
                        <div className="text-xs text-gray-500">
                            {displayedSubscriptions.length} item{displayedSubscriptions.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedSubscriptions.map((sub) => {
                            const isCanceled = canceledSubs.has(sub.merchant);

                            return (
                                <GlassCard
                                    key={`${sub.merchant}-${selectedMonth}`}
                                    className={`!p-4 hover:border-white/20 transition-all group cursor-default ${isCanceled ? '!bg-red-500/10 !border-red-500/30' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${isCanceled ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300'} transition-colors`}>
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className={`font-bold text-base ${isCanceled ? 'text-gray-400 line-through' : 'text-white'}`}>
                                                    {sub.merchant}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-0.5">
                                                    {sub.transactionCount} Transaction{sub.transactionCount !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-mono font-bold text-lg ${isCanceled ? 'text-gray-500' : 'text-white'}`}>
                                                ${sub.cost.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] text-gray-500 uppercase">
                                                {selectedMonth === 'all' ? '/mo avg' : 'total'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar className="w-3 h-3 text-gray-600" />
                                            {sub.lastUsed ? new Date(sub.lastUsed).toLocaleDateString() : 'N/A'}
                                        </div>

                                        <button
                                            onClick={() => toggleSubscription(sub.merchant)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${isCanceled
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-transparent'
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
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}

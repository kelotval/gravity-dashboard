import React, { useMemo, useState } from "react";
import { CreditCard, TrendingDown, Zap, Info, Calendar, DollarSign, Sparkles, AlertCircle, CheckCircle2, BarChart3, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyTotals[key] = 0;
        }

        allSubTransactions.forEach(tx => {
            if (!tx.date) return;
            const monthKey = tx.date.substring(0, 7);
            if (monthlyTotals.hasOwnProperty(monthKey) || monthKey >= Object.keys(monthlyTotals).sort()[0]) {
                monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + tx.amount;
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


    // 4. Filter Transactions for View
    const displayedSubscriptions = useMemo(() => {
        let items = [];

        // If "All Time" selected, use average logic
        if (selectedMonth === "all") {
            const grouped = allSubTransactions.reduce((acc, tx) => {
                const merchant = tx.description || "Unknown";
                if (!acc[merchant]) acc[merchant] = [];
                acc[merchant].push(tx);
                return acc;
            }, {});

            items = Object.entries(grouped).map(([merchant, txs]) => {
                const totalSpent = txs.reduce((sum, tx) => sum + tx.amount, 0);
                const avgMonthly = totalSpent / Math.max(1, txs.length); // Use simple avg for now, or improve denominator
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
                const merchant = tx.description || "Unknown";
                if (!acc[merchant]) acc[merchant] = [];
                acc[merchant].push(tx);
                return acc;
            }, {});

            items = Object.entries(grouped).map(([merchant, txs]) => {
                const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0);
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
                case "cost-desc": return Math.abs(b.cost) - Math.abs(a.cost); // Highest magnitude first
                case "cost-asc": return Math.abs(a.cost) - Math.abs(b.cost);  // Lowest magnitude first
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

        const debtFreeDate = new Date();
        debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

        return { monthlySurplus, monthsToDebtFree: maxMonths < 999 ? maxMonths : null };
    }, [income, transactions, debts]);

    // 6. Simulated Metrics ( Impact Calculation )
    // This needs to know the "Monthly Average Cost" of checked items, regardless of view
    // We need a helper to get average cost of ANY merchant
    const getAverageCost = (merchantName) => {
        const txs = allSubTransactions.filter(t => (t.description || "Unknown") === merchantName);
        if (!txs.length) return 0;
        const total = txs.reduce((sum, t) => sum + t.amount, 0);
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
    const totalAnnualSpend = displayedSubscriptions.reduce((sum, sub) => sum + sub.annualCost, 0);
    const surplusDiff = simulatedMetrics.monthlySurplus - baselineMetrics.monthlySurplus;
    const monthsDiff = (baselineMetrics.monthsToDebtFree || 0) - (simulatedMetrics.monthsToDebtFree || 0);


    if (allSubTransactions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
                <div className="text-center">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Subscriptions Found</h3>
                    <p className="text-gray-500">Categorize transactions as 'Subscriptions' to see them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ... (Header) ... */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-blue-600" />
                            Subscription Intelligence
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Track recurring costs and simulate savings
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort Selector */}
                        <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
                            <Filter className="w-4 h-4 text-gray-400 ml-2" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium text-gray-900 dark:text-white focus:ring-0 cursor-pointer py-2 pl-2 pr-2"
                            >
                                <option value="cost-desc" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Highest Cost</option>
                                <option value="cost-asc" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Lowest Cost</option>
                                <option value="activity-desc" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Most Frequent</option>
                                <option value="activity-asc" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Least Frequent</option>
                                <option value="recent-desc" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Recent Activity</option>
                                <option value="name-asc" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Name: A-Z</option>
                            </select>
                        </div>

                        {/* Month Selector */}
                        <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 ml-2" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium text-gray-900 dark:text-white focus:ring-0 cursor-pointer py-2 pl-2 pr-8"
                            >
                                <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Time (Average)</option>
                                <option disabled className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">──────────</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                        {new Date(m + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Trends Chart (Interactive) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                        Monthly Subscription Trend <span className="text-xs font-normal text-gray-500 ml-2">(Click bar to filter)</span>
                    </h3>
                    <div className="h-48 w-full">
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
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis
                                    dataKey="displayDate"
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val) => [`$${val}`, 'Spent']}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* 3. Impact Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
                        <div className="text-indigo-100 text-xs font-bold uppercase mb-1">Potential Yearly Savings</div>
                        <div className="text-3xl font-bold mb-1">${Math.round(surplusDiff * 12).toLocaleString()}</div>
                        <div className="text-sm text-indigo-100">
                            {surplusDiff > 0 ? "Extra cash if canceled" : "Select items below to simulate"}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                        <div className="text-violet-100 text-xs font-bold uppercase mb-1">Debt-Free Acceleration</div>
                        <div className="text-3xl font-bold mb-1">
                            {monthsDiff > 0 ? `${monthsDiff} Months` : "No Change"}
                        </div>
                        <div className="text-sm text-violet-100">
                            {monthsDiff > 0 ? "Sooner to be debt free!" : "Redirect savings to debt"}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">
                            {selectedMonth === 'all' ? 'Avg Monthly Spend' : 'Total Spend This Month'}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            ${totalMonthlySpend.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-500">
                            {selectedMonth === 'all' ? 'Based on historical average' : `For ${selectedMonth}`}
                        </div>
                    </div>
                </div>

                {/* 4. Subscription List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-gray-500" />
                            {selectedMonth === 'all' ? 'Active Subscriptions' : `Transactions in ${selectedMonth}`}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {displayedSubscriptions.length} item{displayedSubscriptions.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {displayedSubscriptions.map((sub) => {
                            const isCanceled = canceledSubs.has(sub.merchant);

                            return (
                                <div
                                    key={`${sub.merchant}-${selectedMonth}`}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group ${isCanceled ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${isCanceled ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} dark:bg-gray-700 dark:text-blue-400`}>
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-gray-900 dark:text-white ${isCanceled ? 'line-through text-gray-500' : ''}`}>
                                                {sub.merchant}
                                            </h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <span>{sub.transactionCount} txs</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Last: {sub.lastUsed ? new Date(sub.lastUsed).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                ${sub.cost.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {selectedMonth === 'all' ? '/mo avg' : 'total'}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleSubscription(sub.merchant)}
                                            className={`p-2 rounded-lg transition-colors ${isCanceled
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700'
                                                }`}
                                            title={isCanceled ? "Restore subscription" : "Simulate cancellation"}
                                        >
                                            {isCanceled ? <CheckCircle2 className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

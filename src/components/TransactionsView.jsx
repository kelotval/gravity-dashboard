import React, { useState, useMemo } from "react";
import { Layers, Filter, RefreshCw, Calendar, Plus, Search, Upload } from "lucide-react";
import { PageContainer } from "./common/PageContainer";
import { SurfaceCard } from "./common/SurfaceCard";
import TransactionList from "./TransactionList";
import AmexCsvImport from "./AmexCsvImport";
import { parseAmount } from "../utils/transactionHelpers";

export default function TransactionsView({
    transactions,
    activeTransactionsAll,
    activePeriodKey,
    setActivePeriodKey,
    accountingTotals,
    netSpend,
    onDelete,
    onEdit,
    onNew,
    onImport,
    reapplyCategorization,
    forceReapplyCategorization,
    onManageFixed,
    searchQuery,
    setSearchQuery
}) {
    const [sourceFilter, setSourceFilter] = useState("all");
    const [showImport, setShowImport] = useState(false);

    // --- Filter Logic (Moved from App.jsx) ---
    const filteredTransactions = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === "") {
            // Default view: Active month only if no search
            // App passed activeTransactionsAll which is ALREADY filtered by activePeriodKey

            // BUT wait, if we have a source filter, we need to filter activeTransactionsAll too
            if (sourceFilter !== 'all') {
                return activeTransactionsAll.filter(tx => {
                    if (sourceFilter === "amex") return tx.source === "amex" || tx.source === "amex_csv" || !tx.source;
                    if (sourceFilter === "manual") return tx.source === "manual" || tx.isRecurring || tx.isVirtual;
                    return true;
                });
            }
            return activeTransactionsAll;
        }

        const query = searchQuery.toLowerCase().trim();
        let baseList = activeTransactionsAll;

        // Verify source filter behavior with global search
        // App.jsx logic: "If searching, we search ALL transactions (global search)"
        // So we should use `transactions` (all) instead of `activeTransactionsAll` when searching

        if (query) {
            baseList = transactions;
        }

        // Apply Source Filter
        if (sourceFilter !== 'all') {
            baseList = baseList.filter(tx => {
                if (sourceFilter === "amex") return tx.source === "amex" || tx.source === "amex_csv" || !tx.source;
                if (sourceFilter === "manual") return tx.source === "manual" || tx.isRecurring || tx.isVirtual;
                return true;
            });
        }

        if (!query) return baseList; // Should be covered by first check, but for safety

        return baseList.filter(tx => {
            // Category filter: cat:groceries
            if (query.startsWith("cat:")) {
                const catSearch = query.substring(4).trim();
                return tx.category && tx.category.toLowerCase().includes(catSearch);
            }

            // Amount greater than: amt>100
            if (query.startsWith("amt>")) {
                const amtThreshold = parseFloat(query.substring(4));
                const amt = Math.abs(parseAmount(tx.amount));
                return Number.isFinite(amtThreshold) && amt > amtThreshold;
            }

            // Amount less than: amt<50
            if (query.startsWith("amt<")) {
                const amtThreshold = parseFloat(query.substring(4));
                const amt = Math.abs(parseAmount(tx.amount));
                return Number.isFinite(amtThreshold) && amt < amtThreshold;
            }

            // Date filter: date:2026-01 (matches YYYY-MM)
            if (query.startsWith("date:")) {
                const dateSearch = query.substring(5).trim();
                return tx.date && tx.date.startsWith(dateSearch);
            }

            // Text search: match item, description, merchant, category, reference
            const searchText = query;
            return (
                (tx.item && tx.item.toLowerCase().includes(searchText)) ||
                (tx.description && tx.description.toLowerCase().includes(searchText)) ||
                (tx.merchant && tx.merchant.toLowerCase().includes(searchText)) ||
                (tx.category && tx.category.toLowerCase().includes(searchText)) ||
                (tx.reference && tx.reference.toLowerCase().includes(searchText))
            );
        });
    }, [transactions, activeTransactionsAll, searchQuery, sourceFilter]);

    // Helper to get available periods
    const availablePeriods = useMemo(() => {
        const periods = new Set(transactions.map(t => {
            if (t.periodKey) return t.periodKey;
            if (t.date && typeof t.date === 'string') return t.date.substring(0, 7);
            return null;
        }));
        return [...periods].filter(Boolean).sort().reverse();
    }, [transactions]);

    // Helper function for getPeriodKey (replicated simple logic or assume periodKey exists)
    // App.jsx used getPeriodKey helper. We can just use the property since we are reading it.

    return (
        <PageContainer title="Transactions" subtitle="Manage your spending and categorise import data.">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">

                {/* Period Selector */}
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-gray-500" />
                        <select
                            value={activePeriodKey}
                            onChange={(e) => setActivePeriodKey(e.target.value)}
                            className="appearance-none bg-white/5 border border-white/10 text-white pl-4 pr-10 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-colors cursor-pointer"
                        >
                            {availablePeriods.map(m => (
                                <option key={m} value={m}>{m} {m === new Date().toISOString().substring(0, 7) ? '(Current)' : ''}</option>
                            ))}
                            {!availablePeriods.includes(activePeriodKey) && activePeriodKey && (
                                <option value={activePeriodKey}>{activePeriodKey}</option>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <span className="text-xs">▼</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {/* Source Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="appearance-none bg-white/5 border border-white/10 text-white pl-3 pr-8 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-colors cursor-pointer"
                        >
                            <option value="all">All Sources</option>
                            <option value="amex">Amex Only</option>
                            <option value="manual">Manual Only</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <Filter className="w-3 h-3" />
                        </div>
                    </div>

                    <button
                        onClick={reapplyCategorization}
                        className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-sm"
                        title="Rescan uncategorized transactions only (preserves manual categories)"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Rescan
                    </button>

                    <button
                        onClick={forceReapplyCategorization}
                        className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium shadow-sm"
                        title="⚠️ Overwrites ALL categories including manual ones"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Force
                    </button>

                    <button
                        onClick={onManageFixed}
                        className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
                    >
                        <Calendar className="w-4 h-4 mr-2" /> Fixed
                    </button>

                    <button
                        onClick={() => setShowImport(!showImport)}
                        className={`flex items-center px-3 py-2 ${showImport ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition text-sm font-medium shadow-sm`}
                    >
                        <Upload className="w-4 h-4 mr-2" /> {showImport ? 'Hide' : 'Import'}
                    </button>

                    <button
                        onClick={onNew}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </button>
                </div>
            </div>

            {/* Import Section - Collapsible */}
            {showImport && (
                <div className="mb-6">
                    <AmexCsvImport onImport={onImport} />
                </div>
            )}

            {/* Search Box */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search transactions... (try: cat:groceries, amt>100, date:2026-01)"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>

            {/* Search Feedback */}
            {searchQuery && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {filteredTransactions.length === 0 ? (
                            <span className="font-medium">No transactions found matching "{searchQuery}"</span>
                        ) : (
                            <>
                                Found <span className="font-bold text-blue-600 dark:text-blue-400">{filteredTransactions.length}</span> transaction{filteredTransactions.length !== 1 ? 's' : ''} matching "{searchQuery}"
                                {filteredTransactions.length !== transactions.length && (
                                    <span className="text-gray-500 dark:text-gray-400"> (of {transactions.length} total)</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Accounting Sanity Check */}
            <SurfaceCard className="mb-6">
                <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3 text-xs">Accounting Check ({activePeriodKey})</h4>
                <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                        <span className="block text-gray-400 text-xs mb-1">Purchases (Gross)</span>
                        <span className="font-mono text-white">${accountingTotals.grossSpend.toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 text-xs mb-1">Refunds</span>
                        <span className="font-mono text-emerald-400">-${accountingTotals.refundCredits.toLocaleString()}</span>
                    </div>
                    <div className="border-l pl-4 border-white/10">
                        <span className="block text-gray-400 text-xs mb-1">Net Spend</span>
                        <span className="font-mono font-bold text-white">${netSpend.toLocaleString()}</span>
                    </div>
                    <div className="border-l pl-4 border-white/10">
                        <span className="block text-gray-400 text-xs mb-1">Card Payments</span>
                        <span className="font-mono text-white">${accountingTotals.payments.toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 text-xs mb-1">Other Transfers</span>
                        <span className="font-mono text-white">${accountingTotals.transfers.toLocaleString()}</span>
                    </div>
                </div>
                {/* Warning: High payments but low purchases */}
                {(accountingTotals.payments > 1000 && accountingTotals.grossSpend < 200) && (
                    <div className="mt-3 text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded text-xs inline-block">
                        ⚠️ High card payments but low purchases. Did you import the Credit Card statement itself?
                    </div>
                )}
            </SurfaceCard>

            {/* Transaction List */}
            <TransactionList
                transactions={filteredTransactions}
                onDelete={onDelete}
                onEdit={onEdit}
                groupByCategory={true}
                hideSearch={true}
            />

        </PageContainer>
    );
}

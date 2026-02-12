import React, { useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight, Coffee, Home, Zap, Heart, Smartphone, Scissors, Monitor, Trash2, Pencil, CreditCard, Search, X, ShoppingBasket, Tag, Fuel, Utensils, Edit3, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./common/GlassCard";

// Helper to deterministically pick a color for a string
const getColorForCategory = (category) => {
    const colors = [
        "bg-blue-100 text-blue-600",
        "bg-emerald-100 text-emerald-600",
        "bg-orange-100 text-orange-600",
        "bg-yellow-100 text-yellow-600",
        "bg-red-100 text-red-600",
        "bg-green-100 text-green-600",
        "bg-purple-100 text-purple-600",
        "bg-pink-100 text-pink-600",
        "bg-indigo-100 text-indigo-600",
        "bg-teal-100 text-teal-600",
        "bg-cyan-100 text-cyan-600",
        "bg-lime-100 text-lime-600",
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getCategoryIcon = (category) => {
    const lower = category.toLowerCase();

    // Map known ones
    if (lower === "housing") return Home;
    if (lower === "groceries") return ShoppingBasket;
    if (lower === "food") return Coffee; // Keep generic food/coffee
    if (lower === "dining out") return Utensils;
    if (lower === "coffee") return Coffee;
    if (lower === "fuel") return Fuel;
    if (lower === "utilities") return Zap;
    if (lower === "health") return Heart;
    if (lower === "transport") return Smartphone; // or Car/Bus if available in lucide-react standard set
    if (lower === "personal") return Scissors;
    if (lower === "subscriptions") return Monitor;
    if (lower === "debt") return ArrowUpRight;
    if (lower === "credit card") return CreditCard;

    // Default for unknown maps
    return Tag;
};

export default function TransactionList({ transactions, onDelete, onEdit, groupByCategory = false, title = "Recent Transactions", hideSearch = false, headerAction = null }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceFilter, setSourceFilter] = useState("all"); // all, amex, manual

    const filteredTransactions = transactions.filter(tx => {
        // Search filter
        const matchesSearch = (tx.item && tx.item.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()));

        // Source filter
        let matchesSource = true;
        if (sourceFilter === "amex") {
            matchesSource = tx.source === "amex" || tx.source === "amex_csv" || !tx.source;
        } else if (sourceFilter === "manual") {
            matchesSource = tx.source === "manual" || tx.isRecurring || tx.isVirtual;
        }

        return matchesSearch && matchesSource;
    });

    const clearSearch = () => setSearchTerm("");

    const SearchBar = () => (
        <div className="relative mb-6 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm backdrop-blur-md"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );

    if (groupByCategory) {
        const grouped = filteredTransactions.reduce((acc, tx) => {
            if (!acc[tx.category]) acc[tx.category] = [];
            acc[tx.category].push(tx);
            return acc;
        }, {});

        // Sort: Uncategorized always last, others by count (ascending), then alphabetical
        const sortedEntries = Object.entries(grouped).sort(([catA, txsA], [catB, txsB]) => {
            // Special case: Always put "Uncategorized" last
            if (catA === "Uncategorized") return 1;
            if (catB === "Uncategorized") return -1;

            // Primary Sort: Count (Ascending)
            const countDiff = txsA.length - txsB.length;
            if (countDiff !== 0) return countDiff;

            // Secondary Sort: Alphabetical
            return catA.localeCompare(catB);
        });

        const isEmpty = filteredTransactions.length === 0;

        return (
            <div>
                {!hideSearch && <SearchBar />}

                {isEmpty && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-gray-500 dark:text-gray-400"
                    >
                        No transactions found matching "{searchTerm}"
                    </motion.div>
                )}

                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {sortedEntries.map(([category, txs]) => {
                            const Icon = getCategoryIcon(category);
                            const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={category}
                                    className="h-full"
                                >
                                    <GlassCard className="h-full flex flex-col !p-0">
                                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx("p-2 rounded-lg", getColorForCategory(category))}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-white">{category}</h3>
                                            </div>
                                            <span className="font-semibold text-white">${totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="divide-y divide-white/5 flex-1 p-0">
                                            <AnimatePresence>
                                                {txs.map(tx => (
                                                    <motion.div
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        key={tx.id}
                                                        className="p-3 hover:bg-white/5 transition-colors flex items-center justify-between group text-sm"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <p className="font-medium truncate text-white">{tx.item}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date || Date.now()).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {(tx.source === "manual" || tx.isRecurring) && (
                                                                <div title="Manual Entry" className="mr-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                                                                    MANUAL
                                                                </div>
                                                            )}
                                                            {(tx.source === "amex" || tx.source === "amex_csv" || (!tx.source && !tx.isRecurring)) && (
                                                                <div title="Imported from AMEX" className="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                                    <CreditCard className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                            <span className="font-medium text-white">${tx.amount.toLocaleString()}</span>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {onEdit && (
                                                                    <button onClick={() => onEdit(tx)} className="p-1 text-gray-400 hover:text-blue-500 rounded">
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                {onDelete && (
                                                                    <button onClick={() => onDelete(tx.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    }

    return (
        <GlassCard className="h-full flex flex-col !p-0">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 flex justify-between items-center sm:block">
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h3 className="text-lg font-bold text-white">{title}</h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{filteredTransactions.length} items</span>
                            </div>
                            {headerAction && <div className="ml-4">{headerAction}</div>}
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

                    {/* Search */}
                    {!hideSearch && (
                        <div className="relative flex-1 sm:flex-initial w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-9 pr-8 py-2 text-sm border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Source Filter */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 text-sm border border-white/10 rounded-lg bg-surface text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none"
                        >
                            <option value="all">All Sources</option>
                            <option value="amex">Amex Only</option>
                            <option value="manual">Manual Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                <motion.div layout className="divide-y divide-gray-100 dark:divide-white/5">
                    <AnimatePresence>
                        {filteredTransactions.map((tx) => {
                            const Icon = getCategoryIcon(tx.category);
                            const colorClass = getColorForCategory(tx.category);

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, padding: 0 }}
                                    key={tx.id}
                                    className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className={clsx("p-2 rounded-full", colorClass)}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </motion.div>
                                        <div>
                                            <p className="font-medium text-white">{tx.item}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{tx.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-white">${tx.amount.toLocaleString()}</span>
                                        <div className="flex items-center gap-1">
                                            {(tx.source === "manual" || tx.isRecurring) ? (
                                                <div title="Manual Entry" className="mr-2 flex items-center gap-1">
                                                    <div className="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                                                        <Edit3 className="w-4 h-4" />
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded">
                                                        MANUAL
                                                    </span>
                                                </div>
                                            ) : (tx.source === "amex" || tx.source === "amex_csv" || !tx.source) && (
                                                <div title="Imported from AMEX" className="mr-2 p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                    <CreditCard className="w-4 h-4" />
                                                </div>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(tx)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all dark:hover:bg-blue-900/30"
                                                    title="Edit Transaction"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(tx.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all dark:hover:bg-red-900/30"
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {filteredTransactions.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No transactions found
                        </div>
                    )}
                </motion.div>
            </div>
        </GlassCard>
    );
}

import React, { useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight, Coffee, Home, Zap, Heart, Smartphone, Scissors, Monitor, Trash2, Pencil, CreditCard, Search, X, ShoppingBasket, Tag, Fuel, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const filteredTransactions = transactions.filter(tx =>
        tx.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearSearch = () => setSearchTerm("");

    const SearchBar = () => (
        <div className="relative mb-6 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
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
        // ... (Keep existing groupByCategory logic mostly same, but maybe ignore widget props for now as it's full page)
        const grouped = filteredTransactions.reduce((acc, tx) => {
            if (!acc[tx.category]) acc[tx.category] = [];
            acc[tx.category].push(tx);
            return acc;
        }, {});

        // Sort: Uncategorized last, then alphabetical
        const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
            if (a === "Uncategorized") return 1;
            if (b === "Uncategorized") return -1;
            return a.localeCompare(b);
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
                {/* ... Rest of grouped view ... */}
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
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full"
                                >
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("p-2 rounded-lg", getColorForCategory(category))}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{category}</h3>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">${totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700 flex-1">
                                        <AnimatePresence>
                                            {txs.map(tx => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    key={tx.id}
                                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group text-sm"
                                                >
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className="font-medium text-gray-900 truncate dark:text-white">{tx.item}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date || Date.now()).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {tx.source === 'amex_csv' && (
                                                            <div title="Imported from AMEX" className="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                                <CreditCard className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-900 dark:text-gray-200">${tx.amount.toLocaleString()}</span>
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
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 flex justify-between items-center sm:block">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredTransactions.length} items</span>
                        </div>
                        {headerAction && <div className="ml-4">{headerAction}</div>}
                    </div>
                </div>

                {/* Embedded Search for List View */}
                {!hideSearch && (
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:bg-gray-900 dark:border-gray-600 dark:text-white"
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
            </div>

            <motion.div layout className="divide-y divide-gray-100 dark:divide-gray-700">
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
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className={clsx("p-2 rounded-full", colorClass)}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </motion.div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{tx.item}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{tx.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-900 dark:text-white">${tx.amount.toLocaleString()}</span>
                                    <div className="flex items-center gap-1">
                                        {tx.source === 'amex_csv' && (
                                            <div title="Imported from AMEX" className="mr-2 p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                <CreditCard className="w-3 h-3" />
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
    );
}

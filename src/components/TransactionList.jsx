import React from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight, Coffee, Home, Zap, Heart, Smartphone, Scissors, Monitor, Trash2, Pencil, CreditCard } from "lucide-react";

const CATEGORY_ICONS = {
    Housing: Home,
    Food: Coffee,
    Utilities: Zap,
    Health: Heart,
    Transport: Smartphone,
    Personal: Scissors,
    Subscriptions: Monitor,
    Debt: ArrowUpRight,
    "Credit Card": CreditCard,
};

const CATEGORY_COLORS = {
    Housing: "bg-blue-100 text-blue-600",
    Food: "bg-orange-100 text-orange-600",
    Utilities: "bg-yellow-100 text-yellow-600",
    Health: "bg-red-100 text-red-600",
    Transport: "bg-green-100 text-green-600",
    Personal: "bg-purple-100 text-purple-600",
    Subscriptions: "bg-pink-100 text-pink-600",
    Debt: "bg-gray-100 text-gray-600",
    "Credit Card": "bg-indigo-100 text-indigo-600",
};

export default function TransactionList({ transactions, onDelete, onEdit, groupByCategory = false }) {
    if (groupByCategory) {
        const grouped = transactions.reduce((acc, tx) => {
            if (!acc[tx.category]) acc[tx.category] = [];
            acc[tx.category].push(tx);
            return acc;
        }, {});

        // Sort categories by some logic? Maybe just Object.keys or specific order.
        // Let's use the order from CATEGORY_ICONS keys if possible, or just alphabetical.
        // But the user might want to see mostly used ones. Let's just iterate object entries.

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(grouped).map(([category, txs]) => {
                    const Icon = CATEGORY_ICONS[category] || ArrowDownRight;
                    const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);

                    return (
                        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("p-2 rounded-lg", CATEGORY_COLORS[category] || "bg-gray-100 text-gray-600")}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{category}</h3>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">${totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700 flex-1">
                                {txs.map(tx => (
                                    <div key={tx.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group text-sm">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="font-medium text-gray-900 truncate dark:text-white">{tx.item}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()} {/* Placeholder date if not in data */}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{transactions.length} items</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.map((tx) => {
                    const Icon = CATEGORY_ICONS[tx.category] || ArrowDownRight;
                    const colorClass = CATEGORY_COLORS[tx.category] || "bg-gray-100 text-gray-600";

                    return (
                        <div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className={clsx("p-2 rounded-full", colorClass)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{tx.item}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(tx)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Edit Transaction"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(tx.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete Transaction"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import React from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight, Coffee, Home, Zap, Heart, Smartphone, Scissors, Monitor, Trash2, Pencil } from "lucide-react";

const CATEGORY_ICONS = {
    Housing: Home,
    Food: Coffee,
    Utilities: Zap,
    Health: Heart,
    Transport: Smartphone,
    Personal: Scissors,
    Subscriptions: Monitor,
    Debt: ArrowUpRight,
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
};

export default function TransactionList({ transactions, onDelete, onEdit }) {
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

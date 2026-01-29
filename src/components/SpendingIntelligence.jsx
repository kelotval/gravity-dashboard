import React, { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight, Coffee, Home, Zap, Monitor, Smartphone, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

// Helpers
const CATEGORY_ICONS = {
    Housing: Home,
    Food: Coffee,
    Utilities: Zap,
    Transport: Smartphone,
    Subscriptions: Monitor,
};

const CATEGORY_COLORS = {
    Housing: "text-blue-600 bg-blue-50",
    Food: "text-orange-600 bg-orange-50",
    Utilities: "text-yellow-600 bg-yellow-50",
    Transport: "text-green-600 bg-green-50",
    Subscriptions: "text-pink-600 bg-pink-50",
};

// Simulated Trend Generator
const generateTrendData = (baseValue, volatility = 0.2) => {
    return Array.from({ length: 15 }, (_, i) => ({
        value: baseValue * (1 + (Math.random() - 0.5) * volatility)
    }));
};

export default function SpendingIntelligence({ transactions }) {
    // 1. Prepare Trend Data
    const trends = useMemo(() => {
        const cats = ["Housing", "Food", "Utilities", "Subscriptions"]; // Top 4 for demo
        return cats.map(cat => {
            const txs = transactions.filter(t => t.category === cat);
            const total = txs.reduce((sum, t) => sum + t.amount, 0);
            return {
                category: cat,
                total,
                data: generateTrendData(total / 4), // simulate weekly avg
                icon: CATEGORY_ICONS[cat] || Home,
                color: CATEGORY_COLORS[cat] || "text-gray-600 bg-gray-50",
                change: Math.floor(Math.random() * 20) - 5 // Random % change
            };
        });
    }, [transactions]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/30">
                        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Spending Intelligence</h3>
                </div>
                <button className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    Customize
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700 h-full">

                {/* COL 1: Category Trends */}
                <div className="p-6 space-y-5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 mb-4">Category Trends</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {trends.map((trend, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={trend.category}
                                className="flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${trend.color} dark:bg-opacity-20`}>
                                        <trend.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{trend.category}</p>
                                        <p className={`text-xs font-medium flex items-center ${trend.change > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {trend.change > 0 ? '+' : ''}{trend.change}%
                                        </p>
                                    </div>
                                </div>
                                <div className="h-10 w-24 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trend.data}>
                                            <defs>
                                                <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={trend.change > 0 ? "#f43f5e" : "#10b981"} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={trend.change > 0 ? "#f43f5e" : "#10b981"} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={trend.change > 0 ? "#f43f5e" : "#10b981"}
                                                fill={`url(#grad${i})`}
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* COL 2: Risk Signals */}
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 mb-4">Risk Signals</h4>
                    <div className="space-y-3">
                        <div className="p-3 bg-white border border-rose-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-rose-900/30 group">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-rose-100 text-rose-600 rounded-full mt-0.5 dark:bg-rose-900/30 dark:text-rose-400">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors">Food spending up 12%</p>
                                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Higher than 3-month avg. Consider cooking at home.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-white border border-amber-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-amber-900/30 group">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full mt-0.5 dark:bg-amber-900/30 dark:text-amber-400">
                                    <Monitor className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">Subscriptions creeping up</p>
                                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">2 new services added this month.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-blue-900/30 group">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full mt-0.5 dark:bg-blue-900/30 dark:text-blue-400">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Utility spike detected</p>
                                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Gas bill is 15% higher than last month.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COL 3: Quick Activity */}
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Recent Activity</h4>
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">View All</button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {transactions.slice(0, 4).map((tx, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                key={tx.id}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                        {React.createElement(CATEGORY_ICONS[tx.category] || ArrowDownRight, { className: "w-4 h-4" })}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white max-w-[100px]">{tx.item}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{tx.category}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">${tx.amount.toLocaleString()}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

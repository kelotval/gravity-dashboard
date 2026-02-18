import React, { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight, Coffee, Home, Zap, Monitor, Smartphone, TrendingUp, AlertTriangle, ShoppingBag, ShoppingCart, Lightbulb } from "lucide-react";
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

// Helper to safely parse amounts
const parseAmount = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).replace(/[^0-9.-]/g, '');
    return parseFloat(str) || 0;
};

export default function SpendingIntelligence({ transactions }) {
    // ... implementation ...
    const [viewMode, setViewMode] = React.useState('partial');
    const toggleView = () => setViewMode(prev => prev === 'full' ? 'partial' : 'full');

    // Calculate Trends (simulated for now, can be real later)
    const trends = [
        { category: "Housing", change: 0, icon: CATEGORY_ICONS.Housing, color: CATEGORY_COLORS.Housing, data: generateTrendData(2000, 0.05) },
        { category: "Food", change: 12, icon: CATEGORY_ICONS.Food, color: CATEGORY_COLORS.Food, data: generateTrendData(800, 0.3) },
        { category: "Utilities", change: 15, icon: CATEGORY_ICONS.Utilities, color: CATEGORY_COLORS.Utilities, data: generateTrendData(300, 0.1) },
    ];


    return (
        <div className="bg-surface rounded-xl shadow-sm border border-surface-highlight overflow-visible lg:overflow-hidden h-auto lg:h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/30">
                        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Spending Intelligence</h3>
                </div>
                <button
                    onClick={toggleView}
                    className="text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                    {viewMode === 'full' ? 'Hide Signals' : 'Show Signals'}
                </button>
            </div>

            <div className={`grid grid-cols-1 ${viewMode === 'full' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700 h-auto lg:h-full transition-all duration-300`}>

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
                                        <p className="text-sm font-medium text-white">{trend.category}</p>
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
                {viewMode === 'full' && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="p-6 bg-transparent overflow-hidden"
                    >
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 mb-4">Risk Signals</h4>
                        <div className="space-y-3">
                            <div className="p-3 bg-surface-highlight border border-rose-500/20 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-rose-100 text-rose-600 rounded-full mt-0.5 dark:bg-rose-900/30 dark:text-rose-400">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors">Food spending up 12%</p>
                                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Higher than 3-month avg. Consider cooking at home.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-surface-highlight border border-amber-500/20 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full mt-0.5 dark:bg-amber-900/30 dark:text-amber-400">
                                        <Monitor className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Subscriptions creeping up</p>
                                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">2 new services added this month.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-surface-highlight border border-blue-500/20 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full mt-0.5 dark:bg-blue-900/30 dark:text-blue-400">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Utility spike detected</p>
                                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Gas bill is 15% higher than last month.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* COL 3: Actionable Savings */}
                <div className="p-6 flex flex-col h-full bg-gradient-to-b from-surface to-surface-active/50">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Potential Savings</h4>
                        <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-medium">
                            Actionable
                        </span>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                        {(() => {
                            // Quick Analysis Logic
                            const discretionary = [
                                {
                                    label: "Dining & Drinks",
                                    keywords: ["dining", "restaurant", "pub", "bar", "liquor", "coffee", "takeaway", "uber eats", "doordash", "menulog", "mcdonalds", "kfc", "going out", "food"],
                                    exclude: ["groceries", "supermarket", "woolworths", "coles", "aldi", "iga"],
                                    action: "Cook at home",
                                    icon: Coffee,
                                    color: "text-orange-500 bg-orange-500/10"
                                },
                                {
                                    label: "Shopping",
                                    keywords: ["shopping", "clothing", "electronics", "games", "gift", "amazon", "ebay", "kmart", "target", "myer", "david jones", "jb hi-fi", "bunnings"],
                                    exclude: [],
                                    action: "Wait 24hrs before buying",
                                    icon: ShoppingBag,
                                    color: "text-purple-500 bg-purple-500/10"
                                },
                                {
                                    label: "Subs & Media",
                                    keywords: ["subscriptions", "netflix", "spotify", "youtube", "prime", "disney", "apple", "google", "hulu", "bhinge", "kayo", "stan", "audible", "playstation", "xbox", "steam", "chatgpt", "uber one"],
                                    exclude: [],
                                    action: "Audit unused services",
                                    icon: Monitor,
                                    color: "text-pink-500 bg-pink-500/10"
                                },
                                {
                                    label: "Groceries",
                                    keywords: ["groceries", "woolworths", "coles", "aldi", "iga", "harris farm", "costco"],
                                    exclude: [],
                                    action: "Meal plan to reduce waste",
                                    icon: ShoppingCart,
                                    color: "text-emerald-500 bg-emerald-500/10"
                                }
                            ];

                            const insights = discretionary.map(type => {
                                const total = transactions
                                    .filter(t => {
                                        const text = ((t.item || "") + " " + (t.category || "")).toLowerCase();
                                        const matchesKeyword = type.keywords.some(k => text.includes(k.toLowerCase()));
                                        const isExcluded = type.exclude.some(k => text.includes(k.toLowerCase()));
                                        return matchesKeyword && !isExcluded;
                                    })
                                    .reduce((sum, t) => sum + Math.abs(parseAmount(t.amount)), 0);
                                return { ...type, total };
                            }).filter(i => i.total > 0).sort((a, b) => b.total - a.total).slice(0, 4);

                            // DEBUG: Show what we are working with
                            if (insights.length === 0) {
                                return (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        <div className="mb-2 font-medium">No discretionary spending detected.</div>
                                        <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded text-left overflow-auto max-h-32">
                                            DEBUG INFO:<br />
                                            Tx Count: {transactions.length}<br />
                                            Sample Txs:<br />
                                            {transactions.slice(0, 3).map(t => (
                                                <div key={t.id}>- {t.item || t.description} ({t.category}): {t.amount}</div>
                                            ))}
                                            <br />
                                            (Check if amounts are positive/negative or if categories match)
                                        </div>
                                    </div>
                                );
                            }

                            return insights.map((insight, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    key={insight.label}
                                    className="p-3 bg-surface border border-surface-highlight rounded-xl hover:border-brand/30 transition-colors group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${insight.color}`}>
                                                <insight.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-sm font-semibold text-white group-hover:text-brand transition-colors">{insight.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">${insight.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1 flex-1 bg-surface-highlight rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-current opacity-50 rounded-full"
                                                style={{ width: `${Math.min((insight.total / 2000) * 100, 100)}%`, color: 'inherit' }} // rudimentary scale
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand mt-2 flex items-center gap-1 font-medium">
                                        <Lightbulb className="w-3 h-3" /> {insight.action}
                                    </p>
                                </motion.div>
                            ));
                        })()}
                    </div>
                </div>

            </div>
        </div>
    );
}

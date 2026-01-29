import React, { useMemo } from "react";
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function InsightsCard({ transactions, income, debts, savingsRate, onAction }) {
    const insights = useMemo(() => {
        const list = [];
        const currentMonth = new Date().getMonth();

        // 1. Savings Insight
        const rate = parseFloat(savingsRate);
        if (rate >= 20) {
            list.push({
                type: "success",
                icon: CheckCircle,
                title: "Great Savings Rate",
                desc: `You're saving ${rate}% of your income. Keep it up!`,
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
                action: { type: 'NAVIGATE', target: 'trends', label: 'View Trends' }
            });
        } else if (rate < 10) {
            list.push({
                type: "warning",
                icon: AlertCircle,
                title: "Boost Your Savings",
                desc: `Your savings rate is ${rate}%. Aim for at least 20%.`,
                color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
                action: { type: 'NAVIGATE', target: 'trends', label: 'Analyze Trends' }
            });
        }

        // 2. Spending Insight (Top Category)
        const categories = transactions.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {});
        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            list.push({
                type: "info",
                icon: TrendingDown,
                title: "Top Expense",
                desc: `${topCategory[0]} is your highest spending category ($${topCategory[1].toLocaleString()}).`,
                color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
                action: { type: 'FILTER', payload: topCategory[0], label: `Filter by ${topCategory[0]}` }
            });
        }

        // 3. Debt Insight
        const totalDebt = debts.reduce((a, b) => a + b.currentBalance, 0);
        if (totalDebt > 0) {
            const highestInterestDebt = [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];
            if (highestInterestDebt) {
                list.push({
                    type: "alert",
                    icon: Lightbulb,
                    title: "Debt Strategy",
                    desc: `Focus on paying off ${highestInterestDebt.name} first (highest interest).`,
                    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
                    action: { type: 'NAVIGATE', target: 'payoff', label: 'View Payoff Plan' }
                });
            } else {
                list.push({
                    type: "alert",
                    icon: Lightbulb,
                    title: "Debt Payoff",
                    desc: `You have ${debts.length} active debts totaling $${totalDebt.toLocaleString()}.`,
                    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
                    action: { type: 'NAVIGATE', target: 'liabilities', label: 'Manage Debts' }
                });
            }
        }

        // 4. Subscription Check (Simple heuristic)
        const subCount = transactions.filter(t => t.category === 'Subscriptions').length;
        if (subCount > 2) {
            list.push({
                type: "warning",
                icon: AlertCircle,
                title: "Subscription Alert",
                desc: `You have ${subCount} active subscriptions. Review them regularly.`,
                color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
                action: { type: 'FILTER', payload: 'Subscriptions', label: 'Review Subs' }
            });
        }

        return list.slice(0, 4); // Limit to top 4
    }, [transactions, income, debts, savingsRate]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/30">
                        <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Insights & Next Actions</h3>
                </div>
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        onClick={() => onAction && onAction(insight.action)}
                        className="w-full text-left group p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200 dark:bg-gray-700/30 dark:border-gray-700 cursor-pointer"
                    >
                        <div className="flex gap-4">
                            <div className={`p-2 rounded-lg h-fit ${insight.color}`}>
                                <insight.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1 dark:text-white flex justify-between items-center">
                                    {insight.title}
                                    <span className="flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-blue-400">
                                        {insight.action?.label} <ArrowRight className="w-3 h-3 ml-1" />
                                    </span>
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400 pr-8">
                                    {insight.desc}
                                </p>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <button
                onClick={() => onAction && onAction({ type: 'NAVIGATE', target: 'insights' })}
                className="w-full mt-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
                View Full Analysis
            </button>
        </div>
    );
}

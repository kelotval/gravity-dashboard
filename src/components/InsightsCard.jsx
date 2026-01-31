import React, { useMemo } from "react";
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function InsightsCard({ transactions, income, debts, savingsRate, onAction }) {
    const insights = useMemo(() => {
        const list = [];
        const currentMonth = new Date().getMonth();

        // 1. Savings Insight
        const rate = parseFloat(savingsRate);
        const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
        const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
        const monthlySavings = fullIncome - totalExpenses;

        if (rate >= 20) {
            const monthsToFund = Math.ceil(15000 / monthlySavings);

            list.push({
                type: "success",
                icon: CheckCircle,
                observation: `Saving ${rate}% of income`,
                action: `Set automatic transfer: $${monthlySavings.toLocaleString()}/month`,
                outcome: `$15K fund in ${monthsToFund} months`,
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
                actionType: { type: 'NAVIGATE', target: 'trends', label: 'View Trends' }
            });
        } else if (rate < 10 && rate >= 0) {
            const targetSavings = Math.round(fullIncome * 0.2);
            const gap = targetSavings - monthlySavings;

            list.push({
                type: "warning",
                icon: AlertCircle,
                observation: `Only saving ${rate}% (target: 20%)`,
                action: `Cut $${gap.toLocaleString()}/month from discretionary spending`,
                outcome: `Reach $${targetSavings.toLocaleString()}/month savings`,
                color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
                actionType: { type: 'NAVIGATE', target: 'trends', label: 'Analyze Trends' }
            });
        } else if (rate < 0) {
            const deficit = totalExpenses - fullIncome;
            const targetReduction = Math.round(deficit + (fullIncome * 0.1));

            list.push({
                type: "urgent",
                icon: AlertCircle,
                observation: `Spending exceeds income by $${deficit.toLocaleString()}`,
                action: `URGENT: Cut $${targetReduction.toLocaleString()}/month from expenses`,
                outcome: `Stop draining $${(deficit * 12).toLocaleString()}/year`,
                color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
                actionType: { type: 'NAVIGATE', target: 'trends', label: 'Fix Now' }
            });
        }

        // 2. Spending Insight (Top Category)
        const categories = transactions.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {});
        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            const reductionTarget = Math.round(topCategory[1] * 0.2);
            const annualSavings = reductionTarget * 12;

            list.push({
                type: "info",
                icon: TrendingDown,
                observation: `Top expense: ${topCategory[0]} ($${topCategory[1].toLocaleString()})`,
                action: `Find $${reductionTarget.toLocaleString()}/month to cut here`,
                outcome: `Save $${annualSavings.toLocaleString()}/year`,
                color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
                actionType: { type: 'FILTER', payload: topCategory[0], label: `Filter ${topCategory[0]}` }
            });
        }

        // 3. Debt Insight
        const totalDebt = debts.reduce((a, b) => a + b.currentBalance, 0);
        if (totalDebt > 0) {
            const highestInterestDebt = [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];
            if (highestInterestDebt) {
                const monthlyPayment = highestInterestDebt.monthlyRepayment || 0;
                const extraPayment = Math.round(monthlyPayment * 0.5);

                list.push({
                    type: "alert",
                    icon: Lightbulb,
                    observation: `${highestInterestDebt.name} (highest interest)`,
                    action: `Pay $${(monthlyPayment + extraPayment).toLocaleString()}/month`,
                    outcome: `Payoff months faster → Save $1000s`,
                    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
                    actionType: { type: 'NAVIGATE', target: 'payoff', label: 'View Plan' }
                });
            } else {
                list.push({
                    type: "alert",
                    icon: Lightbulb,
                    observation: `${debts.length} debts ($${totalDebt.toLocaleString()})`,
                    action: `Review payoff strategy`,
                    outcome: `Eliminate debt systematically`,
                    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
                    actionType: { type: 'NAVIGATE', target: 'liabilities', label: 'Manage Debts' }
                });
            }
        }

        // 4. Subscription Check (Simple heuristic)
        const subCount = transactions.filter(t => t.category === 'Subscriptions').length;
        const subTotal = categories['Subscriptions'] || 0;
        if (subCount > 2 && subTotal > 0) {
            const reduction = Math.round(subTotal * 0.3);
            const annualSavings = reduction * 12;

            list.push({
                type: "warning",
                icon: AlertCircle,
                observation: `${subCount} subscriptions ($${subTotal.toLocaleString()}/mo)`,
                action: `Cancel $${reduction.toLocaleString()}/month in unused services`,
                outcome: `Recover $${annualSavings.toLocaleString()}/year`,
                color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
                actionType: { type: 'FILTER', payload: 'Subscriptions', label: 'Review Subs' }
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
                        onClick={() => onAction && onAction(insight.actionType)}
                        className="w-full text-left group p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200 dark:bg-gray-700/30 dark:border-gray-700 cursor-pointer"
                    >
                        <div className="flex gap-4">
                            <div className={`p-2 rounded-lg h-fit ${insight.color}`}>
                                <insight.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-2">
                                {/* Observation */}
                                <h4 className="font-semibold text-gray-900 text-sm dark:text-white">
                                    {insight.observation}
                                </h4>

                                {/* Action */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1.5 rounded border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                                        → {insight.action}
                                    </p>
                                </div>

                                {/* Outcome */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        ✓ {insight.outcome}
                                    </p>
                                    <span className="flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-blue-400">
                                        {insight.actionType?.label} <ArrowRight className="w-3 h-3 ml-1" />
                                    </span>
                                </div>
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

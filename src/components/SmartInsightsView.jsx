import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Coffee, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SmartInsightsView({ transactions, income, debts }) {
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        // Run analysis logic
        const generatedInsights = [];

        // 1. Calculate Totals
        const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
        const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
        const savingsRate = fullIncome > 0 ? ((fullIncome - totalExpenses) / fullIncome) * 100 : 0;

        // 2. Spending Analysis
        const categoryMap = {};
        transactions.forEach(tx => {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        });
        const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        const topCategory = categories[0];

        // 3. Subscription Check
        const subs = categoryMap['Subscriptions'] || 0;

        // 4. Debt Check
        const highInterestDebt = debts.find(d => d.accent === 'red');

        // --- Generate Messages ---

        // Welcome (Always)
        generatedInsights.push({
            id: 'welcome',
            icon: Sparkles,
            color: 'indigo',
            title: "Financial Analysis Complete",
            text: "I've analyzed your current financial snapshot. Here are my observations:"
        });

        // Savings Insight
        if (savingsRate > 20) {
            generatedInsights.push({
                id: 'savings-good',
                icon: TrendingUp,
                color: 'emerald',
                title: "Strong Savings Rate",
                text: `You're saving ${savingsRate.toFixed(1)}% of your income! That's excellent. At this rate, you'll save approx $${((fullIncome - totalExpenses) * 12).toLocaleString()} this year.`
            });
        } else if (savingsRate > 0) {
            generatedInsights.push({
                id: 'savings-ok',
                icon: TrendingUp,
                color: 'blue',
                title: "Positive Cash Flow",
                text: `You're cash flow positive, but saving only ${savingsRate.toFixed(1)}%. Try to target 20% by reducing discretionary spending.`
            });
        } else {
            generatedInsights.push({
                id: 'savings-bad',
                icon: AlertTriangle,
                color: 'red',
                title: "Negative Cash Flow",
                text: `Warning: Expenses exceed income by $${(totalExpenses - fullIncome).toLocaleString()}. Review your budget immediately.`
            });
        }

        // Top Spending Category
        if (topCategory) {
            generatedInsights.push({
                id: 'category-top',
                icon: TrendingDown,
                color: 'orange',
                title: `Spending Alert: ${topCategory[0]}`,
                text: `Your highest expense category is ${topCategory[0]} at $${topCategory[1].toLocaleString()}. Is this expected?`
            });
        }

        // Subscriptions
        if (subs > 100) {
            generatedInsights.push({
                id: 'subs',
                icon: Coffee,
                color: 'purple',
                title: "Subscription Fatigue",
                text: `You are spending $${subs.toLocaleString()} on subscriptions monthly. That's $${(subs * 12).toLocaleString()} a year! Consider auditing your unused services.`
            });
        }

        // Debt Strategy
        if (highInterestDebt) {
            generatedInsights.push({
                id: 'debt-strategy',
                icon: AlertTriangle,
                color: 'rose',
                title: "High Interest Debt Detected",
                text: `Focus all extra repayments on "${highInterestDebt.name}" first. It's flagged as high priority (Red). Paying this off quickly will save you the most money.`
            });
        }

        setInsights(generatedInsights);
    }, [transactions, income, debts]);

    const [showModal, setShowModal] = useState(false);

    // ... (existing logic) ...

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {/* Existing Content */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-full mb-4 dark:bg-indigo-900/40">
                    <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Financial Assistant</h2>
                <p className="text-gray-500 dark:text-gray-400">Smart observations based on your real-time data.</p>
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <div
                        key={insight.id}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 animate-in slide-in-from-bottom-4 duration-500 fill-mode-backwards dark:bg-gray-800 dark:border-gray-700"
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${insight.color}-50 text-${insight.color}-600 dark:bg-${insight.color}-900/30 dark:text-${insight.color}-400`}>
                            <insight.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1 dark:text-white">{insight.title}</h4>
                            <p className="text-gray-600 leading-relaxed dark:text-gray-300">{insight.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => setShowModal(true)}
                    className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center justify-center mx-auto gap-2 transition-transform active:scale-95 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    View Full Analysis <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Detailed Analysis Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 dark:bg-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detailed Financial Breakdown</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive report of your current month.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors dark:hover:bg-gray-700"
                            >
                                <ArrowRight className="w-5 h-5 rotate-180" /> {/* Using Arrow as Close/Back for now, usually X */}
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-8">

                            {/* Income Section */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 dark:text-gray-400">Income Sources</h4>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2 dark:bg-gray-800/50">
                                    {Object.entries(income).map(([source, amount]) => (
                                        <div key={source} className="flex justify-between items-center">
                                            <span className="text-gray-700 capitalize dark:text-gray-300">{source.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">${amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center font-bold dark:border-gray-700">
                                        <span className="text-gray-900 dark:text-white">Total Income</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">${Object.values(income).reduce((a, b) => a + b, 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Expense Breakdown */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 dark:text-gray-400">Expense by Category</h4>
                                <div className="space-y-3">
                                    {(() => {
                                        const catMap = {};
                                        transactions.forEach(tx => catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount);
                                        const totalExp = transactions.reduce((a, t) => a + t.amount, 0);

                                        return Object.entries(catMap)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([cat, amount]) => (
                                                <div key={cat} className="relative">
                                                    <div className="flex justify-between text-sm mb-1 z-10 relative">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                                                        <span className="text-gray-900 dark:text-white">${amount.toLocaleString()} <span className="text-gray-400 text-xs">({((amount / totalExp) * 100).toFixed(0)}%)</span></span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                                                        <motion.div
                                                            className="h-full bg-indigo-500 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(amount / totalExp) * 100}%` }}
                                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                        />
                                                    </div>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </section>

                            {/* Debt Breakdown */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 dark:text-gray-400">Active Debts</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {debts.map(debt => (
                                        <div key={debt.id} className="p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-gray-900 text-sm dark:text-white">{debt.name}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${debt.accent === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    debt.accent === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>{debt.accent} Priority</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 mb-1 dark:text-white">${debt.currentBalance.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Monthly: ${debt.monthlyRepayment}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

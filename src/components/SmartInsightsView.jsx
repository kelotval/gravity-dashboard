import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Coffee, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "./common/PageContainer";
import { GlassCard } from "./common/GlassCard";

export default function SmartInsightsView({ transactions, income, debts, periodLabel = "Current Month" }) {
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        // Run analysis logic
        const generatedInsights = [];

        // 1. Calculate Totals
        const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
        // FIX: Expenses are stored as negative numbers, so we need to sum absolute values
        const totalExpenses = transactions
            .filter(tx => tx.amount < 0 && tx.kind !== 'transfer')
            .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
        const savingsRate = fullIncome > 0 ? ((fullIncome - totalExpenses) / fullIncome) * 100 : 0;
        const monthlySavings = fullIncome - totalExpenses;
        const annualSavings = monthlySavings * 12;

        // 2. Spending Analysis
        const categoryMap = {};
        transactions.forEach(tx => {
            // FIX: Only count expenses (negative amounts), use absolute value
            if (tx.amount < 0 && tx.kind !== 'transfer') {
                categoryMap[tx.category] = (categoryMap[tx.category] || 0) + Math.abs(tx.amount);
            }
        });
        const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        const topCategory = categories[0];

        // 3. Subscription Check
        const subs = categoryMap['Subscriptions'] || 0;

        // 4. Debt Check
        const highInterestDebt = debts.find(d => d.accent === 'red');
        const totalDebt = debts.reduce((acc, d) => acc + d.currentBalance, 0);

        // --- Generate Causal Framework Insights ---

        // Welcome (Always)
        generatedInsights.push({
            id: 'welcome',
            icon: Sparkles,
            color: 'indigo',
            observation: "Financial Analysis Complete",
            cause: "Your current snapshot has been analyzed across income, spending, debt, and savings patterns",
            impact: "Understanding these metrics enables data-driven financial decisions",
            action: "Review each insight below and take recommended actions",
            outcome: "Optimized financial health and accelerated wealth building"
        });

        // Savings Insight
        if (savingsRate > 20) {
            const monthsToEmergencyFund = Math.ceil(15000 / monthlySavings);
            const interestIncome = Math.round(annualSavings * 0.03); // Assuming 3% HYSA

            generatedInsights.push({
                id: 'savings-good',
                icon: TrendingUp,
                color: 'emerald',
                observation: `You're saving ${savingsRate.toFixed(1)}% of your income ($${monthlySavings.toLocaleString()}/month)`,
                cause: "This exceeds the recommended 20% target, indicating strong financial discipline",
                impact: `At this rate, you'll build a $15,000 emergency fund in ${monthsToEmergencyFund} months and save $${annualSavings.toLocaleString()} annually`,
                action: `Lock this in: Set automatic transfer of $${monthlySavings.toLocaleString()}/month to a high-yield savings account (3% APY)`,
                outcome: `$15,000 emergency fund in ${monthsToEmergencyFund} months + $${interestIncome.toLocaleString()} annual interest income`
            });
        } else if (savingsRate > 0) {
            const targetSavings = Math.round(fullIncome * 0.2);
            const gap = targetSavings - monthlySavings;
            const potentialAnnualSavings = targetSavings * 12;

            generatedInsights.push({
                id: 'savings-ok',
                icon: TrendingUp,
                color: 'blue',
                observation: `You're saving ${savingsRate.toFixed(1)}% of income ($${monthlySavings.toLocaleString()}/month)`,
                cause: "This is below the recommended 20% target, limiting emergency fund growth and investment capacity",
                impact: "Without increasing savings, you're missing $" + (gap * 12).toLocaleString() + " in annual wealth building",
                action: `Find $${gap.toLocaleString()}/month to cut from discretionary spending to reach 20% target`,
                outcome: `Hit $${targetSavings.toLocaleString()}/month savings → $${potentialAnnualSavings.toLocaleString()} annual wealth accumulation`
            });
        } else {
            const deficit = totalExpenses - fullIncome;
            const targetReduction = Math.round(deficit + (fullIncome * 0.1)); // Get to 10% savings

            generatedInsights.push({
                id: 'savings-bad',
                icon: AlertTriangle,
                color: 'red',
                observation: `Expenses exceed income by $${deficit.toLocaleString()}/month`,
                cause: "Negative cash flow depletes savings and forces reliance on debt",
                impact: "Continuing this pattern adds $" + (deficit * 12).toLocaleString() + " to debt annually or drains emergency fund",
                action: `URGENT: Cut $${targetReduction.toLocaleString()}/month from expenses to achieve 10% savings rate`,
                outcome: `Stop hemorrhaging $${(deficit * 12).toLocaleString()}/year → Establish emergency fund buffer`
            });
        }

        // Top Spending Category
        if (topCategory) {
            const categoryPct = ((topCategory[1] / totalExpenses) * 100).toFixed(0);
            const reductionTarget = Math.round(topCategory[1] * 0.2); // 20% reduction
            const annualSavings = reductionTarget * 12;

            generatedInsights.push({
                id: 'category-top',
                icon: TrendingDown,
                color: 'orange',
                observation: `${topCategory[0]} is your highest expense at $${topCategory[1].toLocaleString()}/month (${categoryPct}% of spending)`,
                cause: "This category dominates your budget and represents your largest optimization opportunity",
                impact: "A 20% reduction here frees up more cash than cutting any other category",
                action: `Review all ${topCategory[0]} transactions and identify $${reductionTarget.toLocaleString()}/month in reductions`,
                outcome: `Save $${annualSavings.toLocaleString()}/year → Redirect to debt payoff or investments`
            });
        }

        // Subscriptions
        if (subs > 100) {
            const reduction = Math.round(subs * 0.3); // Target 30% reduction
            const annualSavings = reduction * 12;

            generatedInsights.push({
                id: 'subs',
                icon: Coffee,
                color: 'purple',
                observation: `You're spending $${subs.toLocaleString()}/month on subscriptions`,
                cause: "Subscriptions are recurring, auto-renewed expenses that often go unreviewed",
                impact: "Current trajectory: $" + (subs * 12).toLocaleString() + "/year in subscription costs, many likely unused",
                action: `Audit all subscriptions today and cancel at least $${reduction.toLocaleString()}/month in unused services`,
                outcome: `Recover $${annualSavings.toLocaleString()}/year with zero lifestyle impact`
            });
        }

        // Debt Strategy
        if (highInterestDebt) {
            const monthlyPayment = highInterestDebt.monthlyRepayment || 0;
            const extraPayment = Math.round(monthlyPayment * 0.5); // Suggest 50% increase
            const currentRate = highInterestDebt.interestRate || 18;
            const monthlyInterest = Math.round((highInterestDebt.currentBalance * currentRate / 100) / 12);
            const annualInterestCost = monthlyInterest * 12;

            generatedInsights.push({
                id: 'debt-strategy',
                icon: AlertTriangle,
                color: 'rose',
                observation: `"${highInterestDebt.name}" flagged as critical priority (${currentRate}% APR, $${highInterestDebt.currentBalance.toLocaleString()} balance)`,
                cause: `High interest rate is costing you $${monthlyInterest.toLocaleString()}/month ($${annualInterestCost.toLocaleString()}/year) in interest`,
                impact: "Every month of delay wastes $" + monthlyInterest.toLocaleString() + " that could build wealth instead",
                action: `Pay $${(monthlyPayment + extraPayment).toLocaleString()}/month (up from $${monthlyPayment.toLocaleString()}) using freed-up cash from expense cuts`,
                outcome: `Payoff accelerated by months → Save thousands in lifetime interest`
            });
        }

        setInsights(generatedInsights);
    }, [transactions, income, debts]);

    const [showModal, setShowModal] = useState(false);

    // ... (existing logic) ...

    // ... (keep existing logic) ...

    return (
        <PageContainer
            title="AI Financial Assistant"
            subtitle="Smart observations based on your real-time data"
            activeMonth={periodLabel}
        >

            {/* Visual Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {/* Total Insights */}
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors" />
                    <div className="relative z-10">
                        <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Total Insights</div>
                        <div className="text-3xl font-bold text-white mb-1">{insights.length - 1}</div>
                        <div className="text-indigo-400 text-xs leading-tight">
                            {insights.length - 1 === 0 ? 'No recommendations' :
                                insights.length - 1 === 1 ? '1 actionable recommendation' :
                                    `${insights.length - 1} actionable recommendations`}
                        </div>
                    </div>
                </GlassCard>

                {/* Critical Issues */}
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors" />
                    <div className="relative z-10">
                        <div className="text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">Critical Issues</div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {insights.filter(i => i.color === 'red' || i.color === 'rose').length}
                        </div>
                        <div className="text-rose-400 text-xs leading-tight">
                            {(() => {
                                const count = insights.filter(i => i.color === 'red' || i.color === 'rose').length;
                                return count === 0 ? 'No urgent actions needed' :
                                    count === 1 ? 'Requires immediate action' :
                                        `${count} items need urgent attention`;
                            })()}
                        </div>
                    </div>
                </GlassCard>

                {/* Savings Opportunities */}
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="relative z-10">
                        <div className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Savings Rate</div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {(() => {
                                const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
                                const totalExpenses = transactions
                                    .filter(tx => tx.amount < 0 && tx.kind !== 'transfer')
                                    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
                                const savingsRate = fullIncome > 0 ? ((fullIncome - totalExpenses) / fullIncome) * 100 : 0;
                                return savingsRate >= 0 ? `${Math.round(savingsRate)}%` : '0%';
                            })()}
                        </div>
                        <div className="text-emerald-400 text-xs leading-tight">
                            {(() => {
                                const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
                                const totalExpenses = transactions
                                    .filter(tx => tx.amount < 0 && tx.kind !== 'transfer')
                                    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
                                const savingsRate = fullIncome > 0 ? ((fullIncome - totalExpenses) / fullIncome) * 100 : 0;
                                return savingsRate > 20 ? 'Excellent! Above target' :
                                    savingsRate > 10 ? 'Good, room to improve' :
                                        savingsRate > 0 ? 'Below 20% target' :
                                            'Spending exceeds income';
                            })()}
                        </div>
                    </div>
                </GlassCard>

                {/* Debt Focus */}
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors" />
                    <div className="relative z-10">
                        <div className="text-orange-300 text-xs font-bold uppercase tracking-wider mb-1">High-Interest Debt</div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {debts.filter(d => d.accent === 'red').length}
                        </div>
                        <div className="text-orange-400 text-xs leading-tight">
                            {(() => {
                                const count = debts.filter(d => d.accent === 'red').length;
                                const total = debts.length;
                                return count === 0 ? (total === 0 ? 'No active debts' : 'No critical debts') :
                                    count === 1 ? 'Focus on 1 priority debt' :
                                        `${count} debts need focus`;
                            })()}
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights.map((insight, index) => (
                    <GlassCard
                        key={insight.id}
                        className="flex gap-4 animate-in slide-in-from-bottom-4 duration-500 fill-mode-backwards hover:border-white/10 transition-colors"
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${insight.color}-500/20 text-${insight.color}-400`}>
                            <insight.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-3">
                            {/* Observation */}
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Observation</div>
                                <h4 className="font-bold text-white text-lg">{insight.observation}</h4>
                            </div>

                            {/* Cause */}
                            <div className="pl-4 border-l-2 border-white/10">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Why It Matters</div>
                                <p className="text-sm text-gray-300">{insight.cause}</p>
                            </div>

                            {/* Impact */}
                            <div className="pl-4 border-l-2 border-orange-500/30">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-orange-400 mb-1">If Unchanged</div>
                                <p className="text-sm text-gray-300 font-medium">{insight.impact}</p>
                            </div>

                            {/* Action */}
                            <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Action Step</div>
                                <p className="text-sm font-semibold text-indigo-200">{insight.action}</p>
                            </div>

                            {/* Outcome */}
                            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 mb-1">Expected Outcome</div>
                                <p className="text-sm font-bold text-emerald-200">{insight.outcome}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center mx-auto gap-2 active:scale-95"
                >
                    View Full Analysis <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Detailed Analysis Modal - Dark Mode Optimized */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div
                        className="bg-[#0B0E14] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white">Detailed Financial Breakdown</h3>
                                <p className="text-sm text-gray-400">Comprehensive report of your current month.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ArrowRight className="w-5 h-5 rotate-180" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                            {/* Income Section */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Income Sources</h4>
                                <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                                    {Object.entries(income).map(([source, amount]) => (
                                        <div key={source} className="flex justify-between items-center">
                                            <span className="text-gray-300 capitalize">{source.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="font-semibold text-white">${amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center font-bold">
                                        <span className="text-white">Total Income</span>
                                        <span className="text-emerald-400">${Object.values(income).reduce((a, b) => a + b, 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Expense Breakdown */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Expense by Category</h4>
                                <div className="space-y-3">
                                    {(() => {
                                        const catMap = {};
                                        transactions.forEach(tx => {
                                            if (tx.amount < 0 && tx.kind !== 'transfer') {
                                                catMap[tx.category] = (catMap[tx.category] || 0) + Math.abs(tx.amount);
                                            }
                                        });
                                        const totalExp = transactions
                                            .filter(tx => tx.amount < 0 && tx.kind !== 'transfer')
                                            .reduce((a, t) => a + Math.abs(t.amount), 0);

                                        return Object.entries(catMap)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([cat, amount]) => (
                                                <div key={cat} className="relative group">
                                                    <div className="flex justify-between text-sm mb-1 z-10 relative">
                                                        <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{cat}</span>
                                                        <span className="text-white">${amount.toLocaleString()} <span className="text-gray-500 text-xs">({((amount / totalExp) * 100).toFixed(0)}%)</span></span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
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
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Active Debts</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {debts.map(debt => (
                                        <div key={debt.id} className="p-4 border border-white/5 bg-white/5 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-white text-sm">{debt.name}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${debt.accent === 'red' ? 'bg-rose-500/20 text-rose-400' :
                                                    debt.accent === 'orange' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                                    }`}>{debt.accent} Priority</span>
                                            </div>
                                            <div className="text-2xl font-bold text-white mb-1">${debt.currentBalance.toLocaleString()}</div>
                                            <div className="text-xs text-gray-400">Monthly: ${debt.monthlyRepayment}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-white/5 border-t border-white/5">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 bg-white/10 border border-white/5 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}

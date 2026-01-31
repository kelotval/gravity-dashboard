import React, { useMemo } from "react";
import { Calendar, CheckCircle2, AlertTriangle, TrendingUp, Target } from "lucide-react";

export default function ActionPlanPanel({ transactions, income, debts, month = new Date().getMonth() }) {
    const actions = useMemo(() => {
        const actionList = [];

        // Calculate financial state
        const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
        const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
        const savingsRate = fullIncome > 0 ? ((fullIncome - totalExpenses) / fullIncome) * 100 : 0;
        const monthlySavings = fullIncome - totalExpenses;

        // Skip if insufficient data
        if (fullIncome === 0 || transactions.length === 0) {
            return [];
        }

        // Category analysis
        const categoryMap = {};
        transactions.forEach(tx => {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        });

        // Filter out non-actionable categories
        const excludedCategories = ['Transfers', 'Fees and Interest', 'Housing', 'Utilities', 'Insurance'];
        const actionableCategories = Object.entries(categoryMap)
            .filter(([cat]) => !excludedCategories.includes(cat))
            .sort((a, b) => b[1] - a[1]);

        const topCategory = actionableCategories[0];
        const subscriptions = categoryMap['Subscriptions'] || 0;

        // Debt analysis
        const highInterestDebts = debts.filter(d => d.accent === 'red' && d.interestRate >= 15);

        // ====================
        // Priority 1: URGENT - Negative Cash Flow
        // ====================
        if (savingsRate < 0) {
            const deficit = Math.abs(totalExpenses - fullIncome);

            // Only recommend if deficit is meaningful (>$50)
            if (deficit > 50) {
                const targetReduction = Math.round(deficit + (fullIncome * 0.05)); // Get to 5% savings

                actionList.push({
                    id: 'stop-bleeding',
                    priority: 'URGENT',
                    priorityColor: 'bg-red-500',
                    icon: AlertTriangle,
                    action: `Reduce expenses by $${targetReduction.toLocaleString()}/month (currently overspending by $${deficit.toLocaleString()})`,
                    impact: `Stop draining $${(deficit * 12).toLocaleString()}/year + start saving`,
                    impactColor: 'text-red-600 dark:text-red-400',
                    specifics: `Review "${topCategory ? topCategory[0] : 'largest category'}" first - look for non-essentials to cut`
                });
            }
        }

        // ====================
        // Priority 2: URGENT - High-Interest Debt with Specific Strategy
        // ====================
        if (highInterestDebts.length > 0 && monthlySavings > 0) {
            const debt = highInterestDebts[0];
            const currentPayment = debt.monthlyRepayment || 0;

            // Only recommend if there's actual extra cash available
            const availableExtra = Math.min(monthlySavings * 0.5, currentPayment * 0.5);

            if (availableExtra >= 50 && currentPayment > 0) {
                const targetPayment = Math.round(currentPayment + availableExtra);
                const monthlyInterest = Math.round((debt.currentBalance * debt.interestRate / 100) / 12);
                const currentMonths = Math.ceil(debt.currentBalance / currentPayment);
                const newMonths = Math.ceil(debt.currentBalance / targetPayment);
                const monthsSaved = Math.max(0, currentMonths - newMonths);

                if (monthsSaved > 0) {
                    actionList.push({
                        id: 'debt-payoff',
                        priority: 'URGENT',
                        priorityColor: 'bg-red-500',
                        icon: AlertTriangle,
                        action: `Increase "${debt.name}" payment from $${currentPayment.toLocaleString()} to $${targetPayment.toLocaleString()}/month`,
                        impact: `Clear debt ${monthsSaved} months faster, save $${(monthlyInterest * monthsSaved).toLocaleString()} in interest`,
                        impactColor: 'text-emerald-600 dark:text-emerald-400',
                        specifics: `At ${debt.interestRate}% APR, you're paying $${monthlyInterest.toLocaleString()}/month in interest alone`
                    });
                }
            }
        }

        // ====================
        // Priority 3: HIGH - Build Emergency Fund (only if no urgent issues)
        // ====================
        if (savingsRate >= 0 && savingsRate < 15 && highInterestDebts.length === 0) {
            const targetSavings = Math.round(fullIncome * 0.15); // More achievable 15% target
            const gap = targetSavings - monthlySavings;

            // Only recommend if gap is meaningful and achievable
            if (gap > 100 && gap < fullIncome * 0.3) {
                actionList.push({
                    id: 'emergency-fund',
                    priority: 'HIGH',
                    priorityColor: 'bg-orange-500',
                    icon: Target,
                    action: `Increase savings by $${gap.toLocaleString()}/month to reach 15% of income`,
                    impact: `Build $${(gap * 12).toLocaleString()} emergency fund buffer in 1 year`,
                    impactColor: 'text-blue-600 dark:text-blue-400',
                    specifics: `Set up automatic transfer on payday to separate account`
                });
            }
        }

        // ====================
        // Priority 4: MEDIUM - Reduce Discretionary Spending
        // ====================
        if (topCategory && topCategory[1] >= 200) {
            const [categoryName, categoryAmount] = topCategory;

            // More conservative 15% reduction target
            const reductionTarget = Math.round(categoryAmount * 0.15);

            // Only recommend if category is truly discretionary and reduction is meaningful
            if (reductionTarget >= 50) {
                const transactionCount = transactions.filter(t => t.category === categoryName).length;

                actionList.push({
                    id: 'reduce-category',
                    priority: 'MEDIUM',
                    priorityColor: 'bg-blue-500',
                    icon: TrendingUp,
                    action: `Reduce "${categoryName}" spending by $${reductionTarget.toLocaleString()}/month (currently $${categoryAmount.toLocaleString()})`,
                    impact: `Free up $${(reductionTarget * 12).toLocaleString()}/year for savings or debt`,
                    impactColor: 'text-emerald-600 dark:text-emerald-400',
                    specifics: `Review ${transactionCount} transactions - identify 2-3 items to cut`
                });
            }
        }

        // ====================
        // Priority 5: MEDIUM - Subscription Audit (only if substantial)
        // ====================
        if (subscriptions >= 150) {
            const subTransactions = transactions.filter(t => t.category === 'Subscriptions');
            const reductionTarget = Math.round(subscriptions * 0.25); // Conservative 25%

            if (subTransactions.length >= 3 && reductionTarget >= 40) {
                actionList.push({
                    id: 'subscriptions',
                    priority: 'MEDIUM',
                    priorityColor: 'bg-blue-500',
                    icon: CheckCircle2,
                    action: `Audit ${subTransactions.length} subscriptions, target $${reductionTarget.toLocaleString()}/month to cancel`,
                    impact: `Recover $${(reductionTarget * 12).toLocaleString()}/year in unused services`,
                    impactColor: 'text-purple-600 dark:text-purple-400',
                    specifics: `List all subscriptions, mark last usage date, cancel unused 3+ months`
                });
            }
        }

        // Limit and sort by priority
        const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2 };
        return actionList
            .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
            .slice(0, 4); // Max 4 actions to keep focused
    }, [transactions, income, debts, month]);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[new Date().getMonth()];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 dark:bg-gray-800 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/30">
                        <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Next 30 Days Action Plan
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentMonth} priorities based on your financial data
                        </p>
                    </div>
                </div>
                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {actions.length} Actions
                </div>
            </div>

            {/* Action List */}
            <div className="space-y-3">
                {actions.map((action, index) => (
                    <div
                        key={action.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50/50 dark:bg-gray-700/30 dark:border-gray-700"
                    >
                        {/* Number Badge */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                            {index + 1}
                        </div>

                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-lg ${action.priorityColor} bg-opacity-10`}>
                            <action.icon className={`w-5 h-5 ${action.priorityColor.replace('bg-', 'text-')}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Priority Badge */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`${action.priorityColor} text-white text-xs font-bold px-2 py-0.5 rounded uppercase`}>
                                    {action.priority}
                                </span>
                            </div>

                            {/* Action Description */}
                            <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                {action.action}
                            </p>

                            {/* Impact */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-sm font-bold ${action.impactColor}`}>
                                    → {action.impact}
                                </span>
                            </div>

                            {/* Specifics (if available) */}
                            {action.specifics && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-1">
                                    💡 {action.specifics}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* No Actions Message */}
            {actions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                    <p className="font-medium">All priorities under control!</p>
                    <p className="text-sm">No critical actions needed this month.</p>
                </div>
            )}
        </div>
    );
}

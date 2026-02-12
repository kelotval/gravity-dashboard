import React from "react";
import { Calendar, DollarSign, AlertCircle, Clock } from "lucide-react";

export default function UpcomingPayments({ recurringExpenses, transactions, debts, activeMonth }) {
    // Get current date and calculate upcoming payment window (next 14 days)
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Helper to calculate days until payment
    const getDaysUntil = (dayOfMonth) => {
        const targetDate = new Date(currentYear, currentMonth, dayOfMonth);
        if (targetDate < today) {
            // If date has passed this month, use next month
            targetDate.setMonth(currentMonth + 1);
        }
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Collect upcoming payments
    const upcomingPayments = [];

    // 1. Add recurring expenses
    if (recurringExpenses && recurringExpenses.length > 0) {
        recurringExpenses.forEach(expense => {
            if (expense.active === false) return;

            // Estimate payment day based on expense type
            let estimatedDay = 15; // Default mid-month
            if (expense.category === "Housing" || expense.description?.toLowerCase().includes("rent")) {
                estimatedDay = 1; // Rent typically due on 1st
            } else if (expense.category === "Utilities") {
                estimatedDay = 20; // Utilities typically due later in month
            }

            const daysUntil = getDaysUntil(estimatedDay);

            if (daysUntil <= 14) {
                upcomingPayments.push({
                    name: expense.description || expense.category,
                    amount: Math.abs(expense.amount || 0),
                    daysUntil,
                    category: expense.category,
                    type: "recurring",
                    urgency: daysUntil <= 3 ? "high" : daysUntil <= 7 ? "medium" : "low"
                });
            }
        });
    }

    // 2. Add debt payments (assume mid-month)
    if (debts && debts.length > 0) {
        debts.forEach(debt => {
            const daysUntil = getDaysUntil(15); // Assume 15th of month

            if (daysUntil <= 14) {
                upcomingPayments.push({
                    name: debt.name,
                    amount: debt.monthlyRepayment || 0,
                    daysUntil,
                    category: "Debt Payment",
                    type: "debt",
                    urgency: daysUntil <= 3 ? "high" : daysUntil <= 7 ? "medium" : "low"
                });
            }
        });
    }

    // 3. Detect subscriptions from transaction history
    if (transactions && transactions.length > 0) {
        const subscriptionKeywords = ["netflix", "spotify", "apple", "amazon prime", "disney", "hulu", "youtube premium", "gym", "fitness"];
        const subscriptionMap = new Map();

        transactions.forEach(tx => {
            const desc = (tx.description || tx.merchant || tx.item || "").toLowerCase();
            const matchedKeyword = subscriptionKeywords.find(kw => desc.includes(kw));

            if (matchedKeyword && tx.date) {
                const txDate = new Date(tx.date);
                const dayOfMonth = txDate.getDate();

                if (!subscriptionMap.has(matchedKeyword)) {
                    subscriptionMap.set(matchedKeyword, {
                        name: tx.description || tx.merchant || tx.item,
                        amount: Math.abs(tx.amount || 0),
                        dayOfMonth,
                        category: "Subscriptions"
                    });
                }
            }
        });

        subscriptionMap.forEach((sub) => {
            const daysUntil = getDaysUntil(sub.dayOfMonth);

            if (daysUntil <= 14) {
                upcomingPayments.push({
                    name: sub.name,
                    amount: sub.amount,
                    daysUntil,
                    category: sub.category,
                    type: "subscription",
                    urgency: daysUntil <= 3 ? "high" : daysUntil <= 7 ? "medium" : "low"
                });
            }
        });
    }

    // Sort by days until due
    upcomingPayments.sort((a, b) => a.daysUntil - b.daysUntil);

    // Calculate total
    const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Get urgency color
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case "high": return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
            case "medium": return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
            default: return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700/50";
        }
    };

    const getDueDateText = (daysUntil) => {
        if (daysUntil === 0) return "Due Today";
        if (daysUntil === 1) return "Due Tomorrow";
        if (daysUntil <= 7) return `Due in ${daysUntil} days`;
        return `Due in ${daysUntil} days`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full dark:bg-gray-800 dark:border-gray-700 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Upcoming Payments
                </h3>
            </div>

            {/* Total Summary */}
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Next 14 Days Total</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${totalUpcoming.toLocaleString()}</span>
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    {upcomingPayments.length} payment{upcomingPayments.length !== 1 ? 's' : ''} scheduled
                </div>
            </div>

            {/* Payment List */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
                {upcomingPayments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No upcoming payments in the next 14 days</p>
                    </div>
                ) : (
                    upcomingPayments.map((payment, index) => (
                        <div
                            key={index}
                            className="p-3 rounded-lg bg-gray-50 border border-gray-100 dark:bg-gray-700/50 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="font-medium text-white text-sm">
                                        {payment.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {payment.category}
                                    </div>
                                </div>
                                <div className="text-right ml-3">
                                    <div className="font-bold text-white">
                                        ${payment.amount.toLocaleString()}
                                    </div>
                                    <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded ${getUrgencyColor(payment.urgency)}`}>
                                        {getDueDateText(payment.daysUntil)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Note */}
            {upcomingPayments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>Based on recurring expenses, subscriptions, and debt payments</span>
                    </div>
                </div>
            )}
        </div>
    );
}

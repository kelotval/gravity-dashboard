import React from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { Lightbulb, TrendingUp, AlertCircle, ArrowRight, Wallet, PiggyBank } from 'lucide-react';

export default function ScenarioInsights({ netPay, debts, projection, inputs }) {

    // Generate Insights based on Logic
    const insights = [];
    const monthlySurplus = (netPay.householdMonthly || 0) + (inputs.benefits || 0) - (inputs.expenses || 0) - (inputs.rent || 0);
    const hasHighInterestDebt = debts.some(d => d.interestRate > 6 && d.currentBalance > 0);
    const savingsRate = (monthlySurplus / ((netPay.householdMonthly || 1))) * 100;

    // 1. Debt Strategy Insight
    if (hasHighInterestDebt && monthlySurplus > 500) {
        const potentialSavings = Math.round(monthlySurplus * 0.5 * 12 * 0.05); // Rough calc
        insights.push({
            type: 'opportunity',
            icon: Wallet,
            title: "Accelerate Debt Repayment",
            text: `Allocating 50% of your surplus ($${Math.round(monthlySurplus * 0.5)}) to debt could save ~$${potentialSavings} in interest this year.`,
            action: "Adjust Extra Payments below"
        });
    }

    // 2. Investment Insight
    if (!hasHighInterestDebt && monthlySurplus > 1000) {
        insights.push({
            type: 'growth',
            icon: TrendingUp,
            title: "Increase Investment Exposure",
            text: `You have strong cashflow. Increasing your monthly investment by $500 could add ~$35k to your 5-year Net Worth.`,
            action: "Update Scenario Variables"
        });
    }

    // 3. Warning Insight
    if (savingsRate < 5 && monthlySurplus > 0) {
        insights.push({
            type: 'warning',
            icon: AlertCircle,
            title: "Low Savings Rate",
            text: `Your savings rate is only ${savingsRate.toFixed(1)}%. Consider reducing discretionary spend to build a safety buffer.`,
            action: "Review Expenses"
        });
    }

    // 4. Critical Warning
    if (monthlySurplus < 0) {
        insights.push({
            type: 'critical',
            icon: AlertCircle,
            title: "Negative Cashflow Alert",
            text: `You are burning cash ($${Math.abs(Math.round(monthlySurplus))}/mo). Immediate action is required to reduce expenses or increase income.`,
            action: "Emergency Audit"
        });
    }

    // fallback
    if (insights.length === 0) {
        insights.push({
            type: 'info',
            icon: Lightbulb,
            title: "Scenario Optimized",
            text: "Your current configuration is balanced. Monitor your spending to maintain this trajectory.",
            action: "Keep it up"
        });
    }


    return (
        <SurfaceCard title="AI Scenario Insights" className="h-full">
            <div className="space-y-4">
                {insights.map((insight, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex gap-4 ${insight.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                            insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        } transition-colors group`}>
                        <div className={`mt-1 p-2 rounded-full h-fit ${insight.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                                insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-brand/20 text-brand'
                            }`}>
                            <insight.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm font-bold mb-1 ${insight.type === 'critical' ? 'text-red-400' :
                                    insight.type === 'warning' ? 'text-yellow-400' :
                                        'text-white'
                                }`}>
                                {insight.title}
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed mb-2">
                                {insight.text}
                            </p>
                            {insight.action && (
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors cursor-pointer">
                                    {insight.action} <ArrowRight className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </SurfaceCard>
    );
}

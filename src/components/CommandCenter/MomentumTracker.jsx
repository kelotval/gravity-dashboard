import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Zap, TrendingUp, Award, ArrowUpRight } from 'lucide-react';
import { useMomentumMetrics } from './useMomentumMetrics';

export default function MomentumTracker({ transactions, monthlyLedger, debts }) {

    // Real Metrics
    const {
        savingsStreak,
        debtVelocity,
        debtVelocityPrev,
        netCashflow
    } = useMomentumMetrics(transactions, monthlyLedger, debts);

    const stats = [
        {
            label: "Savings Streak",
            value: `${savingsStreak} Months`,
            sub: savingsStreak > 3 ? "On fire! 🔥" : "Keep it up",
            icon: Award,
            color: "yellow"
        },
        {
            label: "Debt Paid (30d)",
            value: `$${debtVelocity.toLocaleString()}`,
            sub: debtVelocity > debtVelocityPrev ? "Accelerating 🚀" : "Steady pace",
            icon: Zap,
            color: "indigo"
        },
        {
            label: "Net Cashflow",
            value: `${netCashflow >= 0 ? '+' : '-'}$${Math.abs(netCashflow).toLocaleString()}`,
            sub: "This Month",
            icon: TrendingUp,
            color: netCashflow >= 0 ? "emerald" : "rose"
        }
    ];

    return (
        <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-indigo-400 mr-2">04</span>
                Momentum Tracker
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <GlassCard key={idx} className="p-4 flex items-center gap-4 relative overflow-hidden">
                        <div className={`w-10 h-10 rounded-full bg-${stat.color}-500/10 text-${stat.color}-400 flex items-center justify-center relative z-10`}>
                            <stat.icon size={20} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
                            <div className="text-xl font-bold text-white my-0.5">{stat.value}</div>
                            <div className="text-xs text-gray-400">{stat.sub}</div>
                        </div>
                        {/* Subtle background glow */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl pointer-events-none`}></div>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
}

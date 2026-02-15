import React from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { TrendingUp, ShieldCheck, AlertCircle, DollarSign, Calendar } from 'lucide-react';

export default function FinancialHealthPanel({ netPay, benefits, projection }) {

    // Derived metrics from the latest projection step
    const latestProjection = projection[projection.length - 1] || {};
    const firstProjection = projection[0] || {};

    // Calculate Surplus from the projection input (reverse engineer or pass it down?)
    // Ideally we pass "current monthly status" to this panel too.
    // For now, let's infer from the projection growth if possible, or just use the Net Pay + Benefits

    const monthlyIncome = (netPay.householdMonthly || 0) + (benefits.monthly || 0);
    // assets - debt = net worth.
    const currentNetWorth = firstProjection.netWorth || 0;
    const futureNetWorth = latestProjection.netWorth || 0;
    const netWorthGrowth = futureNetWorth - currentNetWorth;

    // Debt Free Date?
    // Find first projection point where debt is 0
    const debtFreePoint = projection.find(p => p.debt <= 0);
    const monthsToDebtFree = debtFreePoint ? (debtFreePoint.year * 12) : '> 60';

    return (
        <SurfaceCard className="bg-gradient-to-b from-surface-card to-black border-white/10 shadow-xl overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5 relative z-10">
                <div className="p-2 bg-gradient-to-br from-brand to-brand/50 rounded-lg text-white shadow-lg shadow-brand/20">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Financial Health</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] text-emerald-400 font-medium tracking-wide">LIVE SIMULATION</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 relative z-10">

                {/* Monthly Cashflow */}
                <div className="group">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Monthly Power</h4>
                    <div className="flex justify-between items-center mb-2 px-3 py-2 rounded border border-white/5 bg-white/5 group-hover:border-white/10 transition-colors">
                        <span className="text-gray-400 text-xs">Net Income</span>
                        <span className="text-white font-mono font-bold">${Math.round(monthlyIncome).toLocaleString()}</span>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between items-end mb-1">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Est. Monthly Surplus</div>
                            <div className="text-xl font-bold text-white">
                                ${Math.round((futureNetWorth - currentNetWorth) / 60).toLocaleString()}
                            </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-brand h-full rounded-full w-3/4 max-w-full" />
                        </div>
                    </div>
                </div>

                {/* 5-Year Growth */}
                <div className="p-4 bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-xl">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 5-Year Growth
                    </h4>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold text-white tracking-tight">${(futureNetWorth).toLocaleString()}</div>
                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                            +{Math.round((futureNetWorth / Math.max(1, currentNetWorth) - 1) * 100)}%
                        </div>
                    </div>
                </div>

                {/* Debt Freedom */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Projected Freedom</h4>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-full border border-white/5">
                            <Calendar className="w-5 h-5 text-gray-300" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {typeof monthsToDebtFree === 'number'
                                    ? monthsToDebtFree < 12
                                        ? `${Math.ceil(monthsToDebtFree)} Months`
                                        : `${(monthsToDebtFree / 12).toFixed(1)} Years`
                                    : '5+ Years'}
                            </div>
                            <div className="text-xs text-brand font-medium">Debt Free Trajectory</div>
                        </div>
                    </div>
                </div>

            </div>
        </SurfaceCard>
    );
}

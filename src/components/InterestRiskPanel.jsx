import { TrendingUp, DollarSign, AlertTriangle, ArrowRight, PiggyBank } from 'lucide-react';
import { SurfaceCard } from './common/SurfaceCard';
import Tooltip from './Tooltip';

export default function InterestRiskPanel({ projections, savingsOpportunities, worstOffender, debts }) {
    if (!projections) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 1. Projected Waste */}
            <SurfaceCard className="flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white">Projected Waste</h3>
                        <Tooltip content="Total interest you will pay over the next 12 months if only minimum payments are made.">
                            <DollarSign className="w-4 h-4 text-gray-500 ml-1 cursor-help hover:text-gray-300" />
                        </Tooltip>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">Estimated interest cost if you only pay minimums.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-400">Next 12 Months</span>
                        <span className="text-2xl font-bold text-white">
                            ${projections.months12.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: '100%' }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                        <div>3 Mo: <span className="text-gray-300 font-semibold">${projections.months3.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                        <div className="text-right">6 Mo: <span className="text-gray-300 font-semibold">${projections.months6.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                    </div>
                </div>
            </SurfaceCard>

            {/* 2. Worst Offender */}
            <SurfaceCard className="flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white">Cost of Delay</h3>
                        <Tooltip content="The amount of interest accruing every single day you carry this debt.">
                            <ArrowRight className="w-4 h-4 text-gray-500 ml-1 cursor-help hover:text-gray-300" />
                        </Tooltip>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">The single most expensive debt to hold onto right now.</p>
                </div>

                {worstOffender ? (
                    <div className="bg-amber-500/[0.05] rounded-xl p-5 border border-amber-500/20">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-amber-200">{worstOffender.name}</h4>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-2xl font-bold text-amber-400">
                                ${worstOffender.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm text-amber-400/60 font-medium">/ month</span>
                        </div>
                        <p className="text-xs text-amber-400/60 mt-2">
                            Extra cost incurred purely by interest rates.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm italic border border-dashed border-white/10 rounded-xl">
                        No significant outliers found.
                    </div>
                )}
            </SurfaceCard>

            {/* 3. Savings Opportunity */}
            <SurfaceCard className="flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                            <PiggyBank className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white">Savings Ops</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">Avoid future rate hikes by paying these off early.</p>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[140px] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                    {savingsOpportunities.length > 0 ? (
                        savingsOpportunities.map((op, i) => (
                            <div key={op.id} className="flex justify-between items-center group p-2 hover:bg-white/[0.03] rounded-lg transition-colors border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-600 w-4">{i + 1}.</span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-200">{op.name}</p>
                                        <p className="text-[10px] text-gray-500">Save ${Math.round(op.monthly)}/mo</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-emerald-400">
                                    ${op.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm italic border border-dashed border-white/10 rounded-xl">
                            No immediate rate hikes detected.
                        </div>
                    )}
                </div>
                {savingsOpportunities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-center text-gray-500 font-medium">
                        Consider allocating extra cash to these first.
                    </div>
                )}
            </SurfaceCard>
        </div>
    );
}

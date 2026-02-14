import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Sliders, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSimulatorProjections } from './useSimulatorProjections';

export default function ImpactSimulator({ simulatorState, setSimulatorState, transactions, debts, income, profile }) {

    // Projections
    const {
        projectedNetWorth,
        netWorthVisualDelta,
        dateStr,
        monthsSaved,
        interestSaved
    } = useSimulatorProjections(simulatorState, transactions, debts, income, profile);

    // Handlers
    const handleChange = (key, val) => {
        setSimulatorState(prev => ({ ...prev, [key]: parseInt(val) }));
    };

    return (
        <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-indigo-400 mr-2">03</span>
                Impact Simulator
            </h3>

            <GlassCard className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Controls */}
                    <div className="col-span-1 space-y-6">
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-300 flex justify-between">
                                    <span>Extra Debt Payment</span>
                                    <span className="text-indigo-400 font-bold">+${simulatorState.extraDebtPayment}/mo</span>
                                </span>
                                <input
                                    type="range"
                                    min="0"
                                    max="2000"
                                    step="50"
                                    value={simulatorState.extraDebtPayment}
                                    onChange={(e) => handleChange('extraDebtPayment', e.target.value)}
                                    className="w-full mt-2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-300 flex justify-between">
                                    <span>Cut Discretionary Spending</span>
                                    <span className="text-emerald-400 font-bold">-${simulatorState.spendingCut}/mo</span>
                                </span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={simulatorState.spendingCut}
                                    onChange={(e) => handleChange('spendingCut', e.target.value)}
                                    className="w-full mt-2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-300 flex justify-between">
                                    <span>Cancel Subscriptions</span>
                                    <span className="text-orange-400 font-bold">-${simulatorState.subscriptionCancel}/mo</span>
                                </span>
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    step="10"
                                    value={simulatorState.subscriptionCancel}
                                    onChange={(e) => handleChange('subscriptionCancel', e.target.value)}
                                    className="w-full mt-2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Results Display */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Result Card 1: Debt Free Date */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Calendar size={48} />
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Debt Free Date</div>
                                <div className="text-2xl font-bold text-white mb-1">{dateStr}</div>
                                <div className={`text-xs flex items-center gap-1 ${monthsSaved > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    <TrendingUp size={12} />
                                    <span>{monthsSaved > 0 ? `${Math.round(monthsSaved)} months sooner` : 'No change'}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 text-gray-400 text-xs">
                                Save <span className="text-indigo-400 font-bold">${Math.round(interestSaved).toLocaleString()}</span> in interest
                            </div>
                        </div>

                        {/* Result Card 2: 12-Month Net Worth */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <DollarSign size={48} />
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Proj. Net Worth (12mo)</div>
                                <div className="text-2xl font-bold text-white mb-1">${Math.round(projectedNetWorth).toLocaleString()}</div>
                                <div className={`text-xs flex items-center gap-1 ${netWorthVisualDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <TrendingUp size={12} />
                                    <span>{netWorthVisualDelta >= 0 ? '+' : ''}${Math.round(netWorthVisualDelta).toLocaleString()} impact</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 text-gray-400 text-xs">
                                Effect of your changes
                            </div>
                        </div>

                    </div>
                </div>
            </GlassCard>
        </section>
    );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useFinancialMoves } from './useFinancialMoves';

export default function TopMovesSection({ transactions, debts, recurringExpenses, income }) {

    // Real Intelligence Hook
    const moves = useFinancialMoves(transactions, debts, recurringExpenses, income || {});

    if (moves.length === 0) {
        return (
            <section className="h-full flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <span className="text-indigo-400 mr-2">01</span>
                    This Month's Top 3 Moves
                </h3>
                <GlassCard className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-gray-500">
                        <p className="mb-2">All systems optimal.</p>
                        <p className="text-sm">No critical actions required at this moment.</p>
                    </div>
                </GlassCard>
            </section>
        );
    }

    return (
        <section className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-indigo-400 mr-2">01</span>
                This Month's Top 3 Moves
            </h3>

            <div className="flex-1 grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {moves.map((move, idx) => (
                        <motion.div
                            key={move.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlassCard className="relative overflow-hidden group hover:bg-white/5 transition-all cursor-pointer border-l-4"
                                style={{ borderLeftColor: `var(--brand-${move.type === 'critical' ? 'danger' : move.type === 'high' ? 'warning' : 'success'})` }}>

                                <div className="flex items-center justify-between p-2">
                                    {/* Icon & Main Info */}
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${move.color}-500/10 text-${move.color}-400`}>
                                            <move.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-${move.color}-500/20 text-${move.color}-400`}>
                                                    {move.type} Priority
                                                </span>
                                                <span className="text-xs text-gray-500">• {move.time}</span>
                                            </div>
                                            <h4 className="text-white font-bold text-lg leading-tight">{move.title}</h4>
                                            <p className="text-gray-400 text-sm mt-0.5">{move.subtitle}</p>
                                        </div>
                                    </div>

                                    {/* Impact & Action */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Financial Impact</div>
                                            <div className="text-emerald-400 font-bold text-lg">{move.impact}</div>
                                        </div>

                                        <button className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors group-hover:scale-110">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}

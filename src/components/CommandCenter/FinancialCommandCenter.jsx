import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, Target, Zap } from 'lucide-react';
import { PageContainer } from '../common/PageContainer';
import TopMovesSection from './TopMovesSection';
import RiskRadarChart from './RiskRadarChart';
import ImpactSimulator from './ImpactSimulator';
import MomentumTracker from './MomentumTracker';

export default function FinancialCommandCenter({
    transactions,
    income,
    debts,
    recurringExpenses,
    activePeriodKey,
    profile,
    monthlyLedger
}) {
    // --- State for Simulator (Lifted up to share context if needed) ---
    const [simulatorState, setSimulatorState] = useState({
        extraDebtPayment: 0,
        spendingCut: 0,
        subscriptionCancel: 0
    });

    return (
        <PageContainer
            title="Financial Command Center"
            subtitle="AI-Powered Strategy Engine"
            activeMonth={activePeriodKey}
        >
            <div className="space-y-6">

                {/* Header Badge */}
                <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <BrainCircuit className="w-3 h-3 mr-1" />
                        Intelligence Active
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Activity className="w-3 h-3 mr-1" />
                        Live Data Connected
                    </span>
                </div>

                {/* Top Section: Action Queue & Risk Radar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Top 3 Moves (Dominant) */}
                    <div className="lg:col-span-2">
                        <TopMovesSection
                            transactions={transactions}
                            debts={debts}
                            recurringExpenses={recurringExpenses}
                            income={income}
                        />
                    </div>

                    {/* Right: Risk Radar */}
                    <div className="lg:col-span-1">
                        <RiskRadarChart
                            transactions={transactions}
                            income={income}
                            debts={debts}
                            profile={profile}
                        />
                    </div>
                </div>

                {/* Middle: Impact Simulator */}
                <ImpactSimulator
                    simulatorState={simulatorState}
                    setSimulatorState={setSimulatorState}
                    transactions={transactions}
                    debts={debts}
                    income={income}
                    profile={profile}
                />

                {/* Bottom: Momentum Tracker */}
                <MomentumTracker
                    transactions={transactions}
                    monthlyLedger={monthlyLedger}
                    debts={debts}
                />
            </div>
        </PageContainer>
    );
}

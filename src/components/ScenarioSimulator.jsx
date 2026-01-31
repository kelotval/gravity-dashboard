import React, { useState, useMemo, useEffect } from "react";
import { Sliders, TrendingUp, DollarSign, Percent, RefreshCw, AlertCircle, Zap, Info } from "lucide-react";
import { calculateDetailedHealthScore } from "../utils/healthScore";

export default function ScenarioSimulator({ income = {}, transactions = [], debts = [] }) {
    // Scenario state
    const [scenarioIncome, setScenarioIncome] = useState(income);
    const [scenarioSurplus, setScenarioSurplus] = useState(0);
    const [scenarioRates, setScenarioRates] = useState({});
    const [scenarioRefinance, setScenarioRefinance] = useState({});

    // Sync scenarioIncome when income prop changes
    useEffect(() => {
        setScenarioIncome(income);
    }, [income]);

    // Calculate current metrics
    const currentMetrics = useMemo(() => {
        try {
            const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
            const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
            const totalDebt = debts.reduce((acc, d) => acc + d.currentBalance, 0);
            const totalDebtPayments = debts.reduce((acc, d) => acc + (d.monthlyRepayment || 0), 0);
            const netSavings = fullIncome - totalExpenses;
            const savingsRate = fullIncome > 0 ? ((netSavings / fullIncome) * 100) : 0;
            const dtiRatio = fullIncome > 0 ? ((totalDebtPayments / fullIncome) * 100) : 0;

            // Call health score with correct parameters
            let healthScore = 50;
            try {
                const healthData = calculateDetailedHealthScore({
                    savingsRate,
                    dtiRatio,
                    debts,
                    netSavings,
                    totalIncome: fullIncome
                });
                healthScore = healthData?.totalScore || 50;
            } catch (err) {
                console.warn("Health score calculation failed, using simple calculation", err);
                // Simple alternative
                healthScore = Math.max(0, Math.min(100, 50 + savingsRate - (dtiRatio * 0.5)));
            }

            const maxMonths = debts.length > 0
                ? Math.max(...debts.map(d => {
                    const payment = d.monthlyRepayment || 0;
                    return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
                }))
                : 0;

            const debtFreeDate = new Date();
            debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

            const totalInterest = debts.reduce((acc, d) => {
                if (!d.monthlyRepayment || !d.currentBalance) return acc;
                const months = d.monthlyRepayment > 0 ? Math.ceil(d.currentBalance / d.monthlyRepayment) : 0;
                if (months === 0 || months > 999) return acc;
                const totalPaid = d.monthlyRepayment * months;
                const interest = Math.max(0, totalPaid - d.currentBalance);
                return acc + (isNaN(interest) ? 0 : interest);
            }, 0);

            return {
                healthScore: healthScore,
                debtFreeDate: maxMonths < 999 ? debtFreeDate : null,
                totalInterest: Math.round(totalInterest),
                netWorth: netSavings - totalDebt,
                monthsToDebtFree: maxMonths < 999 ? maxMonths : null
            };
        } catch (error) {
            console.error("Error calculating current metrics:", error);
            return {
                healthScore: 0,
                debtFreeDate: null,
                totalInterest: 0,
                netWorth: 0,
                monthsToDebtFree: null
            };
        }
    }, [income, transactions, debts]);

    // Calculate scenario metrics
    const scenarioMetrics = useMemo(() => {
        try {
            const fullIncome = Object.values(scenarioIncome).reduce((a, b) => a + b, 0);
            const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);

            const adjustedDebts = debts.map(d => {
                const rateAdjustment = scenarioRates[d.id] || 0;
                const isRefinanced = scenarioRefinance[d.id];

                let newRate = d.interestRate + rateAdjustment;
                if (isRefinanced?.enabled) {
                    newRate = isRefinanced.newRate;
                }

                const extraPayment = scenarioSurplus / Math.max(1, debts.length);
                const newPayment = (d.monthlyRepayment || 0) + extraPayment;

                return {
                    ...d,
                    interestRate: newRate,
                    monthlyRepayment: newPayment
                };
            });

            const totalDebt = adjustedDebts.reduce((acc, d) => acc + d.currentBalance, 0);
            const totalDebtPayments = adjustedDebts.reduce((acc, d) => acc + (d.monthlyRepayment || 0), 0);
            const netSavings = fullIncome - totalExpenses;
            const savingsRate = fullIncome > 0 ? ((netSavings / fullIncome) * 100) : 0;
            const dtiRatio = fullIncome > 0 ? ((totalDebtPayments / fullIncome) * 100) : 0;

            // Call health score with correct parameters
            let healthScore = 50;
            try {
                const healthData = calculateDetailedHealthScore({
                    savingsRate,
                    dtiRatio,
                    debts: adjustedDebts,
                    netSavings,
                    totalIncome: fullIncome
                });
                healthScore = healthData?.totalScore || 50;
            } catch (err) {
                console.warn("Scenario health score calculation failed, using simple calculation", err);
                healthScore = Math.max(0, Math.min(100, 50 + savingsRate - (dtiRatio * 0.5)));
            }

            const maxMonths = adjustedDebts.length > 0
                ? Math.max(...adjustedDebts.map(d => {
                    const payment = d.monthlyRepayment || 0;
                    return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
                }))
                : 0;

            const debtFreeDate = new Date();
            debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

            const totalInterest = adjustedDebts.reduce((acc, d) => {
                if (!d.monthlyRepayment || !d.currentBalance || !d.interestRate) return acc;
                const months = d.monthlyRepayment > 0 ? Math.ceil(d.currentBalance / d.monthlyRepayment) : 0;
                if (months === 0 || months > 999) return acc;
                const monthlyInterest = (d.currentBalance * d.interestRate / 100) / 12;
                const interest = monthlyInterest * months;
                return acc + (isNaN(interest) ? 0 : interest);
            }, 0);

            return {
                healthScore: healthScore,
                debtFreeDate: maxMonths < 999 ? debtFreeDate : null,
                totalInterest: Math.round(totalInterest),
                netWorth: netSavings - totalDebt,
                monthsToDebtFree: maxMonths < 999 ? maxMonths : null
            };
        } catch (error) {
            console.error("Error calculating scenario metrics:", error);
            return currentMetrics;
        }
    }, [scenarioIncome, scenarioSurplus, scenarioRates, scenarioRefinance, transactions, debts, currentMetrics]);

    // Handlers
    const toggleIncome = (source) => {
        setScenarioIncome(prev => ({
            ...prev,
            [source]: prev[source] === 0 ? income[source] : 0
        }));
    };

    const adjustRate = (debtId, adjustment) => {
        setScenarioRates(prev => ({
            ...prev,
            [debtId]: (prev[debtId] || 0) + adjustment
        }));
    };

    const toggleRefinance = (debtId, newRate) => {
        setScenarioRefinance(prev => {
            const current = prev[debtId] || { enabled: false, newRate: 0 };
            return {
                ...prev,
                [debtId]: {
                    enabled: !current.enabled,
                    newRate: newRate || current.newRate
                }
            };
        });
    };

    const resetAll = () => {
        setScenarioIncome(income);
        setScenarioSurplus(0);
        setScenarioRates({});
        setScenarioRefinance({});
    };

    // Calculations
    const fullIncome = Object.values(income).reduce((a, b) => a + b, 0);
    const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
    const totalDebtPayments = debts.reduce((acc, d) => acc + (d.monthlyRepayment || 0), 0);
    const maxSurplus = Math.max(0, fullIncome - totalExpenses - totalDebtPayments);

    const healthDiff = scenarioMetrics.healthScore - currentMetrics.healthScore;
    const monthsDiff = (scenarioMetrics.monthsToDebtFree || 0) - (currentMetrics.monthsToDebtFree || 0);
    const interestDiff = scenarioMetrics.totalInterest - currentMetrics.totalInterest;
    const netWorthDiff = scenarioMetrics.netWorth - currentMetrics.netWorth;

    // Empty state check
    if (Object.keys(income).length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 dark:bg-gray-800 dark:border-gray-700">
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-full mb-4 dark:bg-purple-900/40">
                        <Sliders className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                        No Income Data Available
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Add income sources to start simulating scenarios.
                    </p>
                </div>
            </div>
        );
    }

    const hasChanges = Object.values(scenarioIncome).some((val, idx) => val !== Object.values(income)[idx]) ||
        scenarioSurplus > 0 ||
        Object.keys(scenarioRates).length > 0 ||
        Object.keys(scenarioRefinance).some(key => scenarioRefinance[key]?.enabled);

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Zap className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">What-If Scenario Simulator</h2>
                            <p className="text-purple-100 text-sm">Toggle assumptions and see instant financial impact</p>
                        </div>
                    </div>
                    {hasChanges && (
                        <button
                            onClick={resetAll}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="font-medium">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Health Score */}
                <div className={`bg-gradient-to-br ${healthDiff >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'} rounded-xl p-4 text-white shadow-lg group relative`}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Health Score</div>
                        <div className="relative">
                            <Info className="w-3.5 h-3.5 text-white/60 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                Overall financial health based on savings rate, debt-to-income ratio, debt quality, cash flow, and rate risk.
                            </div>
                        </div>
                    </div>
                    <div className="text-4xl font-bold mb-1">{Math.round(scenarioMetrics.healthScore)}</div>
                    <div className="flex items-center gap-1 text-white/90 text-sm font-semibold">
                        {healthDiff !== 0 && (
                            <>
                                <span>{healthDiff > 0 ? '↑' : '↓'}</span>
                                <span>{Math.abs(Math.round(healthDiff))} points</span>
                            </>
                        )}
                        {healthDiff === 0 && <span>No change</span>}
                    </div>
                </div>

                {/* Debt-Free Date */}
                <div className={`bg-gradient-to-br ${monthsDiff <= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'} rounded-xl p-4 text-white shadow-lg group relative`}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Debt-Free</div>
                        <div className="relative">
                            <Info className="w-3.5 h-3.5 text-white/60 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                Projected date when all debts will be fully paid off at current repayment rates.
                            </div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                        {scenarioMetrics.debtFreeDate ? scenarioMetrics.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1 text-white/90 text-sm font-semibold">
                        {monthsDiff !== 0 && (
                            <>
                                <span>{monthsDiff < 0 ? '↑' : '↓'}</span>
                                <span>{Math.abs(monthsDiff)} months</span>
                            </>
                        )}
                        {monthsDiff === 0 && <span>No change</span>}
                    </div>
                </div>

                {/* Total Interest */}
                <div className={`bg-gradient-to-br ${interestDiff <= 0 ? 'from-violet-500 to-purple-600' : 'from-amber-500 to-orange-600'} rounded-xl p-4 text-white shadow-lg group relative`}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Total Interest</div>
                        <div className="relative">
                            <Info className="w-3.5 h-3.5 text-white/60 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                Total interest you'll pay over the life of all debts. Lower is better!
                            </div>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        ${((scenarioMetrics.totalInterest || 0) / 1000).toFixed(1)}K
                    </div>
                    <div className="flex items-center gap-1 text-white/90 text-sm font-semibold">
                        {interestDiff !== 0 && (
                            <>
                                <span>{interestDiff < 0 ? '↓' : '↑'}</span>
                                <span>${Math.abs(Math.round(interestDiff / 100) / 10)}K</span>
                            </>
                        )}
                        {interestDiff === 0 && <span>No change</span>}
                    </div>
                </div>

                {/* Net Worth */}
                <div className={`bg-gradient-to-br ${netWorthDiff >= 0 ? 'from-cyan-500 to-blue-600' : 'from-pink-500 to-rose-600'} rounded-xl p-4 text-white shadow-lg group relative`}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Net Worth</div>
                        <div className="relative">
                            <Info className="w-3.5 h-3.5 text-white/60 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                Your net savings minus total debt. Shows overall financial position.
                            </div>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        ${((scenarioMetrics.netWorth || 0) / 1000).toFixed(1)}K
                    </div>
                    <div className="flex items-center gap-1 text-white/90 text-sm font-semibold">
                        {netWorthDiff !== 0 && (
                            <>
                                <span>{netWorthDiff > 0 ? '↑' : '↓'}</span>
                                <span>${Math.abs(Math.round(netWorthDiff / 100) / 10)}K</span>
                            </>
                        )}
                        {netWorthDiff === 0 && <span>No change</span>}
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            {(healthDiff < -10 || monthsDiff > 6) && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w6 h-6 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1">⚠️ Significant Negative Impact</p>
                            <p className="text-sm text-white/90">
                                This scenario would substantially worsen your financial position. Consider alternative strategies.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Income Toggles */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Income Sources</h3>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(income).map(([source, amount]) => (
                            <button
                                key={source}
                                onClick={() => toggleIncome(source)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${scenarioIncome[source] > 0
                                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{source}</span>
                                    <span className={`text-lg font-bold ${scenarioIncome[source] > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                                        ${amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className={`text-xs font-medium ${scenarioIncome[source] > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500'}`}>
                                    {scenarioIncome[source] > 0 ? '✓ Active' : '✗ Disabled (simulating loss)'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Surplus & Debt Controls */}
                <div className="space-y-6">
                    {/* Surplus Slider */}
                    {maxSurplus > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Extra Debt Payment</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">${scenarioSurplus.toLocaleString()}/month</p>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={maxSurplus}
                                step="50"
                                value={scenarioSurplus}
                                onChange={(e) => setScenarioSurplus(Number(e.target.value))}
                                className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <span>$0</span>
                                <span className="font-semibold">${maxSurplus.toLocaleString()} available</span>
                            </div>
                        </div>
                    )}

                    {/* Debt Adjustments */}
                    {debts.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                                    <Percent className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Interest Rate Scenarios</h3>
                            </div>
                            <div className="space-y-3">
                                {debts.map(debt => {
                                    const currentAdjustment = scenarioRates[debt.id] || 0;
                                    const refinanceData = scenarioRefinance[debt.id];
                                    const displayRate = refinanceData?.enabled
                                        ? refinanceData.newRate
                                        : debt.interestRate + currentAdjustment;

                                    return (
                                        <div key={debt.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-semibold text-gray-900 dark:text-white">{debt.name}</span>
                                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    {displayRate.toFixed(2)}% APR
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => adjustRate(debt.id, 1)}
                                                    className="px-3 py-2 text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 shadow-sm transition-all"
                                                >
                                                    +1% ↑
                                                </button>
                                                <button
                                                    onClick={() => adjustRate(debt.id, -1)}
                                                    className="px-3 py-2 text-xs font-bold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-sm transition-all"
                                                >
                                                    -1% ↓
                                                </button>
                                                <button
                                                    onClick={() => toggleRefinance(debt.id, debt.interestRate * 0.5)}
                                                    className={`px-3 py-2 text-xs font-bold rounded-lg shadow-sm transition-all ${refinanceData?.enabled
                                                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                                                        : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-200'
                                                        }`}
                                                >
                                                    {refinanceData?.enabled ? '✓ Refi' : 'Refi'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

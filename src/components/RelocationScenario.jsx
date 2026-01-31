import React, { useState, useMemo } from "react";
import { Globe, DollarSign, TrendingUp, Home, Plane, Target, Info, BarChart3, Calendar, Sparkles, Award, Car, GraduationCap, RefreshCw, Shield, Zap } from "lucide-react";

const SAR_TO_AUD = 0.41; // Exchange rate

// EOSG Calculation
const calculateEOSG = (baseSalaryAnnual, years) => {
    const monthlySalary = baseSalaryAnnual / 12;
    const first5Years = Math.min(years, 5) * monthlySalary * 0.5;
    const after5Years = Math.max(0, years - 5) * monthlySalary * 1.0;
    return first5Years + after5Years;
};

// Trade-off Index Calculator
const calculateTradeOffIndex = (financialMetrics, scenarioSettings) => {
    // Financial Upside (40%): Based on 5-year net worth improvement
    const financialUpside = Math.min(100, (financialMetrics.netWorthDelta5yr / 100000) * 20);

    // Career Signaling Value (20%): Higher for senior grades
    const careerValue = scenarioSettings.grade === 14 ? 85 : 75;

    // Geographic Mobility Risk (15%): Inverse - higher risk = lower score
    const mobilityRisk = 35; // Saudi has moderate lock-in

    // Family/Lifestyle Impact (15%): Based on user lifestyle score
    const lifestyleImpact = scenarioSettings.lifestyleScore * 10;

    // Exit Optionality (10%): Post-Aramco career value
    const exitOptions = 80; // Aramco experience is highly valued

    return {
        total: Math.round(
            financialUpside * 0.4 +
            careerValue * 0.2 +
            (100 - mobilityRisk) * 0.15 +
            lifestyleImpact * 0.15 +
            exitOptions * 0.1
        ),
        breakdown: {
            financialUpside: Math.round(financialUpside),
            careerValue,
            mobilityRisk,
            lifestyleImpact: Math.round(lifestyleImpact),
            exitOptions
        }
    };
};

export default function RelocationScenario({ income = {}, transactions = [], debts = [] }) {
    // Calculate Sydney baseline
    const sydneyBaseline = useMemo(() => {
        const totalIncome = Object.values(income).reduce((a, b) => a + b, 0);
        const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalDebtPayments = debts.reduce((sum, d) => sum + (d.monthlyRepayment || 0), 0);
        const monthlySurplus = totalIncome - totalExpenses - totalDebtPayments;

        const maxMonths = debts.length > 0
            ? Math.max(...debts.map(d => {
                const payment = d.monthlyRepayment || 0;
                return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
            }))
            : 0;

        return {
            monthlyIncome: totalIncome,
            monthlyExpenses: totalExpenses,
            monthlyDebtPayments: totalDebtPayments,
            monthlySurplus,
            monthsToDebtFree: maxMonths < 999 ? maxMonths : null,
            netWorth1yr: monthlySurplus * 12,
            netWorth3yr: monthlySurplus * 36,
            netWorth5yr: monthlySurplus * 60
        };
    }, [income, transactions, debts]);

    // Scenario selector
    const [scenario, setScenario] = useState('expected'); // conservative | expected | optimistic

    // Aramco profile state
    const [aramcoProfile, setAramcoProfile] = useState({
        grade: 13,
        baseSalaryAnnual: 500000, // SAR
        bonusPercent: 20,
        yearsOfService: 3,
        allowances: {
            housing: { enabled: true, type: 'compound', valueSAR: 120000 }, // Annual
            transport: { enabled: true, valueSAR: 2400 }, // Monthly
            flights: { enabled: true, valueSAR: 12000 }, // Annual
            relocation: { enabled: true, valueSAR: 50000 }, // One-time
            education: { enabled: false, valueSAR: 0 } // Annual
        },
        colAdjustment: -25, // % vs Sydney
        savingsFriction: 10, // % of surplus lost to lifestyle creep
        partnerIncome: false,
        lifestyleScore: 7 // 1-10
    });

    // Update aramco profile
    const updateAramco = (field, value) => {
        setAramcoProfile(prev => ({ ...prev, [field]: value }));
    };

    const updateAllowance = (allowanceKey, field, value) => {
        setAramcoProfile(prev => ({
            ...prev,
            allowances: {
                ...prev.allowances,
                [allowanceKey]: {
                    ...prev.allowances[allowanceKey],
                    [field]: value
                }
            }
        }));
    };

    // Apply scenario multipliers
    const scenarioMultipliers = {
        conservative: { salary: 1.0, bonus: 15, negotiation: 1.0 },
        expected: { salary: 1.0, bonus: 20, negotiation: 1.0 },
        optimistic: { salary: 1.2, bonus: 25, negotiation: 1.0 }
    };

    const activeMultiplier = scenarioMultipliers[scenario];

    // Calculate Aramco metrics
    const aramcoMetrics = useMemo(() => {
        const adjustedSalary = aramcoProfile.baseSalaryAnnual * activeMultiplier.salary;
        const annualBonus = adjustedSalary * (activeMultiplier.bonus / 100);
        const totalAnnualComp = adjustedSalary + annualBonus;
        const monthlyNetSAR = totalAnnualComp / 12; // Tax-free

        // Allowances (convert annual to monthly)
        const housingMonthly = aramcoProfile.allowances.housing.enabled ? aramcoProfile.allowances.housing.valueSAR / 12 : 0;
        const transportMonthly = aramcoProfile.allowances.transport.enabled ? aramcoProfile.allowances.transport.valueSAR : 0;
        const flightsMonthly = aramcoProfile.allowances.flights.enabled ? aramcoProfile.allowances.flights.valueSAR / 12 : 0;
        const educationMonthly = aramcoProfile.allowances.education.enabled ? aramcoProfile.allowances.education.valueSAR / 12 : 0;

        const totalAllowancesMonthlySAR = housingMonthly + transportMonthly + flightsMonthly + educationMonthly;
        const totalMonthlyCompSAR = monthlyNetSAR + totalAllowancesMonthlySAR;

        // Convert to AUD
        const totalMonthlyCompAUD = totalMonthlyCompSAR * SAR_TO_AUD;

        // Adjust expenses for COL
        const adjustedExpensesAUD = sydneyBaseline.monthlyExpenses * (1 + aramcoProfile.colAdjustment / 100);

        // Partner income consideration
        const partnerIncomeAUD = aramcoProfile.partnerIncome ? (sydneyBaseline.monthlyIncome * 0.4) : 0; // Assume partner was 40% of household

        // Monthly surplus before friction
        const grossSurplusAUD = totalMonthlyCompAUD + partnerIncomeAUD - adjustedExpensesAUD - sydneyBaseline.monthlyDebtPayments;

        // Apply savings friction
        const netSurplusAUD = grossSurplusAUD * (1 - aramcoProfile.savingsFriction / 100);

        // Debt payoff timeline with new surplus
        const extraPayment = Math.max(0, netSurplusAUD - sydneyBaseline.monthlySurplus);
        const extraPaymentPerDebt = extraPayment / Math.max(1, debts.length);

        const newMaxMonths = debts.length > 0
            ? Math.max(...debts.map(d => {
                const payment = (d.monthlyRepayment || 0) + extraPaymentPerDebt;
                return payment > 0 ? Math.ceil(d.currentBalance / payment) : 999;
            }))
            : 0;

        // Net worth projections (subtract relocation cost from first year)
        const relocationCostAUD = aramcoProfile.allowances.relocation.enabled
            ? aramcoProfile.allowances.relocation.valueSAR * SAR_TO_AUD
            : 0;

        const netWorth1yr = (netSurplusAUD * 12) - relocationCostAUD;
        const netWorth3yr = (netSurplusAUD * 36) - relocationCostAUD;
        const netWorth5yr = (netSurplusAUD * 60) - relocationCostAUD;

        // EOSG value (end of service gratuity)
        const eosgSAR = calculateEOSG(adjustedSalary, aramcoProfile.yearsOfService);
        const eosgAUD = eosgSAR * SAR_TO_AUD;

        // Break-even calculation
        const surplusDiff = netSurplusAUD - sydneyBaseline.monthlySurplus;
        const breakEvenMonths = surplusDiff > 0 ? Math.ceil(relocationCostAUD / surplusDiff) : null;

        return {
            monthlyNetSAR,
            totalAllowancesMonthlySAR,
            totalMonthlyCompSAR,
            totalMonthlyCompAUD,
            adjustedExpensesAUD,
            netSurplusAUD,
            surplusDiff,
            monthsToDebtFree: newMaxMonths < 999 ? newMaxMonths : null,
            monthsSaved: (sydneyBaseline.monthsToDebtFree || 0) - (newMaxMonths < 999 ? newMaxMonths : 0),
            netWorth1yr,
            netWorth3yr,
            netWorth5yr,
            netWorthDelta1yr: netWorth1yr - sydneyBaseline.netWorth1yr,
            netWorthDelta3yr: netWorth3yr - sydneyBaseline.netWorth3yr,
            netWorthDelta5yr: netWorth5yr - sydneyBaseline.netWorth5yr,
            eosgSAR,
            eosgAUD,
            breakEvenMonths,
            relocationCostAUD
        };
    }, [aramcoProfile, sydneyBaseline, debts, scenario, activeMultiplier]);

    // Calculate trade-off index
    const tradeOffIndex = useMemo(() =>
        calculateTradeOffIndex(aramcoMetrics, aramcoProfile),
        [aramcoMetrics, aramcoProfile]
    );

    // Financial years accelerated
    const yearsAccelerated = (aramcoMetrics.netWorthDelta5yr / (sydneyBaseline.monthlySurplus * 12)).toFixed(1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/30 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Globe className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-1">Saudi Aramco Offer (Dhahran)</h1>
                                <p className="text-amber-100 text-lg">
                                    Tax-free expat package with grade-based compensation and long-term wealth impact
                                </p>
                            </div>
                        </div>

                        {/* Scenario Selector */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {['conservative', 'expected', 'optimistic'].map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setScenario(key)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${scenario === key
                                            ? 'bg-white/30 border-white backdrop-blur-md scale-105 shadow-xl'
                                            : 'bg-white/10 border-white/30 hover:bg-white/20'
                                        }`}
                                >
                                    <div className="font-bold text-lg mb-1 capitalize">{key}</div>
                                    <div className="text-sm text-white/80">
                                        {key === 'conservative' && 'Base salary, 15% bonus'}
                                        {key === 'expected' && '20% bonus, standard'}
                                        {key === 'optimistic' && '+20% uplift, 25% bonus'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grade & Compensation Configuration */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Award className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-white">Grade & Base Compensation</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Grade Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Grade Level <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">📊 Estimated</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[13, 14].map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => updateAramco('grade', grade)}
                                        className={`p-3 rounded-xl border-2 transition-all font-bold ${aramcoProfile.grade === grade
                                                ? 'bg-amber-500 border-amber-400 text-white'
                                                : 'bg-slate-700 border-slate-600 text-gray-300 hover:border-amber-500'
                                            }`}
                                    >
                                        Grade {grade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Base Salary */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Base Annual Salary (SAR) <span className="text-xs bg-purple-600 px-2 py-0.5 rounded">⚙️ User-Adjustable</span>
                            </label>
                            <input
                                type="number"
                                value={aramcoProfile.baseSalaryAnnual}
                                onChange={(e) => updateAramco('baseSalaryAnnual', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-3 border-2 border-slate-600 rounded-xl bg-slate-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                            />
                            <div className="text-xs text-gray-400 mt-1">
                                ≈ AUD ${Math.round(aramcoProfile.baseSalaryAnnual * SAR_TO_AUD).toLocaleString()}/yr
                            </div>
                        </div>

                        {/* Bonus Percent */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Annual Bonus % <span className="text-xs bg-purple-600 px-2 py-0.5 rounded">⚙️ User-Adjustable</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={aramcoProfile.bonusPercent}
                                    onChange={(e) => updateAramco('bonusPercent', parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-2xl font-bold text-amber-400 w-16 text-center">
                                    {aramcoProfile.bonusPercent}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Allowances System */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-white">Toggleable Allowances</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Housing */}
                        <div className={`p-5 rounded-xl border-2 transition-all ${aramcoProfile.allowances.housing.enabled
                                ? 'bg-amber-900/30 border-amber-600'
                                : 'bg-slate-700/50 border-slate-600'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Home className="w-5 h-5 text-amber-400" />
                                    <span className="font-bold text-white">Housing</span>
                                </div>
                                <button
                                    onClick={() => updateAllowance('housing', 'enabled', !aramcoProfile.allowances.housing.enabled)}
                                    className={`px-3 py-1 rounded-lg font-bold text-sm ${aramcoProfile.allowances.housing.enabled
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-600 text-gray-300'
                                        }`}
                                >
                                    {aramcoProfile.allowances.housing.enabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="text-2xl font-bold text-amber-400 mb-1">
                                {aramcoProfile.allowances.housing.valueSAR.toLocaleString()} SAR/yr
                            </div>
                            <div className="text-sm text-gray-400">
                                ≈ AUD ${Math.round(aramcoProfile.allowances.housing.valueSAR * SAR_TO_AUD).toLocaleString()}/yr
                            </div>
                        </div>

                        {/* Transport */}
                        <div className={`p-5 rounded-xl border-2 transition-all ${aramcoProfile.allowances.transport.enabled
                                ? 'bg-amber-900/30 border-amber-600'
                                : 'bg-slate-700/50 border-slate-600'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Car className="w-5 h-5 text-amber-400" />
                                    <span className="font-bold text-white">Transportation</span>
                                </div>
                                <button
                                    onClick={() => updateAllowance('transport', 'enabled', !aramcoProfile.allowances.transport.enabled)}
                                    className={`px-3 py-1 rounded-lg font-bold text-sm ${aramcoProfile.allowances.transport.enabled
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-600 text-gray-300'
                                        }`}
                                >
                                    {aramcoProfile.allowances.transport.enabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="text-2xl font-bold text-amber-400 mb-1">
                                {aramcoProfile.allowances.transport.valueSAR.toLocaleString()} SAR/mo
                            </div>
                            <div className="text-sm text-gray-400">
                                ≈ AUD ${Math.round(aramcoProfile.allowances.transport.valueSAR * SAR_TO_AUD).toLocaleString()}/mo
                            </div>
                        </div>

                        {/* Flights */}
                        <div className={`p-5 rounded-xl border-2 transition-all ${aramcoProfile.allowances.flights.enabled
                                ? 'bg-amber-900/30 border-amber-600'
                                : 'bg-slate-700/50 border-slate-600'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-amber-400" />
                                    <span className="font-bold text-white">Repatriation Flights</span>
                                </div>
                                <button
                                    onClick={() => updateAllowance('flights', 'enabled', !aramcoProfile.allowances.flights.enabled)}
                                    className={`px-3 py-1 rounded-lg font-bold text-sm ${aramcoProfile.allowances.flights.enabled
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-600 text-gray-300'
                                        }`}
                                >
                                    {aramcoProfile.allowances.flights.enabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="text-2xl font-bold text-amber-400 mb-1">
                                {aramcoProfile.allowances.flights.valueSAR.toLocaleString()} SAR/yr
                            </div>
                            <div className="text-sm text-gray-400">
                                ≈ AUD ${Math.round(aramcoProfile.allowances.flights.valueSAR * SAR_TO_AUD).toLocaleString()}/yr
                            </div>
                        </div>

                        {/* Relocation */}
                        <div className={`p-5 rounded-xl border-2 transition-all ${aramcoProfile.allowances.relocation.enabled
                                ? 'bg-amber-900/30 border-amber-600'
                                : 'bg-slate-700/50 border-slate-600'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-amber-400" />
                                    <span className="font-bold text-white">Relocation Package</span>
                                </div>
                                <button
                                    onClick={() => updateAllowance('relocation', 'enabled', !aramcoProfile.allowances.relocation.enabled)}
                                    className={`px-3 py-1 rounded-lg font-bold text-sm ${aramcoProfile.allowances.relocation.enabled
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-600 text-gray-300'
                                        }`}
                                >
                                    {aramcoProfile.allowances.relocation.enabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="text-2xl font-bold text-amber-400 mb-1">
                                {aramcoProfile.allowances.relocation.valueSAR.toLocaleString()} SAR (one-time)
                            </div>
                            <div className="text-sm text-gray-400">
                                ≈ AUD ${Math.round(aramcoProfile.allowances.relocation.valueSAR * SAR_TO_AUD).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Saudi-Specific Adjustments */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-white">Saudi-Specific Reality Adjustments</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* COL Adjustment */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Cost of Living vs Sydney (%)
                            </label>
                            <input
                                type="number"
                                value={aramcoProfile.colAdjustment}
                                onChange={(e) => updateAramco('colAdjustment', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-3 border-2 border-slate-600 rounded-xl bg-slate-700 text-white focus:border-amber-500"
                                placeholder="e.g., -25 (cheaper)"
                            />
                        </div>

                        {/* Savings Friction */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Savings Friction (%) - Lifestyle Creep
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={aramcoProfile.savingsFriction}
                                    onChange={(e) => updateAramco('savingsFriction', parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-2xl font-bold text-red-400 w-16 text-center">
                                    {aramcoProfile.savingsFriction}%
                                </span>
                            </div>
                        </div>

                        {/* Partner Income */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Partner Can Work?
                            </label>
                            <button
                                onClick={() => updateAramco('partnerIncome', !aramcoProfile.partnerIncome)}
                                className={`w-full px-4 py-3 rounded-xl border-2 font-bold transition-all ${aramcoProfile.partnerIncome
                                        ? 'bg-emerald-600 border-emerald-500 text-white'
                                        : 'bg-slate-700 border-slate-600 text-gray-300'
                                    }`}
                            >
                                {aramcoProfile.partnerIncome ? 'YES - Dual Income' : 'NO - Single Income'}
                            </button>
                        </div>
                    </div>

                    {/* Years of Service & EOSG */}
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Projected Years of Service
                                </label>
                                <input
                                    type="number"
                                    value={aramcoProfile.yearsOfService}
                                    onChange={(e) => updateAramco('yearsOfService', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border-2 border-slate-600 rounded-xl bg-slate-700 text-white focus:border-amber-500"
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div className="bg-amber-900/30 border-2 border-amber-600 rounded-xl p-4">
                                <div className="text-sm text-gray-400 mb-1">End of Service Gratuity (EOSG)</div>
                                <div className="text-3xl font-bold text-amber-400">
                                    {Math.round(aramcoMetrics.eosgSAR).toLocaleString()} SAR
                                </div>
                                <div className="text-sm text-gray-400">
                                    ≈ AUD ${Math.round(aramcoMetrics.eosgAUD).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Impact Analysis */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-2xl font-bold text-white">Financial Impact vs Sydney Baseline</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Monthly Surplus */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl">
                            <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Monthly Surplus (AUD)</div>
                            <div className="text-3xl font-bold mb-1">
                                ${Math.round(aramcoMetrics.netSurplusAUD).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 text-sm font-bold text-emerald-100">
                                {aramcoMetrics.surplusDiff > 0 ? '↑' : '↓'}
                                <span>{aramcoMetrics.surplusDiff > 0 ? '+' : ''}${Math.round(aramcoMetrics.surplusDiff).toLocaleString()}/mo</span>
                            </div>
                        </div>

                        {/* Debt-Free Timeline */}
                        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-xl">
                            <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Debt-Free</div>
                            <div className="text-2xl font-bold mb-1">
                                {aramcoMetrics.monthsToDebtFree ? `${aramcoMetrics.monthsToDebtFree} mo` : 'N/A'}
                            </div>
                            <div className="text-sm font-bold text-purple-100">
                                {aramcoMetrics.monthsSaved > 0 && `${aramcoMetrics.monthsSaved} mo faster`}
                                {aramcoMetrics.monthsSaved < 0 && `${Math.abs(aramcoMetrics.monthsSaved)} mo slower`}
                                {aramcoMetrics.monthsSaved === 0 && 'No change'}
                            </div>
                        </div>

                        {/* Break-Even */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-xl">
                            <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Break-Even</div>
                            <div className="text-2xl font-bold mb-1">
                                {aramcoMetrics.breakEvenMonths !== null && aramcoMetrics.breakEvenMonths > 0
                                    ? `${aramcoMetrics.breakEvenMonths} mo`
                                    : 'Immediate'
                                }
                            </div>
                            <div className="text-sm font-bold text-orange-100">
                                Relocation: ${Math.round(aramcoMetrics.relocationCostAUD).toLocaleString()}
                            </div>
                        </div>

                        {/* Trade-Off Index */}
                        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl p-5 text-white shadow-xl">
                            <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Trade-Off Index</div>
                            <div className="text-4xl font-bold mb-1">
                                {tradeOffIndex.total}
                            </div>
                            <div className="text-sm font-bold text-amber-100">
                                {tradeOffIndex.total >= 75 && 'Strong Opportunity'}
                                {tradeOffIndex.total >= 50 && tradeOffIndex.total < 75 && 'Moderate Fit'}
                                {tradeOffIndex.total < 50 && 'Significant Trade-offs'}
                            </div>
                        </div>
                    </div>

                    {/* Net Worth Trajectory */}
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Net Worth Trajectory (AUD)
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {['1yr', '3yr', '5yr'].map((period) => {
                                const sydneyKey = `netWorth${period}`;
                                const deltaKey = `netWorthDelta${period}`;
                                const sydneyValue = sydneyBaseline[sydneyKey];
                                const aramcoValue = aramcoMetrics[`netWorth${period}`];
                                const delta = aramcoMetrics[deltaKey];

                                return (
                                    <div key={period} className="bg-slate-700/50 rounded-xl p-5 border-2 border-slate-600">
                                        <div className="text-sm font-bold text-gray-400 mb-2">
                                            {period === '1yr' ? '1 Year' : period === '3yr' ? '3 Years' : '5 Years'}
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="text-xs text-gray-500">Sydney Baseline</div>
                                                <div className="text-xl font-bold text-gray-300">
                                                    ${(sydneyValue / 1000).toFixed(1)}K
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Aramco Scenario</div>
                                                <div className="text-xl font-bold text-amber-400">
                                                    ${(aramcoValue / 1000).toFixed(1)}K
                                                </div>
                                            </div>
                                            <div className={`text-sm font-bold ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                {delta > 0 ? '+' : ''}{(delta / 1000).toFixed(1)}K {delta > 0 ? 'gain' : delta < 0 ? 'loss' : 'neutral'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Decision Summary Card */}
                <div className={`rounded-2xl p-6 border-2 ${tradeOffIndex.total >= 75
                        ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500'
                        : tradeOffIndex.total >= 50
                            ? 'bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-500'
                            : 'bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-500'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${tradeOffIndex.total >= 75
                                ? 'bg-emerald-500 text-white'
                                : tradeOffIndex.total >= 50
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-red-500 text-white'
                            }`}>
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {tradeOffIndex.total >= 75 && '✅ Strong Financial Opportunity'}
                                {tradeOffIndex.total >= 50 && tradeOffIndex.total < 75 && '⚠️ Moderate Fit - Consider Trade-Offs'}
                                {tradeOffIndex.total < 50 && '❌ Significant Compromises Required'}
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {aramcoMetrics.netWorthDelta5yr > 0
                                    ? `This offer could accelerate your financial timeline by approximately ${yearsAccelerated} years, with a 5-year net worth advantage of AUD $${(aramcoMetrics.netWorthDelta5yr / 1000).toFixed(1)}K over staying in Sydney.`
                                    : `This offer shows a 5-year net worth deficit of AUD $${Math.abs(aramcoMetrics.netWorthDelta5yr / 1000).toFixed(1)}K compared to Sydney. Ensure non-financial factors justify the trade-off.`
                                }
                            </p>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                {Object.entries(tradeOffIndex.breakdown).map(([key, value]) => (
                                    <div key={key} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                                        <div className="text-xs text-gray-400 capitalize mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div className="text-xl font-bold text-white">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

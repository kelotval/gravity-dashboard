import React from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ShieldAlert, BadgeDollarSign } from 'lucide-react';

export default function ScenarioHeader({ netPay, benefits, projection, debts, inputs }) {

    // 1. Calculate Key Metrics
    const totalMonthlyIncome = (netPay.householdMonthly || 0) + (benefits.monthly || 0);
    const estimatedExpenses = 6500; // Baseline placeholder or passed prop
    const rent = inputs.rentOverride || 0;
    const debtPayments = debts.reduce((sum, d) => sum + (d.monthlyRepayment || 0) + (d.extraPayment || 0), 0);

    const monthlySurplus = totalMonthlyIncome - estimatedExpenses - rent - debtPayments;
    const savingsRate = totalMonthlyIncome > 0 ? (monthlySurplus / totalMonthlyIncome) * 100 : 0;

    // 2. Risk Assessment
    let riskLevel = 'LOW';
    let riskColor = 'text-emerald-400';
    let riskBg = 'bg-emerald-500/10 border-emerald-500/20';
    let riskMessage = "Financially Strong";
    let RiskIcon = CheckCircle;

    if (savingsRate < 10) {
        riskLevel = 'MEDIUM';
        riskColor = 'text-yellow-400';
        riskBg = 'bg-yellow-500/10 border-yellow-500/20';
        riskMessage = "Tight Cashflow";
        RiskIcon = AlertTriangle;
    }
    if (monthlySurplus < 0) {
        riskLevel = 'HIGH';
        riskColor = 'text-red-400';
        riskBg = 'bg-red-500/10 border-red-500/20';
        riskMessage = "Cashflow Critical";
        RiskIcon = ShieldAlert;
    }

    // 3. Debt Free Date
    const debtFreeYear = projection.find(p => p.debt === 0)?.year || "5+ Years";
    const netWorth5Y = projection[projection.length - 1]?.netWorth || 0;

    return (
        <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Main Bar */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">

                {/* Dynamic Gradient Background based on Risk */}
                <div className={`absolute top-0 left-0 w-full h-1 ${riskLevel === 'LOW' ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent' :
                        riskLevel === 'MEDIUM' ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-transparent' :
                            'bg-gradient-to-r from-red-600 via-red-500 to-transparent'
                    }`} />

                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">

                    {/* 1. Status & Message */}
                    <div className="p-6 flex flex-col justify-center">
                        <div className={`flex items-center gap-2 mb-2 px-3 py-1 rounded-full w-fit border ${riskBg}`}>
                            <RiskIcon className={`w-4 h-4 ${riskColor}`} />
                            <span className={`text-xs font-bold tracking-wide ${riskColor}`}>{riskLevel} RISK</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white tracking-tight">{riskMessage}</h2>
                        <p className="text-xs text-gray-500 mt-1">Based on projected surplus & liquidity</p>
                    </div>

                    {/* 2. Monthly Power */}
                    <div className="p-6 flex flex-col justify-center relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrendingUp className="w-12 h-12 text-white/5" />
                        </div>
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Monthly Surplus</div>
                        <div className={`text-4xl font-bold tracking-tight ${monthlySurplus < 0 ? 'text-red-400' : 'text-white'}`}>
                            {monthlySurplus > 0 ? '+' : ''}${Math.round(monthlySurplus).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${riskLevel === 'HIGH' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                                />
                            </div>
                            <span className={`text-xs font-bold ${riskColor}`}>{savingsRate.toFixed(1)}% Rate</span>
                        </div>
                    </div>

                    {/* 3. Net Worth Trajectory */}
                    <div className="p-6 flex flex-col justify-center">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">5-Year Net Worth</div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            ${Math.round(netWorth5Y).toLocaleString()}
                        </div>
                        <div className="text-xs text-brand mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Projected Growth</span>
                        </div>
                    </div>

                    {/* 4. Debt Freedom */}
                    <div className="p-6 flex flex-col justify-center">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Debt Free In</div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {typeof debtFreeYear === 'number' ? (
                                <span>{debtFreeYear} <span className="text-sm font-normal text-gray-500">Years</span></span>
                            ) : (
                                <span className="text-xl text-gray-400">{debtFreeYear}</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Based on current strategy</div>
                    </div>

                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { DollarSign, User, Users, ExternalLink } from 'lucide-react';

export default function NetPayPanel({ state, onChange, results }) {

    const handleChange = (field, value) => {
        onChange(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SurfaceCard title="Net Pay Engine (AU)" className="p-0 overflow-hidden">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Inputs Column */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider mb-2">Income Inputs</h3>

                    {/* My Salary */}
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">My Gross Salary</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-content-tertiary">$</span>
                            <input
                                type="number"
                                value={state.grossSalary}
                                onChange={e => handleChange('grossSalary', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-7 pr-3 text-white focus:ring-1 focus:ring-brand focus:bg-white/10 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Bonus Slider */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs font-medium text-gray-400">Bonus Target</label>
                            <span className="text-xs font-bold text-brand">{state.bonusPercent}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="40"
                            value={state.bonusPercent}
                            onChange={e => handleChange('bonusPercent', Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                        />
                    </div>

                    {/* Wife Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="text-sm text-gray-200">Partner Working</span>
                        <input
                            type="checkbox"
                            checked={state.wifeWorking}
                            onChange={e => handleChange('wifeWorking', e.target.checked)}
                            className="toggle toggle-sm toggle-accent"
                        />
                    </div>

                    {state.wifeWorking && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Partner Gross Salary</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    value={state.wifeSalary}
                                    onChange={e => handleChange('wifeSalary', Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-7 pr-3 text-white focus:ring-1 focus:ring-accent focus:bg-white/10 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Toggles */}
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={state.hasHecs}
                                onChange={e => handleChange('hasHecs', e.target.checked)}
                                className="checkbox checkbox-xs checkbox-primary border-white/30"
                            />
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">HECS Debt</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={state.hasPrivateHospital}
                                onChange={e => handleChange('hasPrivateHospital', e.target.checked)}
                                className="checkbox checkbox-xs checkbox-success border-white/30"
                            />
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Private Hospital</span>
                        </label>
                    </div>

                    <a
                        href="https://paycalculator.com.au/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-xs text-gray-500 hover:text-brand transition-colors gap-1 mt-2"
                    >
                        Validate with PayCalculator <ExternalLink size={10} />
                    </a>
                </div>

                {/* Results Column */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />

                    {/* Me */}
                    <div className="flex justify-between items-end border-b border-white/10 pb-4 relative z-10">
                        <div>
                            <div className="text-[10px] text-brand font-bold uppercase tracking-widest mb-1">My Net Pay</div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                ${(results.me.monthlyNet).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="text-sm font-normal text-gray-500 ml-1">/mo</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Annual</div>
                            <div className="text-sm font-mono text-gray-300">${Math.round(results.me.netPay).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Wife */}
                    {state.wifeWorking && (
                        <div className="flex justify-between items-end border-b border-white/10 pb-4 relative z-10">
                            <div>
                                <div className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Partner Net Pay</div>
                                <div className="text-3xl font-bold text-white tracking-tight">
                                    ${(results.wife.monthlyNet).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    <span className="text-sm font-normal text-gray-500 ml-1">/mo</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Annual</div>
                                <div className="text-sm font-mono text-gray-300">${Math.round(results.wife.netPay).toLocaleString()}</div>
                            </div>
                        </div>
                    )}

                    {/* Combined */}
                    <div className="mt-2 pt-2 relative z-10">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Household Total</div>
                        <div className="flex justify-between items-baseline">
                            <div className="text-5xl font-bold text-white drop-shadow-sm">
                                ${(results.householdMonthly).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-sm text-gray-400">per month</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-mono">
                            ${Math.round(results.householdAnnual).toLocaleString()} per year
                        </div>
                    </div>

                </div>
            </div>
        </SurfaceCard>
    );
}

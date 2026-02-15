import React from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { Settings2 } from 'lucide-react';

export default function ScenarioControls({ state, onChange }) {

    const handleChange = (field, value) => {
        onChange(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SurfaceCard title="Scenario Variables" className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Inflation */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-xs font-medium text-gray-400">Inflation Rate</label>
                        <span className="text-xs font-bold text-warning">{state.inflationRate}%</span>
                    </div>
                    <input
                        type="range" min="1" max="10" step="0.1"
                        value={state.inflationRate}
                        onChange={e => handleChange('inflationRate', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-warning [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    />
                </div>

                {/* Investment Return */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-xs font-medium text-gray-400">Investment Return</label>
                        <span className="text-xs font-bold text-brand">{state.investmentReturn}%</span>
                    </div>
                    <input
                        type="range" min="2" max="12" step="0.5"
                        value={state.investmentReturn}
                        onChange={e => handleChange('investmentReturn', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    />
                </div>

                {/* Additional Expenses */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Rent / Housing Override</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="number"
                            step="50"
                            value={state.rentOverride}
                            onChange={e => handleChange('rentOverride', Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-7 pr-3 text-white text-xs focus:ring-1 focus:ring-brand focus:bg-white/10 transition-colors"
                            placeholder="Add extra cost..."
                        />
                    </div>
                </div>

                {/* Extra Investment */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">New Investment Contrib.</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="number"
                            step="100"
                            value={state.extraInvestment}
                            onChange={e => handleChange('extraInvestment', Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-7 pr-3 text-white text-xs focus:ring-1 focus:ring-brand focus:bg-white/10 transition-colors"
                            placeholder="Monthly amount..."
                        />
                    </div>
                </div>

            </div>
        </SurfaceCard>
    );
}

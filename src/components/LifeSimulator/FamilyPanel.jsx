import React from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { Baby, Users, Heart } from 'lucide-react';

export default function FamilyPanel({ state, onChange, results }) {

    const handleChange = (field, value) => {
        onChange(prev => ({ ...prev, [field]: value }));
    };

    const handleKidAgeChange = (index, age) => {
        const newAges = [...state.kidAges];
        newAges[index] = Number(age);
        handleChange('kidAges', newAges);
    };

    const addKid = () => {
        handleChange('kidAges', [...state.kidAges, 0]);
        handleChange('hasKids', true);
        handleChange('numKids', state.numKids + 1);
    };

    const removeKid = (index) => {
        const newAges = state.kidAges.filter((_, i) => i !== index);
        handleChange('kidAges', newAges);
        handleChange('numKids', Math.max(0, state.numKids - 1));
        if (newAges.length === 0) handleChange('hasKids', false);
    };

    return (
        <SurfaceCard title="Family Module" className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Inputs */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                            <Baby className="text-brand w-5 h-5" />
                            <span className="text-sm text-gray-200">Children</span>
                        </div>
                        <button
                            onClick={addKid}
                            className="btn btn-xs btn-outline border-white/20 hover:bg-white/10 text-white hover:border-white"
                        >
                            + Add Child
                        </button>
                    </div>

                    {state.kidAges.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Ages</div>
                            <div className="flex flex-wrap gap-2">
                                {state.kidAges.map((age, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md border border-white/5">
                                        <span className="text-xs text-gray-400">Child {i + 1}:</span>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={e => handleKidAgeChange(i, e.target.value)}
                                            className="w-12 bg-transparent text-center border-b border-gray-600 text-white focus:outline-none focus:border-brand text-sm"
                                        />
                                        <button onClick={() => removeKid(i)} className="text-gray-500 hover:text-red-400 ml-1">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cost Sliders */}
                    {state.hasKids && (
                        <div className="mt-4 space-y-4 animate-in fade-in">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-medium text-gray-400">Monthly Cost per Child</label>
                                    <span className="text-xs font-bold text-white">${state.daycareRate || 0}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="5000" step="50"
                                    value={state.daycareRate || 0}
                                    onChange={e => handleChange('daycareRate', Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                />
                                <div className="text-[10px] text-gray-500 mt-1">Includes food, clothes, childcare gap</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Outputs */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />

                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <Heart className="text-red-500 w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Government Support</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/10 pb-2 relative z-10">
                        <div className="text-xs text-gray-400">FTB Part A (Est)</div>
                        <div className="text-sm font-mono text-white">${results.ftbA.toLocaleString()}</div>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 relative z-10">
                        <div className="text-xs text-gray-400">FTB Part B (Est)</div>
                        <div className="text-sm font-mono text-white">${results.ftbB.toLocaleString()}</div>
                    </div>

                    <div className="pt-2 relative z-10">
                        <div className="flex justify-between items-baseline">
                            <div className="text-xs text-gray-300 font-bold">Total Benefits</div>
                            <div className="text-xl font-bold text-brand">
                                + ${(results.monthly).toLocaleString()}
                                <span className="text-xs ml-1 font-normal text-gray-500">/mo</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </SurfaceCard>
    );
}

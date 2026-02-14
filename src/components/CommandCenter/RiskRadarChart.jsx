import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { useRiskMetrics } from './useRiskMetrics';

export default function RiskRadarChart({ transactions, income, debts, profile }) {

    // Calculate Real Metrics
    const { data, totalScore } = useRiskMetrics(transactions, income, debts, profile);

    return (
        <section className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-indigo-400 mr-2">02</span>
                Risk Radar
            </h3>

            <GlassCard className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                {/* Score Overlay */}
                <div className="absolute top-4 right-4 text-right">
                    <div className={`text-2xl font-bold ${totalScore > 80 ? 'text-emerald-400' : totalScore > 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
                        {totalScore}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Health Score</div>
                </div>

                <div className="w-full h-full max-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Current"
                                dataKey="A"
                                stroke="#818cf8"
                                strokeWidth={2}
                                fill="#4f46e5"
                                fillOpacity={0.4}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full mt-4 px-4 pb-2">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span>Your Profile</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/10"></div>
                            <span>Benchmark (Target)</span>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </section>
    );
}

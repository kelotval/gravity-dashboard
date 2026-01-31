import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, HelpCircle, Info } from "lucide-react";
import clsx from "clsx";
import Tooltip from "./Tooltip";

export default function FinancialHealthBanner({ score, breakdown, savingsRate, dtiRatio, netWorthData }) {
    // Animation state for SVG circle
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress on mount
        const timer = setTimeout(() => {
            setProgress(score);
        }, 300);
        return () => clearTimeout(timer);
    }, [score]);

    // Circle config
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Color logic
    const getColor = (s) => {
        if (s >= 80) return "text-emerald-400";
        if (s >= 50) return "text-amber-400";
        return "text-rose-400";
    };

    const colorClass = getColor(score);
    const strokeColor = score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#fb7185";

    // ... existing SVG ...
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-8 group transition-all duration-500">
            {/* Background Gradient & Glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            <div className="absolute inset-0 backdrop-blur-3xl"></div>

            <div className="relative z-10">
                <div className="px-8 py-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                    {/* Left: Title & Context */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2 opacity-90">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm font-medium tracking-wide uppercase">Financial Wellness</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Overall Health Score</h2>
                        <p className="text-blue-100 max-w-sm text-sm leading-relaxed mb-4">
                            Based on your savings rate ({savingsRate}%) and debt-to-income ratio ({dtiRatio}%).
                            Keep your DTI below 35% and savings above 20% for optimal health.
                        </p>

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1 transition-colors mx-auto md:mx-0"
                        >
                            {isExpanded ? "Hide Breakdown" : "View Breakdown"}
                            <TrendingDown className={`w-4 h-4 transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* Center: Circular Progress */}
                    <div className="relative flex items-center justify-center">
                        <svg
                            height={radius * 2.5}
                            width={radius * 2.5}
                            className="transform -rotate-90 drop-shadow-2xl"
                        >
                            <circle
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={stroke}
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.25}
                                cy={radius * 1.25}
                            />
                            <circle
                                stroke={strokeColor}
                                strokeWidth={stroke}
                                strokeDasharray={circumference + " " + circumference}
                                style={{ strokeDashoffset, transition: "stroke-dashoffset 1.5s ease-in-out" }}
                                strokeLinecap="round"
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.25}
                                cy={radius * 1.25}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-extrabold ${colorClass} drop-shadow-sm`}>
                                {progress}
                            </span>
                            <span className="text-xs font-semibold text-blue-100 uppercase tracking-widest mt-1">
                                / 100
                            </span>
                        </div>
                    </div>

                    {/* Right: Wealth Trajectory */}
                    <div className="flex-1 text-center md:text-right hidden md:block">
                        <div className="inline-block bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner backdrop-blur-md min-w-[240px]">
                            <div className="flex justify-between items-center mb-1 gap-4">
                                <div className="text-sm text-blue-200 font-medium uppercase tracking-wide">Net Worth</div>
                                {netWorthData.monthlyVelocity > 0 ? (
                                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> +${Math.round(netWorthData.monthlyVelocity).toLocaleString()}/mo
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3" /> -${Math.round(Math.abs(netWorthData.monthlyVelocity)).toLocaleString()}/mo
                                    </span>
                                )}
                            </div>

                            <div className="text-4xl font-bold tracking-tight text-white mb-3">
                                ${netWorthData.netWorth.toLocaleString()}
                            </div>

                            {/* Projections Mini-View */}
                            <div className="space-y-1.5 border-t border-white/10 pt-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-200/60">6 Month Forecast</span>
                                    <span className={`font-mono font-medium ${netWorthData.projected6Mo >= 0 ? 'text-emerald-300' : 'text-white/80'}`}>
                                        ${Math.round(netWorthData.projected6Mo).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-200/60">1 Year Forecast</span>
                                    <span className={`font-mono font-medium ${netWorthData.projected1Year >= 0 ? 'text-emerald-300' : 'text-white/80'}`}>
                                        ${Math.round(netWorthData.projected1Year).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Crossover Date */}
                            {netWorthData.netWorth < 0 && netWorthData.monthsToPositive && (
                                <div className="mt-3 text-[10px] font-bold text-center bg-blue-500/20 text-blue-200 py-1 rounded border border-blue-500/30">
                                    Net Positive in {Math.ceil(netWorthData.monthsToPositive)} months
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Breakdown Section */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-8 pb-8 md:px-12 border-t border-white/10 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {breakdown && breakdown.map((item, index) => (
                                <div key={index} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-colors group/item relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-blue-200 uppercase tracking-wide truncate pr-2" title={item.label}>
                                            {item.label}
                                        </span>
                                        {/* Updated to use Reusable Tooltip with higher Z-Index */}
                                        <Tooltip content={
                                            <>
                                                <div>{item.tooltip}</div>
                                                <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Weight: {item.weight} pts</div>
                                            </>
                                        }>
                                            <HelpCircle className="w-3 h-3 text-white/40 hover:text-white cursor-help" />
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="text-lg font-bold text-white">
                                            {item.value}
                                        </div>
                                        <div className={`text-sm font-bold ${item.color}`}>
                                            +{item.score}
                                        </div>
                                    </div>
                                    <div className="mt-2 w-full bg-black/20 h-1 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.score === item.weight ? "bg-emerald-400" : "bg-blue-400"}`}
                                            style={{ width: `${(item.score / item.weight) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Glow Effects */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
    );
}

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
            <div className="absolute inset-0 bg-surface"></div>
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
                        <p className="text-gray-400 max-w-sm text-sm leading-relaxed mb-4">
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

                    {/* Center: Animated Speedometer Gauge */}
                    <div className="relative flex items-center justify-center">
                        <svg
                            width="240"
                            height="180"
                            viewBox="0 0 240 180"
                            className="drop-shadow-2xl"
                        >
                            <defs>
                                {/* Gradient for gauge background */}
                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="50%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>

                                {/* Glow filter */}
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>

                                {/* Needle gradient */}
                                <linearGradient id="needleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                                    <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.7" />
                                </linearGradient>
                            </defs>

                            {/* Gauge Background Arc */}
                            <path
                                d="M 40 130 A 80 80 0 0 1 200 130"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="20"
                                strokeLinecap="round"
                            />

                            {/* Colored Gauge Arc with Gradient */}
                            <path
                                d="M 40 130 A 80 80 0 0 1 200 130"
                                fill="none"
                                stroke="url(#gaugeGradient)"
                                strokeWidth="20"
                                strokeLinecap="round"
                                strokeDasharray={`${(progress / 100) * 251} 251`}
                                style={{
                                    transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    filter: 'url(#glow)'
                                }}
                            />

                            {/* Tick Marks */}
                            {[0, 20, 40, 60, 80, 100].map((tick) => {
                                const angle = -180 + (tick / 100) * 180;
                                const radians = (angle * Math.PI) / 180;
                                const x1 = 120 + 70 * Math.cos(radians);
                                const y1 = 130 + 70 * Math.sin(radians);
                                const x2 = 120 + 80 * Math.cos(radians);
                                const y2 = 130 + 80 * Math.sin(radians);

                                return (
                                    <g key={tick}>
                                        <line
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke="rgba(255,255,255,0.4)"
                                            strokeWidth="2"
                                        />
                                        <text
                                            x={120 + 105 * Math.cos(radians)}
                                            y={130 + 105 * Math.sin(radians) + 5}
                                            fill="rgba(255,255,255,0.8)"
                                            fontSize="12"
                                            fontWeight="600"
                                            textAnchor="middle"
                                        >
                                            {tick}
                                        </text>
                                    </g>
                                );
                            })})

                            {/* Animated Needle */}
                            <g
                                style={{
                                    transformOrigin: '120px 130px',
                                    transform: `rotate(${-90 + (progress / 100) * 180}deg)`,
                                    transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <polygon
                                    points="120,65 115,125 120,128 125,125"
                                    fill="url(#needleGradient)"
                                    stroke="#fff"
                                    strokeWidth="1"
                                    filter="url(#glow)"
                                />
                            </g>

                            {/* Center Hub */}
                            <circle
                                cx="120"
                                cy="130"
                                r="8"
                                fill="#fff"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                                filter="url(#glow)"
                            />
                            <circle
                                cx="120"
                                cy="130"
                                r="4"
                                fill={strokeColor}
                            />
                        </svg>

                        {/* Score Display Below Gauge */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-7 flex flex-col items-center">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className={`text-5xl font-extrabold ${colorClass} drop-shadow-lg`}>
                                    {progress}
                                </span>
                                <span className="text-lg font-bold text-blue-100 opacity-60">
                                    /100
                                </span>
                            </div>
                            <span className="text-xs font-semibold text-blue-100 uppercase tracking-widest mt-1 text-center">
                                Health Score
                            </span>
                        </div>
                    </div>

                    {/* Right: Wealth Trajectory */}
                    <div className="flex-1 text-center md:text-right hidden md:block">
                        <div className="inline-block bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner backdrop-blur-md min-w-[240px]">
                            <div className="flex justify-between items-center mb-1 gap-4">
                                <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">Net Worth</div>
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

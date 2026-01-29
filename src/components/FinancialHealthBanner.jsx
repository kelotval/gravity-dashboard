import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, HelpCircle, Info } from "lucide-react";
import clsx from "clsx";

export default function FinancialHealthBanner({ score, savingsRate, dtiRatio, netWorth }) {
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

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-8 group">
            {/* Background Gradient & Glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            <div className="absolute inset-0 backdrop-blur-3xl"></div>

            <div className="relative px-8 py-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white z-10">

                {/* Left: Title & Context */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2 opacity-90">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium tracking-wide uppercase">Financial Wellness</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Overall Health Score</h2>
                    <p className="text-blue-100 max-w-sm text-sm leading-relaxed">
                        Based on your savings rate ({savingsRate}%) and debt-to-income ratio ({dtiRatio}%).
                        Keep your DTI below 35% and savings above 20% for optimal health.
                    </p>
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

                {/* Right: Net Worth */}
                <div className="flex-1 text-center md:text-right">
                    <div className="inline-block bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner backdrop-blur-md">
                        <div className="text-sm text-blue-200 font-medium mb-1 uppercase tracking-wide">Net Worth</div>
                        <div className="text-4xl font-bold tracking-tight text-white mb-2">
                            ${netWorth.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center md:justify-end gap-2 text-xs font-medium text-emerald-300">
                            <TrendingUp className="w-3 h-3" />
                            <span>Trending Up</span>
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

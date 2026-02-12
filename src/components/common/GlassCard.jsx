import React from 'react';

export const GlassCard = ({ children, className = '', hoverEffect = true }) => (
    <div className={`relative rounded-3xl p-6 overflow-hidden group transition-all duration-500 border border-white/5 bg-black/20 backdrop-blur-xl ${hoverEffect ? 'hover:scale-[1.005] hover:shadow-2xl hover:border-white/10 hover:bg-black/30' : ''} ${className}`}>

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        {/* Ambient Glow - Softer */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/[0.05] rounded-full blur-[60px] group-hover:bg-indigo-500/[0.08] transition-all duration-1000 pointer-events-none" />

        <div className="relative z-20 h-full">{children}</div>
    </div>
);

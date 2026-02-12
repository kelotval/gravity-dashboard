import React from 'react';

export const SurfaceCard = ({ children, className = '', hoverEffect = false, padding = 'p-8' }) => (
    <div className={`
        bg-gradient-to-b from-white/[0.04] to-transparent
        border border-white/[0.05] rounded-2xl 
        shadow-sm backdrop-blur-[2px]
        ${hoverEffect ? 'hover:border-white/[0.08] hover:bg-white/[0.06] transition-all duration-300' : ''} 
        ${padding} 
        ${className}
    `}>
        {children}
    </div>
);

import React from 'react';

export const PageContainer = ({ children, title, subtitle, action, activeMonth }) => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10 border-b border-surface-highlight pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
                        {title}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-content-secondary font-normal text-sm">
                        <span className="hidden sm:inline">{subtitle}</span>
                        {activeMonth && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-highlight text-content-primary font-medium border border-surface-highlight">
                                Period: {activeMonth}
                            </span>
                        )}
                    </div>
                </div>
                {action && <div className="relative z-20">{action}</div>}
            </header>

            <main className="space-y-6 relative z-10">
                {children}
            </main>
        </div>
    );
};

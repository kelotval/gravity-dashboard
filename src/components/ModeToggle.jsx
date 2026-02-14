import React from 'react';
import { useData } from '../contexts/DataProvider';
import { Zap, Box, Lock, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ModeToggle() {
    const { mode, switchMode, resetData, loading } = useData();

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                {/* Live Mode */}
                <button
                    onClick={() => switchMode('live')}
                    className={`
                        py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                        ${mode === 'live'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                        }
                    `}
                >
                    <Lock className="w-3 h-3" />
                    Live
                </button>

                {/* Demo Mode */}
                <button
                    onClick={() => switchMode('demo')}
                    className={`
                        py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                        ${mode === 'demo'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-sm shadow-blue-500/10'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                        }
                    `}
                >
                    <Zap className="w-3 h-3" />
                    Demo
                </button>

                {/* Sandbox Mode */}
                <button
                    onClick={() => switchMode('sandbox')}
                    className={`
                        py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                        ${mode === 'sandbox'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-sm shadow-orange-500/10'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                        }
                    `}
                >
                    <Box className="w-3 h-3" />
                    Sandbox
                </button>
            </div>

            {/* Reset Button (Only for Demo/Sandbox) */}
            {mode !== 'live' && (
                <button
                    onClick={resetData}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 py-1 text-xs text-gray-500 hover:text-white transition-colors w-full opacity-70 hover:opacity-100"
                    title="Reset Data"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>Reset {mode === 'demo' ? 'Default' : 'Saved'} Data</span>
                </button>
            )}
        </div>
    );
}

// Banner Component to show when in non-live mode
export function ModeBanner() {
    const { mode, resetData } = useData();

    if (mode === 'live') return null;

    const styles = {
        demo: "bg-blue-500/10 border-b border-blue-500/20 text-blue-300",
        sandbox: "bg-orange-500/10 border-b border-orange-500/20 text-orange-300"
    };

    return (
        <div className={`w-full px-4 py-2 ${styles[mode]} flex items-center justify-between`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                {mode === 'demo' && <Zap className="w-4 h-4" />}
                {mode === 'sandbox' && <Box className="w-4 h-4" />}
                {mode} Mode Active
            </div>
            <div className="flex items-center gap-4 text-xs">
                <span className="opacity-70">
                    {mode === 'demo' ? "Data is read-only and resets on reload." : "Changes are saved locally to your browser."}
                </span>
                <button
                    onClick={resetData}
                    className="underline hover:text-white transition-colors"
                >
                    Reset Data
                </button>
            </div>
        </div>
    );
}

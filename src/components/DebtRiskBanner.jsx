import React from "react";
import { AlertCircle, AlertTriangle, TrendingUp, X } from "lucide-react";

export default function DebtRiskBanner({ banners, onClose }) {
    if (!banners || banners.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {banners.map((banner) => {
                // Determine styling based on severity
                let bgClass = "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300";
                let iconColor = "text-blue-500";

                if (banner.severity === 3) {
                    bgClass = "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
                    iconColor = "text-red-600 dark:text-red-400";
                } else if (banner.severity === 2) {
                    bgClass = "bg-orange-50 border-orange-100 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300";
                    iconColor = "text-orange-600 dark:text-orange-400";
                } else {
                    bgClass = "bg-yellow-50 border-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300";
                    iconColor = "text-yellow-600 dark:text-yellow-400";
                }

                return (
                    <div key={banner.id} className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm relative overflow-hidden ${bgClass}`}>

                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl pointer-events-none"></div>

                        <div className="flex items-start gap-4 z-10">
                            <div className={`p-2 bg-white rounded-lg shadow-sm border border-black/5 dark:bg-black/20 dark:border-white/10 ${iconColor}`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg">{banner.alertType}</h4>
                                    {banner.daysToChange !== null && banner.daysToChange > 0 && (
                                        <span className="text-xs font-bold px-2 py-0.5 bg-white/50 rounded-full border border-black/5">
                                            {banner.daysToChange} Days Left
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm opacity-90">
                                    <span className="font-semibold">{banner.debtName}</span>: Rate changing from
                                    <span className="font-mono font-bold mx-1">{banner.oldRate}%</span>
                                    to
                                    <span className="font-mono font-bold mx-1">{banner.newRate}%</span>
                                </p>
                            </div>
                        </div>

                        {/* Impact Section */}
                        <div className="flex items-center gap-6 z-10 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-black/10">
                            <div className="flex-1 md:flex-initial">
                                <p className="text-xs opacity-75 uppercase tracking-wide font-semibold mb-1">Monthly Impact</p>
                                <div className="flex items-baseline gap-1">
                                    {banner.estimatedExtraMonthlyInterest !== null ? (
                                        <>
                                            <span className={`text-xl font-bold ${banner.severity >= 2 ? 'text-red-700 dark:text-red-400' : ''}`}>
                                                +${banner.estimatedExtraMonthlyInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-xs opacity-75">/mo interest</span>
                                        </>
                                    ) : (
                                        <span className="text-sm italic opacity-75">Add future rate to estimate</span>
                                    )}
                                </div>
                            </div>

                            {onClose && (
                                <button onClick={() => onClose(banner.id)} className="p-1 hover:bg-black/5 rounded transition-colors">
                                    <X className="w-5 h-5 opacity-50" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

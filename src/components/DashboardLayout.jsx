import React from "react";
import { LayoutDashboard, CreditCard, PieChart, Settings, Menu, Wallet, Moon, Sun, Calendar, LineChart, Sparkles, Globe, LogOut } from "lucide-react";
import clsx from "clsx";
import SyncIndicator from "./SyncIndicator";

export default function DashboardLayout({ children, currentTab, onTabChange, syncStatus }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    // Theme toggle (optional, assuming dark mode is now default/enforced conceptually, but keeping functionality)
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
        // Toggle logic if needed, but we are enforcing dark charcoal theme
    };

    const navSections = [
        {
            title: "Menu",
            items: [
                { id: "overview_v2", icon: LayoutDashboard, label: "Overview" },
                { id: "payoff", icon: Calendar, label: "Payoff Plan" },
                { id: "trends", icon: LineChart, label: "Trends" },
            ]
        },
        {
            title: "Manage",
            items: [
                { id: "liabilities", icon: Wallet, label: "Liabilities" },
                { id: "subscriptions", icon: CreditCard, label: "Subscriptions" },
                { id: "transactions", icon: CreditCard, label: "Transactions" },
            ]
        },
        {
            title: "Tools",
            items: [
                { id: "relocation", icon: Globe, label: "Relocation" },
                { id: "insights", icon: Sparkles, label: "AI Insights" },
                { id: "settings", icon: Settings, label: "Settings" },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-background text-content-primary font-sans overflow-hidden">

            {/* Sidebar - Traditional Fixed Panel */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                "bg-black/20 backdrop-blur-xl border-r border-white/5",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <span className="text-base font-medium text-gray-200 tracking-wide">ER Finance</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {navSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (onTabChange) onTabChange(item.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={clsx(
                                            "flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                                            currentTab === item.id
                                                ? "text-white bg-white/5 shadow-sm ring-1 ring-white/5"
                                                : "text-gray-400 hover:bg-white/[0.03] hover:text-gray-200"
                                        )}>
                                        {currentTab === item.id && (
                                            <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 rounded-r-full" />
                                        )}
                                        <item.icon
                                            strokeWidth={1.5}
                                            className={clsx(
                                                "w-4 h-4 mr-3 transition-colors",
                                                currentTab === item.id ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-400"
                                            )}
                                        />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button className="flex items-center gap-3 px-3 py-3 w-full hover:bg-white/5 rounded-xl transition-colors group border border-transparent hover:border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-semibold text-gray-300 border border-white/10 group-hover:border-white/20 transition-colors">
                            K
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">Kelot</p>
                            <p className="text-[10px] text-gray-500 truncate group-hover:text-gray-400">Enterprise Plan</p>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-background">
                {/* Top Header (Mobile Only + Actions) */}
                <header className="flex justify-between items-center p-4 lg:hidden border-b border-surface-highlight bg-surface">
                    <div className="flex items-center gap-2 lg:hidden">
                        <button
                            className="p-2 -ml-2 rounded-md text-gray-400 hover:text-white hover:bg-surface-hover"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-semibold text-white">ER Finance</span>
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

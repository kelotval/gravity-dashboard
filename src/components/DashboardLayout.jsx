import React from "react";
import { LayoutDashboard, CreditCard, PieChart, Settings, Menu, Wallet, Moon, Sun, Calendar, LineChart, Sparkles, Sliders, Globe } from "lucide-react";
import clsx from "clsx";

export default function DashboardLayout({ children, currentTab, onTabChange }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    // Initialize state from local storage or system preference
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        const savedTheme = localStorage.getItem("er_finance_theme");
        if (savedTheme) {
            return savedTheme === "dark";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    // Apply theme on mount and state change
    React.useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
            localStorage.setItem("er_finance_theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("er_finance_theme", "light");
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    const navItems = [
        { id: "overview", icon: LayoutDashboard, label: "Overview" },
        { id: "liabilities", icon: Wallet, label: "Active Liabilities" },
        { id: "payoff", icon: Calendar, label: "Payoff Plan" },
        { id: "scenarios", icon: Sliders, label: "Scenarios" },
        { id: "subscriptions", icon: CreditCard, label: "Subscriptions" },
        { id: "relocation", icon: Globe, label: "Relocation" },
        { id: "insights", icon: Sparkles, label: "Insights" },
        { id: "transactions", icon: CreditCard, label: "Transactions" },
        { id: "settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-[100] w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:transform-none",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ER Finance</h1>
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Household Tracker</p>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (onTabChange) onTabChange(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={clsx(
                                "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                currentTab === item.id
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                            )}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden overflow-y-auto">
                {/* Top Header for Theme Toggle */}
                <header className="flex justify-end items-center p-4 lg:pr-8 bg-gray-50 dark:bg-gray-900 sticky top-0 z-50 gap-3">
                    {/* Mobile Menu Button - Moved inside header */}
                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-1 w-full bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {
                isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )
            }
        </div >
    );
}

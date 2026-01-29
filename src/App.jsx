import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "./components/DashboardLayout";
import FinancialHealthBanner from "./components/FinancialHealthBanner";
import MetricCard from "./components/MetricCard";
import { IncomeExpenseChart, CategoryPieChart } from "./components/FinanceChart";
import TransactionList from "./components/TransactionList";
import TransactionModal from "./components/TransactionModal";
import PayoffPlanView from "./components/PayoffPlanView";
import TrendsView from "./components/TrendsView";
import SmartInsightsView from "./components/SmartInsightsView";
import SettingsView from "./components/SettingsView";
import ActiveLiabilities from "./components/ActiveLiabilities";
import InsightsCard from "./components/InsightsCard";
import SpendingIntelligence from "./components/SpendingIntelligence";

import { DEFAULT_STATE } from "./data";
import { DollarSign, TrendingDown, PiggyBank, Wallet, Plus } from "lucide-react";

const STORAGE_KEY = "er_finance_state_v1";

function loadStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load stored state", e);
        return null;
    }
}

function saveStored(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save state", e);
    }
}

export default function App() {
    const stored = useMemo(() => loadStored(), []);

    const [transactions, setTransactions] = useState(stored?.transactions ?? DEFAULT_STATE.transactions);
    const [income, setIncome] = useState(stored?.income ?? DEFAULT_STATE.income);
    const [debts, setDebts] = useState(stored?.debts ?? DEFAULT_STATE.debts);
    const [profile, setProfile] = useState(stored?.profile ?? DEFAULT_STATE.profile);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [hasLoadedCloud, setHasLoadedCloud] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/state");
                const json = await res.json();
                if (json?.state) {
                    setTransactions(json.state.transactions ?? DEFAULT_STATE.transactions);
                    setIncome(json.state.income ?? DEFAULT_STATE.income);
                    setDebts(json.state.debts ?? DEFAULT_STATE.debts);
                    setProfile(json.state.profile ?? DEFAULT_STATE.profile);
                }
            } catch (e) {
                console.error("Failed to load cloud state", e);
            } finally {
                setHasLoadedCloud(true);
            }
        };

        load();
    }, []);



    useEffect(() => {
        if (!hasLoadedCloud) return;

        const payload = { transactions, income, debts, profile };
        saveStored(payload);

        setSaveStatus("Saving...");

        const t = setTimeout(async () => {
            try {
                await fetch("/api/state", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ state: payload }),
                });
                setSaveStatus("Saved");
            } catch (e) {
                console.error("Failed to save cloud state", e);
                setSaveStatus("Save failed");
            }
        }, 800);

        return () => clearTimeout(t);
    }, [transactions, income, debts, profile, hasLoadedCloud]);





    const [currentTab, setCurrentTab] = React.useState("overview");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    // 1. Calculate Totals
    const totalIncome = Object.values(income).reduce((a, b) => a + b, 0);
    const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : "0.0";

    // Financial Health Calculations
    const totalDebtBalance = debts.reduce((acc, d) => acc + d.currentBalance, 0);
    const totalMonthlyDebt = debts.reduce((acc, d) => acc + d.monthlyRepayment, 0);
    const dtiRatio = totalIncome > 0 ? ((totalMonthlyDebt / totalIncome) * 100).toFixed(1) : "0.0";
    const netWorth = (profile.assets || 0) - totalDebtBalance;

    // Simple health score algorithm
    const calcHealthScore = () => {
        let score = 50;
        score += parseFloat(savingsRate) * 1.5; // Savings boost score
        score -= parseFloat(dtiRatio) * 0.5;    // Debt drags score
        return Math.min(100, Math.max(0, Math.round(score)));
    };
    const healthScore = calcHealthScore();

    // 2. Event Handlers
    const handleSaveTransaction = (txData) => {
        if (editingTransaction) {
            setTransactions(prev => prev.map(t => (t.id === txData.id ? txData : t)));
        } else {
            setTransactions(prev => [txData, ...prev]);
        }
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleEditClick = (tx) => {
        setEditingTransaction(tx);
        setIsModalOpen(true);
    };

    const handleNewClick = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    // Insight Actions
    const [actionFeedback, setActionFeedback] = useState(null);

    const handleInsightAction = (action) => {
        if (!action) return;

        if (action.type === 'NAVIGATE') {
            setCurrentTab(action.target);
            setActionFeedback(`Navigated to ${action.label}`);
        } else if (action.type === 'FILTER') {
            setSearchQuery(action.payload);
            setCurrentTab('transactions'); // Ensure we are on the view to see the filter
            setActionFeedback(`Applied filter: ${action.payload}`);
        }

        // Clear feedback after 3s
        setTimeout(() => setActionFeedback(null), 3000);
    };

    const handleDeleteTransaction = (id) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        }
    };

    // 3. Prepare Chart Data
    const incomeExpenseData = [
        {
            name: "Current Month",
            Income: totalIncome,
            Expenses: totalExpenses,
        },
    ];

    const categoryData = Object.values(
        transactions.reduce((acc, tx) => {
            if (!acc[tx.category]) {
                acc[tx.category] = { name: tx.category, value: 0 };
            }
            acc[tx.category].value += tx.amount;
            return acc;
        }, {})
    ).sort((a, b) => b.value - a.value);

    // 4. Render Content
    const renderContent = () => {
        if (currentTab === "settings") {
            return (
                <SettingsView
                    profile={profile}
                    income={income}
                    debts={debts}
                    onUpdateProfile={setProfile}
                    onUpdateIncome={setIncome}
                    onUpdateDebts={setDebts}
                />
            );
        }

        if (currentTab === "liabilities") {
            return (
                <ActiveLiabilities
                    debts={debts}
                    onUpdateDebts={setDebts} // Pass setter to allow updates if implemented
                />
            );
        }

        if (currentTab === "payoff") {
            return (
                <PayoffPlanView
                    debts={debts}
                />
            );
        }

        if (currentTab === "trends") {
            return (
                <TrendsView
                    currentIncome={totalIncome}
                    currentExpenses={totalExpenses}
                    currentDebt={totalDebtBalance}
                />
            );
        }

        if (currentTab === "insights") {
            return (
                <SmartInsightsView
                    transactions={transactions}
                    income={income}
                    debts={debts}
                />
            );
        }

        if (currentTab === "transactions") {
            return (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">All Transactions</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleNewClick}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add New
                            </button>
                        </div>
                    </div>
                    <TransactionList
                        transactions={transactions}
                        onDelete={handleDeleteTransaction}
                        onEdit={handleEditClick}
                        groupByCategory={true}
                    />
                </div>
            );
        }

        // Default: Overview
        return (
            <>
                <div className="flex justify-between items-end mb-8 relative">
                    {/* Action Feedback Toast */}
                    {actionFeedback && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in-down z-50 dark:bg-white dark:text-gray-900">
                            {actionFeedback}
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {profile.householdName}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {profile.statusText || "Here's what's happening with your finances today."}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {saveStatus}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative hidden md:block">
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <svg
                                    className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                </svg>
                            </div>

                            <button
                                onClick={handleNewClick}
                                className="hidden md:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Quick Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <FinancialHealthBanner
                        score={healthScore}
                        savingsRate={savingsRate}
                        dtiRatio={dtiRatio}
                        netWorth={netWorth}
                    />
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Income"
                        value={`$${totalIncome.toLocaleString()}`}
                        icon={DollarSign}
                        color="blue"
                        trend="up"
                        trendValue="+0.0%"
                    />
                    <MetricCard
                        title="Total Expenses"
                        value={`$${totalExpenses.toLocaleString()}`}
                        icon={TrendingDown}
                        color="orange"
                        trend={totalExpenses > totalIncome ? "up" : "down"}
                        trendValue="vs Income"
                    />
                    <MetricCard
                        title="Net Savings"
                        value={`$${netSavings.toLocaleString()}`}
                        icon={PiggyBank}
                        color="green"
                        trend={netSavings > 0 ? "up" : "down"}
                        trendValue={`${savingsRate}% Rate`}
                    />
                    <MetricCard
                        title="Debt Balance"
                        value={`$${debts.reduce((a, b) => a + b.currentBalance, 0).toLocaleString()}`}
                        icon={Wallet}
                        color="red"
                        trend="down"
                        trendValue="Total"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <IncomeExpenseChart data={incomeExpenseData} />
                    <CategoryPieChart data={categoryData} />
                </div>

                {/* Recent Transactions Preview */}
                {/* Bottom Section: Strict 12-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Row 1: Spending Intelligence (Full Width) */}
                    <div className="lg:col-span-12 w-full h-[500px]">
                        <SpendingIntelligence transactions={transactions} />
                    </div>

                    {/* Row 2: Active Debts (Half Width) */}
                    <div className="lg:col-span-6 w-full h-full">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full dark:bg-gray-800 dark:border-gray-700 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Debts</h3>
                                <button
                                    onClick={() => setCurrentTab("settings")}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="space-y-4 flex-1">
                                {debts.map(debt => (
                                    <div
                                        key={debt.id}
                                        className="p-4 rounded-lg bg-gray-50 border border-gray-100 dark:bg-gray-700/50 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{debt.name}</h4>
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded ${debt.accent === "red"
                                                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                                    : debt.accent === "orange"
                                                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                    }`}
                                            >
                                                {debt.dueLabel}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500 dark:text-gray-400">Balance</span>
                                            <span className="font-medium dark:text-gray-200">
                                                ${debt.currentBalance.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Monthly</span>
                                            <span className="font-medium dark:text-gray-200">
                                                ${debt.monthlyRepayment.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {debts.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No active debts.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Insights Card (Half Width) */}
                    <div className="lg:col-span-6 w-full h-full">
                        <InsightsCard
                            transactions={transactions}
                            income={income}
                            debts={debts}
                            savingsRate={savingsRate}
                            onAction={handleInsightAction}
                        />
                    </div>
                </div>
            </>
        );

    };

    return (
        <DashboardLayout currentTab={currentTab} onTabChange={setCurrentTab}>
            {renderContent()}

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                }}
                onSave={handleSaveTransaction}
                initialData={editingTransaction}
            />
        </DashboardLayout>
    );
}

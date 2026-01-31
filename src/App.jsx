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
import DebtRiskBanner from "./components/DebtRiskBanner";
import InterestRiskPanel from "./components/InterestRiskPanel";
import ActionPlanPanel from "./components/ActionPlanPanel";
import ScenarioSimulator from "./components/ScenarioSimulator";
import SubscriptionIntelligence from "./components/SubscriptionIntelligence";
import RelocationScenario from "./components/RelocationScenario";
import { calculateEffectiveRateState, getDebtRiskBanners, calculateInterestProjections, getCurrentRate } from "./utils/PayoffEngine";
import AmexCsvImport from "./components/AmexCsvImport";
import { categorizeTransaction } from "./utils/categorize";
import { calculateDetailedHealthScore } from "./utils/healthScore";

import { DEFAULT_STATE } from "./data";
import { DollarSign, TrendingDown, PiggyBank, Wallet, Plus, RefreshCw } from "lucide-react";

// Extensive Categorization Rules (Australian Context)
const DEFAULT_CATEGORY_RULES = [
    // -----------------------
    // Transfers (must be early)
    // -----------------------
    {
        category: "Transfers",
        keywords: [
            "transfer", "internet transfer", "osko", "pay anyone", "direct credit",
            "bpay", "payment received", "salary", "payroll", "reimbursement",
            "credit", "refund", "reversal"
        ]
    },

    // -----------------------
    // Fees and Interest (early)
    // -----------------------
    {
        category: "Fees and Interest",
        keywords: [
            "interest", "late fee", "annual fee", "finance charge",
            "foreign transaction fee", "fx fee", "overlimit", "fee"
        ]
    },

    // -----------------------
    // Housing
    // -----------------------
    {
        category: "Housing",
        keywords: [
            "rent", "mortgage", "strata", "property management", "real estate",
            "council rates", "water rates", "body corporate"
        ]
    },

    // -----------------------
    // Groceries
    // -----------------------
    {
        category: "Groceries",
        keywords: [
            "woolworths", "coles", "aldi", "iga", "harris farm", "costco",
            "foodland", "spar", "supabarn", "drakes", "fresh choice",
            "butcher", "fruit shop", "greengrocer", "seafood"
        ]
    },

    // -----------------------
    // Dining Out
    // -----------------------
    {
        category: "Dining Out",
        keywords: [
            "restaurant", "bistro", "eatery", "dining", "pub", "hotel bar",
            "mcdonald", "kfc", "hungry jack", "burger", "pizza", "dominos",
            "subway", "sushi", "grill", "nandos", "oporto", "guzman", "zambrero",
            "red rooster", "thai", "ramen", "kebab", "dumpling"
        ]
    },

    // -----------------------
    // Coffee
    // -----------------------
    {
        category: "Coffee",
        keywords: [
            "cafe", "coffee", "espresso", "barista", "mccafe",
            "starbucks", "gloria jeans", "zarraffas", "campos", "single o"
        ]
    },

    // -----------------------
    // Fuel
    // -----------------------
    {
        category: "Fuel",
        keywords: [
            "bp", "shell", "caltex", "ampol", "mobil", "7-eleven fuel", "7 eleven fuel",
            "united petroleum", "liberty", "metro petroleum", "petrol", "fuel"
        ]
    },

    // -----------------------
    // Transport
    // -----------------------
    {
        category: "Transport",
        keywords: [
            // Rideshare / taxis
            "uber trip", "uber", "didi", "ola", "taxi", "13cabs",

            // Public transport
            "opal", "myki", "transportfornsw", "transport for nsw", "translink",

            // Parking / tolls
            "linkt", "e-toll", "etoll", "toll", "wilson parking", "secure parking"
        ]
    },

    // -----------------------
    // Utilities
    // -----------------------
    {
        category: "Utilities",
        keywords: [
            "agl", "origin", "energy australia", "red energy", "alinta",
            "electricity", "gas", "internet", "broadband",
            "telstra", "optus", "vodafone", "aussie broadband", "tpg", "iiNet",
            "sydney water", "water corporation", "unitywater"
        ]
    },

    // -----------------------
    // Subscriptions (use statement patterns, avoid plain "apple"/"google")
    // -----------------------
    {
        category: "Subscriptions",
        keywords: [
            "apple.com/bill", "itunes", "app store",
            "prime vide", "amazon prime", "netflix", "spotify",
            "disney", "binge", "kayo", "stan", "paramount", "youtube premium",
            "audible", "playstation network", "xbox", "nintendo",
            "openai", "chatgpt"
        ]
    },

    // -----------------------
    // Health
    // -----------------------
    {
        category: "Health",
        keywords: [
            "chemist", "pharmacy", "chemist warehouse", "priceline", "terrywhite",
            "doctor", "medical", "dental", "dentist", "pathology", "radiology",
            "physio", "chiro", "optometrist"
        ]
    },

    // -----------------------
    // Insurance
    // -----------------------
    {
        category: "Insurance",
        keywords: [
            "nrma", "aami", "allianz", "gio", "youi", "budget direct",
            "racv", "racq", "nib", "bupa", "medibank", "hcf"
        ]
    },

    // -----------------------
    // Shopping
    // -----------------------
    {
        category: "Shopping",
        keywords: [
            "amazon", "ebay", "kmart", "big w", "target", "myer", "david jones",
            "jb hi-fi", "officeworks", "kogan", "the good guys", "harvey norman",
            "uniqlo", "zara", "h&m", "cotton on", "shein", "temu"
        ]
    },

    // -----------------------
    // Home and Garden
    // -----------------------
    {
        category: "Home and Garden",
        keywords: [
            "bunnings", "ikea", "mitre 10", "stratco", "freedom", "fantastic furniture",
            "spotlight", "nursery", "garden", "hardware"
        ]
    },

    // -----------------------
    // Entertainment
    // -----------------------
    {
        category: "Entertainment",
        keywords: [
            "event cinemas", "hoyts", "imax", "cinema", "theatre",
            "ticketek", "ticketmaster",
            "steam", "epic games", "playstation store", "xbox store"
        ]
    },

    // -----------------------
    // Travel
    // -----------------------
    {
        category: "Travel",
        keywords: [
            "qantas", "virgin", "jetstar", "emirates", "singapore airlines",
            "airbnb", "booking.com", "expedia", "hotel", "resort",
            "airalo", "travel"
        ]
    },

    // -----------------------
    // Gifts
    // -----------------------
    {
        category: "Gifts",
        keywords: [
            "gift", "flowers", "florist", "gift card"
        ]
    },

    // -----------------------
    // Education
    // -----------------------
    {
        category: "Education",
        keywords: [
            "course", "training", "udemy", "coursera", "pluralsight", "linkedin learning",
            "university", "tafe"
        ]
    },
];

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
    const [advancedSettings, setAdvancedSettings] = useState(stored?.advancedSettings ?? {
        alertSimulation: false,
        interestCostSimulator: false,
        payoffByDate: false,
        aiInsights: false
    });
    const [categoryRules, setCategoryRules] = useState(stored?.categoryRules ?? DEFAULT_CATEGORY_RULES);
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

        const payload = { transactions, income, debts, profile, advancedSettings, categoryRules };
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
    }, [transactions, income, debts, profile, advancedSettings, categoryRules, hasLoadedCloud]);





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

    // Advanced health score algorithm
    const { totalScore: healthScore, breakdown: healthBreakdown } = calculateDetailedHealthScore({
        savingsRate: parseFloat(savingsRate),
        dtiRatio: parseFloat(dtiRatio),
        debts,
        netSavings,
        totalIncome
    });

    // ---------------------------------------------
    // Wealth Trajectory Engine
    // ---------------------------------------------
    const wealthMetrics = useMemo(() => {
        // 1. Calculate Monthly Interest Burn
        const monthlyInterestCost = debts.reduce((acc, debt) => {
            const rate = getCurrentRate(debt);
            return acc + (debt.currentBalance * (rate / 100)) / 12;
        }, 0);

        // 2. Calculate Principal Velocity (Repayment - Interest)
        // Note: totalMonthlyDebt is sum of ALL payments
        const monthlyPrincipalPaid = Math.max(totalMonthlyDebt - monthlyInterestCost, 0);

        // 3. Total Net Worth Velocity (Net Savings + Principal Reduction)
        // Net Savings = Income - Expenses ( Expenses includes the FULL debt payment )
        // So: Change in Cash = Net Savings
        // Change in Debt = -PrincipalPaid
        // Change in NW = Change in Cash + Change in Debt (where Debt is negative liability)
        //              = Net Savings + PrincipalPaid
        // This is correct: Expenses (Cash Out) - Principal (Liability Down) = Interest (Expense)
        // Alternatively: NW Change = Income - (Expenses - Principal) - Interest === Income - Interest - (Other Expenses)
        // Simplified: NW Change = Net Savings + PrincipalPaid
        const monthlyVelocity = netSavings + monthlyPrincipalPaid;

        // 4. Projections
        const projected6Mo = netWorth + (monthlyVelocity * 6);
        const projected1Year = netWorth + (monthlyVelocity * 12);

        // 5. Crossover Date (if negative)
        let monthsToPositive = null;
        if (netWorth < 0 && monthlyVelocity > 0) {
            monthsToPositive = Math.abs(netWorth / monthlyVelocity);
        }

        return {
            netWorth,
            monthlyVelocity,
            monthlyPrincipalPaid,
            monthlyInterestCost,
            projected6Mo,
            projected1Year,
            monthsToPositive
        };
    }, [netWorth, netSavings, debts, totalMonthlyDebt]);

    // 2. Event Handlers
    const handleSaveTransaction = (txData) => {
        // Auto-Learning Logic: Check if we should learn this category assignment
        if (txData.item && txData.category && txData.category !== "Uncategorized") {
            const itemLower = txData.item.toLowerCase();
            const targetCategory = txData.category;

            setCategoryRules(prevRules => {
                const ruleIndex = prevRules.findIndex(r => r.category === targetCategory);
                let newRules = [...prevRules];

                if (ruleIndex >= 0) {
                    // Add keyword if not exists
                    if (!newRules[ruleIndex].keywords.includes(itemLower)) {
                        newRules[ruleIndex] = {
                            ...newRules[ruleIndex],
                            keywords: [...newRules[ruleIndex].keywords, itemLower]
                        };
                    } else {
                        return prevRules; // No change needed
                    }
                } else {
                    // Creates new rule group if category didn't exist in rules
                    newRules.push({ category: targetCategory, keywords: [itemLower] });
                }

                // If rules changed, also auto-update ALL existing transactions with this item name
                // We do this inside the setState callback to ensure we have the intent, 
                // but actually we need to setTransactions separately. 
                // To avoid side-effects in setState, we'll trigger this outside.
                return newRules;
            });

            // Apply this new rule strictly to all current transactions with same item name
            setTransactions(prev => prev.map(t => {
                if (t.item && t.item.toLowerCase() === itemLower && t.category !== targetCategory) {
                    return { ...t, category: targetCategory };
                }
                return t;
            }));
        }

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

    // AMEX CSV Import
    const makeTxnKey = (t) => {
        if (t.reference) return `ref:${String(t.reference).trim()}`;
        const date = String(t.date || "").trim();
        const amt = Number(t.amount || 0).toFixed(2);
        const desc = String(t.description || t.merchant || "").trim().toLowerCase();
        return `${date}|${amt}|${desc}`;
    };

    // State for categories (starting with defaults)
    const [categories, setCategories] = useState([
        "Housing",
        "Groceries",
        "Dining Out",
        "Coffee",
        "Transport",
        "Fuel",
        "Utilities",
        "Subscriptions",
        "Health",
        "Insurance",
        "Shopping",
        "Home and Garden",
        "Entertainment",
        "Travel",
        "Gifts",
        "Education",
        "Education / Career",
        "Fees and Interest",
        "Transfers",
        "Alcohol & Bottle Shop",
        "Gambling & Lottery",
        "Other",
    ]);

    const handleAddCategory = (newCat) => {
        if (!categories.includes(newCat)) {
            setCategories(prev => [...prev, newCat].sort());
        }
    };




    // Feature: Rescan all transactions and update categories
    const reapplyCategorization = () => {
        let updatedCount = 0;

        const newTransactions = transactions.map(tx => {
            const desc = tx.description || tx.item || ""; // Fallback to item if description missing
            const guessed = categorizeTransaction(desc, categoryRules);

            // Update only if currently Uncategorized and we found a match
            if (guessed !== "Uncategorized" && tx.category !== guessed) {
                updatedCount++;
                return { ...tx, category: guessed };
            }
            return tx;
        });

        if (updatedCount > 0) {
            setTransactions(newTransactions);
            alert(`Rescan complete! Updated ${updatedCount} transactions.`);
        } else {
            alert("Rescan complete. No new matches found.");
        }
    };

    const handleAmexImport = (importedTxns) => {
        try {
            if (!Array.isArray(importedTxns) || importedTxns.length === 0) return;

            setTransactions((prev) => {
                try {
                    const existingKeys = new Set(prev.map(makeTxnKey));
                    const toAdd = [];

                    for (const t of importedTxns) {
                        const date = t.date;
                        const amount = Number(t.amount || 0);
                        const description = String(t.description || t.merchant || "").trim();

                        if (!date || !description || Number.isNaN(amount)) continue;


                        const category = t.category || categorizeTransaction(description, categoryRules);

                        // If the guessed category is new, ensure it's in our list
                        if (category !== "Uncategorized") {
                            handleAddCategory(category);
                        }

                        const normalized = {
                            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `amex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            date,
                            amount,
                            item: description,
                            description,
                            merchant: t.merchant || description,
                            category: category,
                            reference: t.reference || null,
                            source: "amex_csv",
                            importedAt: new Date().toISOString(),
                        };

                        const key = makeTxnKey(normalized);
                        if (!existingKeys.has(key)) {
                            toAdd.push(normalized);
                            existingKeys.add(key);
                        }
                    }

                    return [...toAdd, ...prev];
                } catch (err) {
                    console.error("Error processing imported transactions:", err);
                    return prev;
                }
            });
        } catch (e) {
            console.error("Failed to handle AMEX import:", e);
        }
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
            setCurrentTab('transactions');
            setActionFeedback(`Applied filter: ${action.payload}`);
        }

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
                    advancedSettings={advancedSettings}
                    onUpdateSettings={setAdvancedSettings}
                />
            );
        }

        if (currentTab === "liabilities") {
            return (
                <ActiveLiabilities
                    debts={debts}
                    onUpdateDebts={setDebts}
                    advancedSettings={advancedSettings}
                />
            );
        }

        if (currentTab === "payoff") {
            return (
                <PayoffPlanView
                    debts={debts}
                    onUpdateDebts={setDebts}
                    advancedSettings={advancedSettings}
                />
            );
        }

        if (currentTab === "scenarios") {
            return (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Scenario Simulator
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Test what-if scenarios and see instant impact on your financial metrics
                        </p>
                    </div>
                    <ScenarioSimulator
                        income={income}
                        transactions={transactions}
                        debts={debts}
                    />
                </div>
            );
        }

        if (currentTab === "subscriptions") {
            return (
                <SubscriptionIntelligence
                    transactions={transactions}
                    debts={debts}
                    income={income}
                />
            );
        }

        if (currentTab === "relocation") {
            return (
                <RelocationScenario
                    income={income}
                    transactions={transactions}
                    debts={debts}
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Transactions</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={reapplyCategorization}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                title="Rescan existing transactions with new rules"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Rescan Categories
                            </button>
                            <button
                                onClick={handleNewClick}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add New
                            </button>
                        </div>
                    </div>

                    {/* AMEX Import */}
                    <div className="mb-6">
                        <AmexCsvImport onImport={handleAmexImport} />
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
                        breakdown={healthBreakdown}
                        savingsRate={savingsRate}
                        dtiRatio={dtiRatio}
                        netWorthData={wealthMetrics}
                    />
                </div>

                {/* 30-Day Action Plan */}
                <ActionPlanPanel
                    transactions={transactions}
                    income={income}
                    debts={debts}
                    month={new Date().getMonth()}
                />

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Income"
                        value={`$${totalIncome.toLocaleString()}`}
                        icon={DollarSign}
                        color="blue"
                        trend="up"
                        trendValue="+0.0%"
                        tooltip="Total earnings from all sources this month, including salary and side income."
                    />
                    <MetricCard
                        title="Total Expenses"
                        value={`$${totalExpenses.toLocaleString()}`}
                        icon={TrendingDown}
                        color="orange"
                        trend={totalExpenses > totalIncome ? "up" : "down"}
                        trendValue="vs Income"
                        tooltip="Total spending across all categories. Try to keep this below your income."
                    />
                    <MetricCard
                        title="Net Savings"
                        value={`$${netSavings.toLocaleString()}`}
                        icon={PiggyBank}
                        color="green"
                        trend={netSavings > 0 ? "up" : "down"}
                        trendValue={`${savingsRate}% Rate`}
                        tooltip="Income minus Expenses. This is your monthly wealth generation."
                    />
                    <MetricCard
                        title="Debt Balance"
                        value={`$${debts.reduce((a, b) => a + b.currentBalance, 0).toLocaleString()}`}
                        icon={Wallet}
                        color="red"
                        trend="down"
                        trendValue="Total"
                        tooltip="Total remaining principal on all active loans and credit cards."
                    />
                </div>

                <DebtRiskBanner banners={getDebtRiskBanners(debts)} />

                <InterestRiskPanel
                    {...calculateInterestProjections(debts)}
                />

                {/* Simulated Notification Log */}
                {advancedSettings.alertSimulation && (
                    <div className="mb-8 p-4 bg-gray-900 rounded-xl text-white shadow-lg border border-gray-700">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                            Live Push Notification Log (Simulation)
                        </h3>
                        <div className="space-y-2 font-mono text-xs">
                            {getDebtRiskBanners(debts).slice(0, 3).map(banner => (
                                <div key={banner.id} className="flex gap-3 p-2 bg-gray-800 rounded border-l-4 border-purple-500">
                                    <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="font-bold text-white">PUSH_SENT:</span>
                                    <span className="text-gray-300">"{banner.alertType}: {banner.debtName}"</span>
                                </div>
                            ))}
                            {getDebtRiskBanners(debts).length === 0 && (
                                <div className="text-gray-500 italic">No active alerts to simulate.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <IncomeExpenseChart data={incomeExpenseData} />
                    <CategoryPieChart data={categoryData} />
                </div>

                {/* Recent Transactions Preview */}
                {/* Bottom Section: Strict 12-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Row 1: Spending Intelligence (Full Width) */}
                    <div className="lg:col-span-12 w-full h-auto lg:h-[500px]">
                        <SpendingIntelligence transactions={transactions} />
                    </div>

                    {/* Row 2: Active Debts (Half Width) */}
                    <div className="col-span-1 lg:col-span-6 w-full h-auto lg:h-full">
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

                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {calculateEffectiveRateState(debt).rateIsSwitched ? "Effective Rate" : "Interest"}
                                            </span>
                                            <span className={`font-medium dark:text-gray-200 ${calculateEffectiveRateState(debt).rateIsSwitched ? "text-orange-600 dark:text-orange-400 font-bold" : ""}`}>
                                                {calculateEffectiveRateState(debt).effectiveRatePct}%
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
                    {advancedSettings.aiInsights && (
                        <div className="col-span-1 lg:col-span-6 w-full h-auto lg:h-full">
                            <InsightsCard
                                transactions={transactions}
                                income={income}
                                debts={debts}
                                savingsRate={savingsRate}
                                onAction={handleInsightAction}
                            />
                        </div>
                    )}
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
                onSave={(tx) => {
                    handleSaveTransaction(tx);
                    handleAddCategory(tx.category); // Learn new categories on save
                }}
                initialData={editingTransaction}
                availableCategories={categories}
            />
        </DashboardLayout>
    );
}

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
import WealthTrajectory from "./components/WealthTrajectory";
import RelocationCommandCenter from "./components/RelocationCommandCenter";
import OverviewV2 from "./components/OverviewV2";
import { calculateEffectiveRateState, getDebtRiskBanners, calculateInterestProjections, getCurrentRate } from "./utils/PayoffEngine";
import AmexCsvImport from "./components/AmexCsvImport";
import RecurringExpensesModal from "./components/RecurringExpensesModal";
import { categorizeTransaction } from "./utils/categorize";
import { calculateDetailedHealthScore } from "./utils/healthScore";
import { DEFAULT_OFFERS, DEFAULT_RELOCATION_SETTINGS } from "./data/relocationOffers";
import { getHouseholdState, upsertHouseholdState } from "./lib/householdApi";
import SyncIndicator from "./components/SyncIndicator";
import HouseholdPinGate from "./components/HouseholdPinGate";

import { DEFAULT_STATE } from "./data";
import { DollarSign, TrendingDown, PiggyBank, Wallet, Plus, RefreshCw, Layers, Calendar } from "lucide-react";

// Extensive Categorization Rules (Australian Context)
const DEFAULT_CATEGORY_RULES = [
    // -----------------------
    // Transfers (must be early)
    // -----------------------
    {
        category: "Transfers",
        keywords: [
            "transfer", "internet transfer", "osko", "payment received", "salary", "payroll", "reimbursement",
            "refund", "reversal"
        ]
    },
    {
        category: "Bills Payments",
        keywords: [
            "bpay", "direct debit", "pay anyone", "bankwest", "nab", "citi", "amex payment", "loan repayment"
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
            "starbucks", "gloria jeans", "zarraffas", "campos", "single o",
            "coffee", "cafe"
        ]
    },

    // -----------------------
    // Fuel & Transport
    // -----------------------
    {
        category: "Fuel and Transport",
        keywords: [
            "7-eleven", "bp connect", "caltex", "ampol", "shell", "united petroleum",
            "metro petroleum", "costco fuel", "opal", "transport nsw", "uber", "didi",
            "ola", "taxi", "cab", "parking", "wilson parking", "secure parking"
        ]
    },

    // -----------------------
    // Utilities
    // -----------------------
    {
        category: "Utilities",
        keywords: [
            "agl", "origin energy", "energyaustralia", "red energy", "telstra",
            "optus", "vodafone", "tpg", "aussie broadband", "sydney water",
            "council", "rates"
        ]
    },

    // -----------------------
    // Shopping
    // -----------------------
    {
        category: "Shopping",
        keywords: [
            "kmart", "target", "big w", "myer", "david jones", "jb hi-fi",
            "harvey norman", "officeworks", "bunnings", "amazon", "ebay",
            "cotton on", "uniqlo", "zara", "h&m", "ikea", "chemist warehouse",
            "priceline", "mecca", "sephora"
        ]
    },

    // -----------------------
    // Entertainment & Subs
    // -----------------------
    {
        category: "Entertainment",
        keywords: [
            "netflix", "spotify", "youtube", "stan", "disney", "binge",
            "prime video", "apple", "itunes", "google play", "steam",
            "playstation", "xbox", "hoyts", "event cinemas", "ticketek",
            "ticketmaster"
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

const STORAGE_KEY_V2 = "er_finance_state_v2";
const STORAGE_KEY_V1 = "er_finance_state_v1";

function loadStored() {
    try {
        // Try loading v2 first
        const v2Raw = localStorage.getItem(STORAGE_KEY_V2);
        if (v2Raw) {
            const data = JSON.parse(v2Raw);
            // Ensure all transactions have periodKey
            if (data.transactions) {
                data.transactions = data.transactions.map(tx => ({
                    ...tx,
                    periodKey: tx.periodKey || tx.monthKey || (tx.date ? tx.date.substring(0, 7) : null)
                }));
            }
            return data;
        }

        // Migration: Try loading v1 and separate keys
        const v1Raw = localStorage.getItem(STORAGE_KEY_V1);
        const incomeHistoryRaw = localStorage.getItem("incomeHistory");
        const recurringExpensesRaw = localStorage.getItem("recurringExpenses");

        if (v1Raw || incomeHistoryRaw || recurringExpensesRaw) {
            console.log("Migrating from v1 to v2 storage format...");

            const v1Data = v1Raw ? JSON.parse(v1Raw) : {};
            const incomeHistory = incomeHistoryRaw ? JSON.parse(incomeHistoryRaw) : undefined;
            const recurringExpenses = recurringExpensesRaw ? JSON.parse(recurringExpensesRaw) : undefined;

            // Migrate transactions to include periodKey
            let transactions = v1Data.transactions || [];
            transactions = transactions.map(tx => ({
                ...tx,
                periodKey: tx.monthKey || (tx.date ? tx.date.substring(0, 7) : null)
            }));

            // Merge all data into v2 format
            const v2Data = {
                ...v1Data,
                transactions,
                incomeHistory: incomeHistory || v1Data.incomeHistory,
                recurringExpenses: recurringExpenses || v1Data.recurringExpenses,
                activePeriodKey: v1Data.activeMonth || new Date().toISOString().substring(0, 7)
            };

            // Save to v2 format
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(v2Data));

            // Clean up old keys
            localStorage.removeItem(STORAGE_KEY_V1);
            localStorage.removeItem("incomeHistory");
            localStorage.removeItem("recurringExpenses");

            console.log("Migration complete!");
            return v2Data;
        }

        return null;
    } catch (e) {
        console.error("Failed to load stored state", e);
        return null;
    }
}

function saveStored(data) {
    try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save state", e);
    }
}

// Single parseAmount helper function to avoid duplicates
function parseAmount(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v).trim();
    // Remove currency + thousands separators, keep minus and dot
    const cleaned = s.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
}

export default function App() {
    // Household PIN state
    const [householdPin, setHouseholdPin] = useState(null);
    const [showPinGate, setShowPinGate] = useState(true);
    const [syncStatus, setSyncStatus] = useState('offline'); // loading, saving, synced, offline
    const saveTimeoutRef = useRef(null);
    const [hasInitializedRemote, setHasInitializedRemote] = useState(false);
    const stored = useMemo(() => loadStored(), []);

    const [transactions, setTransactions] = useState(stored?.transactions ?? DEFAULT_STATE.transactions);
    const [income, setIncome] = useState(stored?.income ?? DEFAULT_STATE.income);
    const [debts, setDebts] = useState(stored?.debts ?? DEFAULT_STATE.debts);
    const [profile, setProfile] = useState(stored?.profile ?? DEFAULT_STATE.profile);
    const [advancedSettings, setAdvancedSettings] = useState(stored?.advancedSettings ?? {
        alertSimulation: false,
        interestCostSimulator: false,
        payoffByDate: false,
        aiInsights: false,
        includeTransfersInSpending: false
    });
    const [categoryRules, setCategoryRules] = useState(stored?.categoryRules ?? DEFAULT_CATEGORY_RULES);
    const [categories, setCategories] = useState(stored?.categories ?? [
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
    const [relocation, setRelocation] = useState(stored?.relocation ?? {
        offers: DEFAULT_OFFERS,
        assumptions: DEFAULT_RELOCATION_SETTINGS,
        selectedOfferIds: ['sydney', 'dubai'],
        baselineId: 'sydney',
        primaryOfferId: 'dubai'
    });

    // Income History loaded from unified v2 storage
    const [incomeHistory, setIncomeHistory] = React.useState(() => {
        if (stored?.incomeHistory) return stored.incomeHistory;
        // Default seed based on current income state + user request
        return [
            { id: 'init', date: '2020-01', ...DEFAULT_STATE.income, salaryRebecca: 7300 }, // Historic baseline
            { id: 'promo2026', date: '2026-01', ...DEFAULT_STATE.income, salaryRebecca: 8300 }  // New promotion
        ];
    });

    // Recurring Expenses loaded from unified v2 storage
    const [recurringExpenses, setRecurringExpenses] = useState(() => {
        return stored?.recurringExpenses ?? [];
    });

    // activePeriodKey must be declared before useEffect that references it
    const [activePeriodKey, setActivePeriodKey] = React.useState(() => {
        return stored?.activePeriodKey ?? new Date().toISOString().substring(0, 7);
    });

    const [saveStatus, setSaveStatus] = useState("Saved");
    const [hasLoadedCloud, setHasLoadedCloud] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                // Cloud sync disabled - no backend available
                // const res = await fetch("/api/state");
                // const json = await res.json();
                // if (json?.state) {
                //     setTransactions(json.state.transactions ?? DEFAULT_STATE.transactions);
                //     setIncome(json.state.income ?? DEFAULT_STATE.income);
                //     setDebts(json.state.debts ?? DEFAULT_STATE.debts);
                //     setProfile(json.state.profile ?? DEFAULT_STATE.profile);
                //     setAdvancedSettings(json.state.advancedSettings ?? {
                //         alertSimulation: false,
                //         interestCostSimulator: false,
                //         payoffByDate: false,
                //         aiInsights: false,
                //         includeTransfersInSpending: false
                //     });
                //     setCategoryRules(json.state.categoryRules ?? DEFAULT_CATEGORY_RULES);
                //     if (json.state.categories) {
                //         setCategories(json.state.categories);
                //     }
                //     setRelocation(json.state.relocation ?? {
                //         offers: DEFAULT_OFFERS,
                //         assumptions: DEFAULT_RELOCATION_SETTINGS,
                //         selectedOfferIds: ['sydney', 'dubai'],
                //         baselineId: 'sydney',
                //         primaryOfferId: 'dubai'
                //     });
                // }
            } catch (e) {
                // Silently fail - cloud state is optional
            } finally {
                // Set hasLoadedCloud after all state has been applied
                setHasLoadedCloud(true);
            }
        };

        load();
    }, []);

    // Check for saved PIN on startup
    useEffect(() => {
        const savedPin = localStorage.getItem('er_finance_household_pin');
        if (savedPin) {
            setHouseholdPin(savedPin);
            setShowPinGate(false);
        }
    }, []);

    // Handle PIN set from HouseholdPinGate
    const handlePinSet = useCallback((pin) => {
        setHouseholdPin(pin);
        setShowPinGate(false);
    }, []);

    // Load remote state when PIN is set
    useEffect(() => {
        if (!householdPin || hasInitializedRemote) return;

        const initializeRemote = async () => {
            try {
                setSyncStatus('loading');

                // Try to fetch remote state
                const remoteState = await getHouseholdState(householdPin);

                if (remoteState && Object.keys(remoteState).length > 0) {
                    // Returning household - load remote state
                    setTransactions(remoteState.transactions ?? []);
                    setIncome(remoteState.income ?? DEFAULT_STATE.income);
                    setDebts(remoteState.debts ?? []);
                    setProfile(remoteState.profile ?? DEFAULT_STATE.profile);
                    setAdvancedSettings(remoteState.advancedSettings ?? DEFAULT_STATE.advancedSettings);
                    setCategoryRules(remoteState.categoryRules ?? DEFAULT_CATEGORY_RULES);
                    setCategories(remoteState.categories ?? DEFAULT_STATE.categories);
                    setRelocation(remoteState.relocation ?? DEFAULT_STATE.relocation);
                    setIncomeHistory(remoteState.incomeHistory ?? []);
                    setRecurringExpenses(remoteState.recurringExpenses ?? []);
                    setActivePeriodKey(remoteState.activePeriodKey ?? new Date().toISOString().substring(0, 7));
                    console.log('✅ Loaded remote state');
                    setSyncStatus('synced');
                } else {
                    // First time household - keep local state and upsert to remote
                    console.log('📤 First time household, uploading local state...');
                    const currentState = {
                        transactions,
                        income,
                        debts,
                        profile,
                        advancedSettings,
                        categoryRules,
                        categories,
                        relocation,
                        incomeHistory,
                        recurringExpenses,
                        activePeriodKey
                    };
                    await upsertHouseholdState(householdPin, currentState);
                    setSyncStatus('synced');
                }

                setHasInitializedRemote(true);
            } catch (err) {
                console.error('Failed to initialize remote state:', err);
                setSyncStatus('offline');
                setHasInitializedRemote(true); // Don't retry automatically
            }
        };

        initializeRemote();
    }, [householdPin, hasInitializedRemote]);

    // Save to localStorage and debounced remote sync
    useEffect(() => {
        if (!hasLoadedCloud) return;

        // Save all state in unified v2 format (offline cache)
        const payload = {
            transactions,
            income,
            debts,
            profile,
            advancedSettings,
            categoryRules,
            categories,
            relocation,
            incomeHistory,
            recurringExpenses,
            activePeriodKey
        };
        saveStored(payload);

        // Debounced remote sync if PIN is set
        if (householdPin) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    setSyncStatus('saving');
                    await upsertHouseholdState(householdPin, payload);
                    setSyncStatus('synced');
                } catch (err) {
                    console.error('Failed to sync household state:', err);
                    setSyncStatus('offline');
                }
            }, 800);

            return () => {
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }
            };
        }
    }, [transactions, income, debts, profile, advancedSettings, categoryRules, categories, relocation, incomeHistory, recurringExpenses, activePeriodKey, hasLoadedCloud, householdPin]);







    const [currentTab, setCurrentTab] = React.useState("overview");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    // --- Statement-Aware Logic Helpers ---
    const getPeriodKey = (tx) => {
        return tx.periodKey || null;
    };

    // Helper to find effective income for a given month
    // Returns the income object effective for that month
    const getIncomeForMonth = (monthKey) => {
        if (!monthKey) return income; // Fallback to current state

        // Find latest history entry strictly before or equal to this month
        // Sort history by date descending
        const sortedHistory = [...incomeHistory].sort((a, b) => b.date.localeCompare(a.date));
        const effective = sortedHistory.find(h => h.date <= monthKey);

        return effective || sortedHistory[sortedHistory.length - 1] || income;
    };

    // --- Classification Helpers ---
    function inferTransactionKind(tx) {
        if (tx.kind) return tx.kind;

        const amt = parseAmount(tx.amount);
        const desc = String(tx.description || tx.merchant || tx.item || "").toLowerCase();

        // Always treat explicit categories first
        if (tx.category === "Transfers") return "transfer";
        if (tx.category === "Income" || tx.type === "income") return "income";

        // Payment keywords (paying the card)
        const paymentKeywords = [
            "payment", "payment thank you", "payment - thank you",
            "direct debit", "bpay", "autopay", "auto pay",
            "statement payment", "card payment", "amex payment"
        ];
        if (paymentKeywords.some(k => desc.includes(k))) return "payment";

        // IMPORTANT: Card purchases are usually negative
        // Purchases: negative
        // Credits/refunds: positive
        if (amt < 0) return "expense";
        if (amt > 0) return "refund";

        return "expense";
    }

    // Recurring Expenses Modal state
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

    // --- Ledger: Single Source of Truth (Core Engine) ---
    const monthlyLedger = useMemo(() => {
        // 1. Gather all relevant month keys
        // 1. Gather all relevant period keys
        const periods = new Set();
        if (activePeriodKey) periods.add(activePeriodKey);
        transactions.forEach(tx => {
            const p = getPeriodKey(tx);
            if (p) periods.add(p);
        });
        incomeHistory.forEach(h => {
            if (h.date) periods.add(h.date);
        });

        // 2. Build Ledger Rows
        const ledger = Array.from(periods).filter(Boolean).map(periodKey => {
            // A. Planned Income
            const incObj = getIncomeForMonth(periodKey);
            const plannedIncome = (incObj.salaryEric || 0) + (incObj.salaryRebecca || 0) + (incObj.other || 0);

            // B. Recurring Spend (Virtual) - only active items within period range
            const recurringSpend = recurringExpenses
                .filter(item => {
                    // Must be active
                    if (item.active === false) return false;
                    // Check period range if specified
                    if (item.startPeriodKey && periodKey < item.startPeriodKey) return false;
                    if (item.endPeriodKey && periodKey > item.endPeriodKey) return false;
                    return true;
                })
                .reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);

            // C. AMEX / Real Transactions
            const txs = transactions.filter(tx => getPeriodKey(tx) === periodKey);

            const amexTotals = txs.reduce((acc, txRaw) => {
                const kind = inferTransactionKind(txRaw);
                const amt = parseAmount(txRaw.amount);
                const absAmt = Math.abs(amt);

                if (kind === "expense") acc.gross += absAmt;
                if (kind === "refund") acc.refunds += absAmt;
                if (kind === "payment") acc.payments += absAmt;
                if (kind === "income") acc.incomeActual += absAmt;
                if (kind === "transfer") acc.transfers += absAmt;

                return acc;
            }, { gross: 0, refunds: 0, payments: 0, transfers: 0, incomeActual: 0 });

            const amexNetSpend = amexTotals.gross - amexTotals.refunds;
            const totalExpenses = amexNetSpend + recurringSpend;

            return {
                monthKey: periodKey,
                plannedIncome,
                recurringSpend,
                amexGrossSpend: amexTotals.gross,
                amexRefunds: amexTotals.refunds,
                amexNetSpend,
                totalExpenses,
                paymentsToCard: amexTotals.payments,
                transfers: amexTotals.transfers,
                amexIncome: amexTotals.incomeActual,
                netDelta: plannedIncome - totalExpenses
            };
        });

        return ledger.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    }, [transactions, incomeHistory, recurringExpenses, activePeriodKey]);

    // --- Derived Transaction Sets for Active Month ---
    const activeTransactionsAll = useMemo(() => {
        // 1. Get real transactions for this period
        const realTx = transactions.filter(tx => {
            const txPeriod = getPeriodKey(tx);
            return txPeriod === activePeriodKey;
        });

        // 2. Generate virtual transactions from recurring list
        // Formatted to look like real transactions with negative amounts for expenses
        // Only include active items within period range
        const virtualTx = recurringExpenses
            .filter(item => {
                // Must be active (default true if not specified)
                if (item.active === false) return false;
                // Check period range if specified
                if (item.startPeriodKey && activePeriodKey < item.startPeriodKey) return false;
                if (item.endPeriodKey && activePeriodKey > item.endPeriodKey) return false;
                return true;
            })
            .map(item => ({
                id: `virtual-${activePeriodKey}-${item.id}`,
                date: `${activePeriodKey}-${String(item.day).padStart(2, '0')}`,
                periodKey: activePeriodKey,
                description: item.description,
                item: item.description,
                merchant: item.description,
                amount: -Math.abs(parseAmount(item.amount)),  // Force negative for expenses
                category: item.category || "Other",  // Default to "Other" if missing
                type: "expense",
                kind: "expense",  // Explicitly set to prevent inference
                isVirtual: true,
            }));

        return [...realTx, ...virtualTx]
            .map(tx => ({
                ...tx,
                kind: tx.kind || inferTransactionKind(tx)  // Use explicit kind or infer
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [transactions, activePeriodKey, recurringExpenses]);

    // Helper Functions for Cashflow Calculations
    const normalizeAmount = (tx) => parseAmount(tx.amount);

    const isInflow = (tx) => tx.kind === "income";
    const isOutflow = (tx) => tx.kind === "expense";

    const activeTransactionsSpending = useMemo(() => {
        return activeTransactionsAll.filter(tx => {
            // Exclude Transfers unless toggle is enabled
            if (tx.category === "Transfers" && !advancedSettings.includeTransfersInSpending) {
                return false;
            }
            // Exclude Income (positive amounts usually, but strictly check type or inflow logic later)
            // Reusing global logic: strictly speaking, spending = outflow
            return isOutflow(tx);
        });
    }, [activeTransactionsAll, advancedSettings.includeTransfersInSpending]);

    // ---------------------------------------------
    // Selector: Get Active Ledger Row
    // ---------------------------------------------
    const getActiveLedgerRow = (periodKey, ledger) => {
        return ledger.find(r => r.monthKey === periodKey) || {
            plannedIncome: 0,
            recurringSpend: 0,
            amexGrossSpend: 0,
            amexRefunds: 0,
            amexNetSpend: 0,
            totalExpenses: 0,
            paymentsToCard: 0,
            transfers: 0,
            amexIncome: 0,
            netDelta: 0
        };
    };

    // ---------------------------------------------
    // Calculate Key Metrics (Source: monthlyLedger)
    // ---------------------------------------------
    const activeLedgerEntry = getActiveLedgerRow(activePeriodKey, monthlyLedger);

    const activePlannedIncome = activeLedgerEntry.plannedIncome;
    const netSpend = activeLedgerEntry.amexNetSpend;
    const totalExpenses = activeLedgerEntry.totalExpenses; // Includes recurring
    const totalPaymentsToCard = activeLedgerEntry.paymentsToCard;

    // Legacy/Compatibility Map
    // NOTE: totalOutflowSpending in legacy code meant "Total Expenses". 
    // Now it matches the Ledger's total expenses (Amex + Recurring).
    // Wait, previously `activeTransactionsSpending` INCLUDED virtual recurring txs because they were in `activeTransactionsAll`.
    // So `activeTransactionsSpending` sum SHOULD match `activeLedgerEntry.totalExpenses`.
    // To be safe and consistent, we point to Ledger.
    const totalOutflowSpending = totalExpenses;

    // Inflow: We usually track actual income here.
    // In ledger, we haven't tracked "Actual Income" specifically (just planned).
    // Let's keep the existing accountingTotals logic for "Inflow" or just use Planned for now?
    // User ref request: "netDelta = plannedIncome - totalExpenses".
    // Let's stick to that.
    // Inflow: Actual income from Amex/Bank transactions marked as 'income'
    const totalInflow = activeLedgerEntry.amexIncome;

    const netCashflow = activeLedgerEntry.netDelta;
    const netSavings = activeLedgerEntry.netDelta;
    const savingsRate = activePlannedIncome > 0 ? ((netSavings / activePlannedIncome) * 100).toFixed(1) : "0.0";

    // Re-calculate Accounting breakdown for the Panel (using Ledger data where possible, or granular if needed)
    // The Ledger aggregates totals. Does it expose breakdown of purchases vs refunds?
    // Yes: amexGrossSpend, amexRefunds.
    const accountingTotals = {
        grossSpend: activeLedgerEntry.amexGrossSpend,
        refundCredits: activeLedgerEntry.amexRefunds,
        payments: activeLedgerEntry.paymentsToCard,
        transfers: activeLedgerEntry.transfers || 0,
        recurring: activeLedgerEntry.recurringSpend
    };

    // ---------------------------------------------
    // Dev Mode Assertion: Data Consistency Check
    // ---------------------------------------------
    const dataConsistencyCheck = useMemo(() => {
        // Calculate sum of REAL (non-virtual) transaction spending only
        // Virtual transactions represent recurring expenses, which are already
        // included in the ledger's recurringSpend field
        const realExpensesOnly = activeTransactionsAll
            .filter(tx => tx.kind === "expense" && !tx.isVirtual)
            .reduce((sum, tx) => sum + Math.abs(parseAmount(tx.amount)), 0);

        const ledgerExpenses = activeLedgerEntry.totalExpenses;
        const ledgerRecurring = activeLedgerEntry.recurringSpend;

        // For fair comparison: add recurring back to real expenses
        // because ledger totalExpenses = amexNetSpend + recurringSpend
        const calculatedTotal = realExpensesOnly + ledgerRecurring;
        const delta = Math.abs(calculatedTotal - ledgerExpenses);

        return {
            calculatedSpending: calculatedTotal,
            ledgerExpenses,
            delta,
            hasMismatch: delta > 1  // More than $1 difference
        };
    }, [activeTransactionsAll, activeLedgerEntry.totalExpenses, activeLedgerEntry.recurringSpend]);

    // Financial Health Calculations
    // Note: Debt Balances and Net Worth are effectively "Snapshot" or "Global"
    const totalIncome = activePlannedIncome; // Use month plan as basis for ratios
    const totalDebtBalance = debts.reduce((acc, d) => acc + d.currentBalance, 0);
    const totalMonthlyDebt = debts.reduce((acc, d) => acc + d.monthlyRepayment, 0);
    const dtiRatio = totalIncome > 0 ? ((totalMonthlyDebt / totalIncome) * 100).toFixed(1) : "0.0";
    const netWorth = (profile.assets || 0) - totalDebtBalance;

    // ---------------------------------------------
    // Advanced Search Filtering
    // ---------------------------------------------
    const filteredTransactions = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === "") {
            // Default view: Active month only if no search
            return activeTransactionsAll;
        }

        const query = searchQuery.toLowerCase().trim();

        // If searching, we search ALL transactions (global search)
        // unless the user explicitly wants to filter within the active month?
        // For now, global search is more useful for "find that thing I bought last year"
        return transactions.filter(tx => {
            // Category filter: cat:groceries
            if (query.startsWith("cat:")) {
                const catSearch = query.substring(4).trim();
                return tx.category && tx.category.toLowerCase().includes(catSearch);
            }

            // Amount greater than: amt>100
            if (query.startsWith("amt>")) {
                const amtThreshold = parseFloat(query.substring(4));
                return !isNaN(amtThreshold) && tx.amount > amtThreshold;
            }

            // Amount less than: amt<50
            if (query.startsWith("amt<")) {
                const amtThreshold = parseFloat(query.substring(4));
                return !isNaN(amtThreshold) && tx.amount < amtThreshold;
            }

            // Date filter: date:2026-01 (matches YYYY-MM)
            if (query.startsWith("date:")) {
                const dateSearch = query.substring(5).trim();
                return tx.date && tx.date.startsWith(dateSearch);
            }

            // Text search: match item, description, merchant, category, reference
            const searchText = query;
            return (
                (tx.item && tx.item.toLowerCase().includes(searchText)) ||
                (tx.description && tx.description.toLowerCase().includes(searchText)) ||
                (tx.merchant && tx.merchant.toLowerCase().includes(searchText)) ||
                (tx.category && tx.category.toLowerCase().includes(searchText)) ||
                (tx.reference && tx.reference.toLowerCase().includes(searchText))
            );
        });
    }, [transactions, activeTransactionsAll, searchQuery]);


    // Advanced health score algorithm
    const { totalScore: healthScore, breakdown: healthBreakdown } = calculateDetailedHealthScore({
        savingsRate: parseFloat(savingsRate),
        dtiRatio: parseFloat(dtiRatio),
        debts,
        netSavings,
        totalIncome
    });

    // ---------------------------------------------
    // Memoized Debt Rate Calculations
    // ---------------------------------------------
    // Calculate effective rate state for each debt only once per render
    const debtRateStateById = useMemo(() => {
        const map = {};
        for (const d of debts) {
            map[d.id] = calculateEffectiveRateState(d);
        }
        return map;
    }, [debts]);

    // ---------------------------------------------
    // Wealth Trajectory Engine
    // ---------------------------------------------
    const wealthMetrics = useMemo(() => {
        // 1. Calculate Monthly Interest Burn
        const monthlyInterestCost = debts.reduce((acc, debt) => {
            const rateState = debtRateStateById[debt.id];
            const rate = parseFloat(rateState.effectiveRatePct);
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
    }, [netWorth, netSavings, debts, totalMonthlyDebt, debtRateStateById]);

    // 2. Event Handlers
    const handleSaveTransaction = (txData) => {
        // Determine if this is a manual category assignment
        // Manual if: editing and changed category, OR new transaction with non-Uncategorized category
        const isManual = editingTransaction
            ? txData.category !== editingTransaction.category  // Changed category
            : txData.category && txData.category !== "Uncategorized";  // New with category

        // Add manual categorization flag
        const txWithFlag = {
            ...txData,
            isManualCategory: isManual
        };

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
            setTransactions(prev => prev.map(t => (t.id === txWithFlag.id ? txWithFlag : t)));
        } else {
            setTransactions(prev => [txWithFlag, ...prev]);
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

    const handleAddCategory = (newCat) => {
        if (!categories.includes(newCat)) {
            setCategories(prev => [...prev, newCat].sort());
        }
    };




    // Feature: Rescan all transactions and update categories (respects manual categorization)
    const reapplyCategorization = () => {
        let updatedCount = 0;

        const newTransactions = transactions.map(tx => {
            // Skip manually categorized transactions
            if (tx.isManualCategory === true) {
                return tx;
            }

            // Only update if Uncategorized or empty
            if (tx.category && tx.category !== "Uncategorized") {
                return tx;
            }

            const desc = tx.description || tx.item || "";
            const guessed = categorizeTransaction(desc, categoryRules);

            if (guessed !== "Uncategorized") {
                updatedCount++;
                return { ...tx, category: guessed, isManualCategory: false };
            }
            return tx;
        });

        if (updatedCount > 0) {
            setTransactions(newTransactions);
            alert(`✓ Rescan complete!\n\nUpdated ${updatedCount} uncategorized transaction${updatedCount !== 1 ? 's' : ''}.\nManual categories preserved.`);
        } else {
            alert("✓ Rescan complete.\n\nNo uncategorized transactions found.");
        }
    };

    // Force rescan: overwrites ALL categories including manual ones
    const forceReapplyCategorization = () => {
        const confirmed = confirm(
            "⚠️ FORCE RESCAN WARNING\n\n" +
            "This will overwrite ALL transaction categories, including manually set ones.\n\n" +
            "Are you sure you want to continue?"
        );

        if (!confirmed) return;

        let overwrittenCount = 0;

        const newTransactions = transactions.map(tx => {
            const desc = tx.description || tx.item || "";
            const guessed = categorizeTransaction(desc, categoryRules);

            if (guessed !== "Uncategorized" && tx.category !== guessed) {
                overwrittenCount++;
                return { ...tx, category: guessed, isManualCategory: false };
            }
            return { ...tx, isManualCategory: false };  // Reset flag even if no change
        });

        setTransactions(newTransactions);
        alert(
            `✓ Force rescan complete!\n\n` +
            `Overwritten ${overwrittenCount} transaction${overwrittenCount !== 1 ? 's' : ''}.\n` +
            `All categories are now auto-managed.`
        );
    };

    const handleAmexImport = (importedTxns) => {
        try {
            if (!Array.isArray(importedTxns) || importedTxns.length === 0) return;

            let duplicatesSkipped = 0;
            let imported = 0;

            setTransactions((prev) => {
                try {
                    const existingKeys = new Set(prev.map(makeTxnKey));
                    const toAdd = [];

                    for (const t of importedTxns) {
                        const date = t.date;
                        const amount = parseAmount(t.amount);
                        const description = String(t.description || t.merchant || "").trim();

                        if (!date || !description || Number.isNaN(amount)) continue;


                        const category = t.category || categorizeTransaction(description, categoryRules);
                        const periodKey = t.periodKey; // ✅ Already set from AmexCsvImport

                        // If the guessed category is new, ensure it's in our list
                        if (category !== "Uncategorized") {
                            handleAddCategory(category);
                        }

                        const normalized = {
                            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `amex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            date,
                            periodKey,
                            amount,
                            item: description,
                            description,
                            merchant: t.merchant || description,
                            category: category,
                            reference: t.reference || null,
                            source: "amex_csv",
                            importedAt: new Date().toISOString(),
                            isManualCategory: false, // Auto-categorized from import
                        };

                        // Assign Kind
                        normalized.kind = inferTransactionKind(normalized);

                        const key = makeTxnKey(normalized);
                        if (!existingKeys.has(key)) {
                            toAdd.push(normalized);
                            existingKeys.add(key);
                            imported++;
                        } else {
                            duplicatesSkipped++;
                        }
                    }

                    // Show summary alert
                    setTimeout(() => {
                        alert(
                            `✓ Import Complete!\n\n` +
                            `Imported: ${imported} transaction${imported !== 1 ? 's' : ''}\n` +
                            `Duplicates Skipped: ${duplicatesSkipped}`
                        );
                    }, 100);

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
        // Handle Virtual/Recurring Transactions
        if (String(id).startsWith('virtual-')) {
            if (confirm("This is a Recurring Fixed Expense plan. deleting it here will remove the rule for ALL months.\n\nAre you sure?")) {
                const parts = String(id).split('-'); // virtual-YYYY-MM-{id}
                // virtual (0), YYYY (1), MM (2) - so actual ID starts at 3
                const originalId = parts.slice(3).join('-');
                setRecurringExpenses(prev => prev.filter(item => item.id !== originalId));
            }
            return;
        }

        // Handle Normal Transactions
        if (confirm("Are you sure you want to delete this transaction?")) {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        }
    };

    // 3. Prepare Chart Data
    // 3. Performance Chart Data (Derived from Ledger)
    // ---------------------------------------------
    // 3. Performance Chart Data (Derived from Ledger)
    // ---------------------------------------------
    const incomeExpenseData = useMemo(() => {
        if (monthlyLedger.length === 0) return [];

        return monthlyLedger.map(row => ({
            name: row.monthKey,
            Income: row.plannedIncome,
            Expenses: row.totalExpenses
        }));
    }, [monthlyLedger]);

    const categoryData = Object.values(
        activeTransactionsSpending.reduce((acc, tx) => {
            if (!acc[tx.category]) {
                acc[tx.category] = { name: tx.category, value: 0 };
            }
            const amt = parseAmount(tx.amount);
            if (tx.kind === "refund") {
                // subtract refunds from the category
                acc[tx.category].value -= Math.abs(amt);
            } else if (tx.kind === "expense") {
                acc[tx.category].value += Math.abs(amt);
            }
            return acc;
        }, {})
    ).sort((a, b) => b.value - a.value);

    // 4. Render Content
    const renderContent = () => {
        if (currentTab === "overview_v2") {
            return (
                <OverviewV2
                    netWorth={netWorth}
                    healthScore={healthScore}
                    cashflow={netCashflow}
                    incomeExpenseData={incomeExpenseData}
                    handleNavigate={setCurrentTab}
                    transactions={transactions}
                    debts={debts}
                    activeMonth={activePeriodKey}
                    setActiveMonth={setActivePeriodKey}
                    availableMonths={[...new Set(transactions.map(t => getPeriodKey(t)))].filter(Boolean).sort().reverse()} // Pass unique periods
                />
            );
        }

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
                    incomeHistory={incomeHistory}
                    onUpdateIncomeHistory={setIncomeHistory}
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
                <RelocationCommandCenter
                    relocation={relocation}
                    setRelocation={setRelocation}
                    debts={debts}
                    transactions={transactions}
                    income={income}
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
                        <div className="flex gap-2 items-center">
                            {/* Month Selector for Transactions Tab */}
                            <div className="relative mr-4">
                                <select
                                    value={activePeriodKey}
                                    onChange={(e) => setActivePeriodKey(e.target.value)}
                                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-3 pr-8 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                                >
                                    {[...new Set(transactions.map(t => getPeriodKey(t)))].filter(Boolean).sort().reverse().map(m => (
                                        <option key={m} value={m}>{m} {m === new Date().toISOString().substring(0, 7) ? '(Current)' : ''}</option>
                                    ))}
                                    {!transactions.some(t => getPeriodKey(t) === activePeriodKey) && activePeriodKey && (
                                        <option value={activePeriodKey}>{activePeriodKey}</option>
                                    )}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <Layers className="w-4 h-4" />
                                </div>
                            </div>
                            <button
                                onClick={reapplyCategorization}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                title="Rescan uncategorized transactions only (preserves manual categories)"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Rescan Categories
                            </button>
                            <button
                                onClick={forceReapplyCategorization}
                                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                title="⚠️ Overwrites ALL categories including manual ones"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Force Rescan
                            </button>
                            <button
                                onClick={() => setIsRecurringModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                <Calendar className="w-4 h-4 mr-2" /> Manage Fixed
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

                    {/* Search Box */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search transactions... (try: cat:groceries, amt>100, date:2026-01)"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg
                                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Search Results Info */}
                    {searchQuery && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {filteredTransactions.length === 0 ? (
                                    <span className="font-medium">No transactions found matching "{searchQuery}"</span>
                                ) : (
                                    <>
                                        Found <span className="font-bold text-blue-600 dark:text-blue-400">{filteredTransactions.length}</span> transaction{filteredTransactions.length !== 1 ? 's' : ''} matching "{searchQuery}"
                                        {filteredTransactions.length !== transactions.length && (
                                            <span className="text-gray-500 dark:text-gray-400"> (of {transactions.length} total)</span>
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Accounting Sanity Check (moved from footer) */}
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded text-xs dark:bg-gray-800 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Accounting Check</h4>
                        <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400">
                            <div>
                                <span className="block text-gray-400">Purchases (Gross)</span>
                                <span className="font-mono">${accountingTotals.grossSpend.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400">Refunds</span>
                                <span className="font-mono text-red-500">-${accountingTotals.refundCredits.toLocaleString()}</span>
                            </div>
                            <div className="border-l pl-4 border-gray-300 dark:border-gray-600">
                                <span className="block text-gray-400">Net Spend</span>
                                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">${netSpend.toLocaleString()}</span>
                            </div>
                            <div className="border-l pl-4 border-gray-300 dark:border-gray-600">
                                <span className="block text-gray-400">Card Payments</span>
                                <span className="font-mono">${accountingTotals.payments.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400">Other Transfers</span>
                                <span className="font-mono">${accountingTotals.transfers.toLocaleString()}</span>
                            </div>
                        </div>
                        {/* Warning: If Transfers exist but Purchases are suspiciously low (e.g. just imported payments but not spend) */}
                        {(accountingTotals.payments > 1000 && accountingTotals.grossSpend < 200) && (
                            <div className="mt-2 text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                                ⚠️ High card payments but low purchases. Did you import the Credit Card statement itself?
                            </div>
                        )}
                    </div>

                    <TransactionList
                        transactions={filteredTransactions}
                        onDelete={handleDeleteTransaction}
                        onEdit={handleEditClick}
                        groupByCategory={true}
                        hideSearch={true}
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
                    transactions={activeTransactionsAll}
                    income={income}
                    debts={debts}
                    month={new Date().getMonth()}
                />

                {/* Cashflow Settings Toggle */}
                <div className="mb-4 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Include Transfers in Spending
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({advancedSettings.includeTransfersInSpending ? 'Included' : 'Excluded'})
                        </span>
                    </div>
                    <button
                        onClick={() => setAdvancedSettings(prev => ({
                            ...prev,
                            includeTransfersInSpending: !prev.includeTransfersInSpending
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${advancedSettings.includeTransfersInSpending ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedSettings.includeTransfersInSpending ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <MetricCard
                        title="Planned Income"
                        value={`$${activePlannedIncome.toLocaleString()}`}
                        icon={DollarSign}
                        color="blue"
                        trend="up"
                        trendValue="Budget"
                        tooltip="Total expected earnings for the SELECTED MONTH (based on Income History)."
                    />
                    {totalInflow > 0 && (
                        <MetricCard
                            title="Actual Inflow"
                            value={`$${totalInflow.toLocaleString()}`}
                            icon={TrendingDown}
                            color="green"
                            trend={totalInflow >= totalIncome ? "up" : "down"}
                            trendValue={totalIncome > 0 ? `${((totalInflow / totalIncome) * 100).toFixed(0)}% of Plan` : 'n/a'}
                            tooltip="Actual money received from transactions (negative amounts and income types)."
                        />
                    )}
                    <MetricCard
                        title="Spending"
                        value={`$${totalOutflowSpending.toLocaleString()}`}
                        icon={Wallet}
                        color="orange"
                        trend={totalOutflowSpending > totalIncome ? "up" : "down"}
                        trendValue={advancedSettings.includeTransfersInSpending ? "with Transfers" : "excl. Transfers"}
                        tooltip={`Total spending across all categories${advancedSettings.includeTransfersInSpending ? '' : ', excluding Transfers'}. Toggle above to include/exclude transfers.`}
                    />
                    <MetricCard
                        title="Net Cashflow"
                        value={`$${netCashflow.toLocaleString()}`}
                        icon={PiggyBank}
                        color={netCashflow > 0 ? "green" : "red"}
                        trend={netCashflow > 0 ? "up" : "down"}
                        trendValue={totalInflow > 0 ? `${((netCashflow / totalInflow) * 100).toFixed(0)}% Rate` : 'n/a'}
                        tooltip="Actual Inflow minus Spending. This is your real monthly cashflow based on transactions."
                    />
                    <MetricCard
                        title="Debt Balance"
                        value={`$${debts.reduce((a, b) => a + b.currentBalance, 0).toLocaleString()}`}
                        icon={Wallet}
                        color="red"
                        trend="down"
                        trendValue="12% vs last month" // Placeholder for history comparison
                        tooltip="Net Spend = Total Purchases minus Refunds. Excludes credit card payments."
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

                {/* Wealth Trajectory Panel */}
                <WealthTrajectory wealthMetrics={wealthMetrics} />

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <IncomeExpenseChart data={incomeExpenseData} plannedIncome={activePlannedIncome} />
                    <CategoryPieChart data={categoryData} />
                </div>

                {/* Recent Transactions Preview */}
                {/* Bottom Section: Strict 12-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Row 1: Spending Intelligence (Full Width) */}
                    <div className="lg:col-span-12 w-full h-auto lg:h-[500px]">
                        <SpendingIntelligence transactions={activeTransactionsAll} />
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
                                {debts.map(debt => {
                                    const rateState = debtRateStateById[debt.id];
                                    return (
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
                                                    {rateState.rateIsSwitched ? "Effective Rate" : "Interest"}
                                                </span>
                                                <span className={`font-medium dark:text-gray-200 ${rateState.rateIsSwitched ? "text-orange-600 dark:text-orange-400 font-bold" : ""}`}>
                                                    {rateState.effectiveRatePct}%
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Monthly</span>
                                                <span className="font-medium dark:text-gray-200">
                                                    ${debt.monthlyRepayment.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

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
                                transactions={activeTransactionsAll}
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

    // Show PIN gate if no PIN is set
    if (showPinGate) {
        return <HouseholdPinGate onPinSet={handlePinSet} />;
    }

    return (
        <DashboardLayout currentTab={currentTab} onTabChange={setCurrentTab} syncStatus={syncStatus}>
            {/* Dev Mode Data Consistency Warning */}
            {dataConsistencyCheck.hasMismatch && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Data Consistency Warning (Dev Mode)
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <p>Transaction spending sum differs from ledger total expenses by <strong>${dataConsistencyCheck.delta.toFixed(2)}</strong></p>
                                <p className="mt-1">
                                    • Calculated (activeTransactionsAll): ${dataConsistencyCheck.calculatedSpending.toFixed(2)}<br />
                                    • Ledger (monthlyLedger): ${dataConsistencyCheck.ledgerExpenses.toFixed(2)}
                                </p>
                                <p className="mt-2 text-xs">
                                    <strong>Guidance:</strong> This indicates a mismatch between virtual/real transactions and ledger aggregation.
                                    Check that all transactions have correct `kind` classification and that recurring expenses are properly filtered by period range.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
            <RecurringExpensesModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                recurringExpenses={recurringExpenses}
                onUpdateExpenses={setRecurringExpenses}
            />
        </DashboardLayout>
    );
}

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import DashboardLayout from "./components/DashboardLayout";
import FinancialHealthBanner from "./components/FinancialHealthBanner";
import MetricCard from "./components/MetricCard";
import { IncomeExpenseChart, CategoryPieChart } from "./components/FinanceChart";
import TransactionModal from "./components/TransactionModal";
import PayoffPlanView from "./components/PayoffPlanView";
import TrendsView from "./components/TrendsView";
import TransactionsView from "./components/TransactionsView";
import SmartInsightsView from "./components/SmartInsightsView";
import SettingsView from "./components/SettingsView";
import ActiveLiabilities from "./components/ActiveLiabilities";
import InsightsCard from "./components/InsightsCard";
import SpendingIntelligence from "./components/SpendingIntelligence";
import DebtRiskBanner from "./components/DebtRiskBanner";
import InterestRiskPanel from "./components/InterestRiskPanel";
import ActionPlanPanel from "./components/ActionPlanPanel";
import SubscriptionIntelligence from "./components/SubscriptionIntelligence";
import WealthTrajectory from "./components/WealthTrajectory";
import RelocationCommandCenter from "./components/RelocationCommandCenter";
import OverviewV2 from "./components/OverviewV2";
import { calculateEffectiveRateState, getDebtRiskBanners, calculateInterestProjections, getCurrentRate } from "./utils/PayoffEngine";
import ManualExpensesManager from "./components/ManualExpensesManager";
import { categorizeTransaction } from "./utils/categorize";
import { calculateDetailedHealthScore } from "./utils/healthScore";
import {
    getPeriodKey,
    expandManualExpensesForMonth,
    getComputedTransactionsForMonth,
    migrateRecurringExpenseData
} from "./utils/transactionHelpers";
import { DEFAULT_OFFERS, DEFAULT_RELOCATION_SETTINGS } from "./data/relocationOffers";
import { getHouseholdState, upsertHouseholdState } from "./lib/householdApi";
import SyncIndicator from "./components/SyncIndicator";
import HouseholdPinGate from "./components/HouseholdPinGate";
import ResetDataModal from "./components/ResetDataModal";

import { DEFAULT_STATE } from "./data";
import { DollarSign, TrendingDown, PiggyBank, Wallet, Plus, RefreshCw, Layers, Calendar, Filter } from "lucide-react";

const HOUSEHOLD_KEY = "eric-rebecca"; // stable ID for your household

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

            // MIGRATION: Upgrade recurring expenses schema if needed
            // Run migration every time to catch newly added expenses with old schema
            if (data.recurringExpenses && data.recurringExpenses.length > 0) {
                const needsMigration = data.recurringExpenses.some(exp =>
                    !exp.frequency || !exp.hasOwnProperty('overrides')
                );

                if (needsMigration) {
                    console.log("Migrating recurring expenses to v2 schema...");
                    data.recurringExpenses = migrateRecurringExpenseData(data.recurringExpenses);
                }
            }

            // CLEANUP: Deduplicate categories array
            if (data.categories && Array.isArray(data.categories)) {
                data.categories = [...new Set(data.categories)];
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

// Save to localStorage: V2 format - FIXED: Added size protection
function saveStored(data) {
    try {
        const serialized = JSON.stringify(data);
        const sizeKB = new Blob([serialized]).size / 1024;

        // Warn when approaching 4MB (before 5MB limit)
        if (sizeKB > 4096) {
            console.warn(`⚠️ State size: ${sizeKB.toFixed(0)}KB approaching localStorage limit. Consider archiving old transactions.`);
        }

        // Analytics: Log size for monitoring
        if (sizeKB > 1024) {
            console.info(`📊 Storage size: ${sizeKB.toFixed(0)}KB with ${data.transactions?.length || 0} transactions`);
        }

        localStorage.setItem(STORAGE_KEY_V2, serialized);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.error('💾 LocalStorage limit exceeded!', e);
            alert('Storage limit reached! Please contact support or export your data.');
            // Keep running with current state, just don't save
        } else {
            console.error("Failed to save state:", e);
        }
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
                    await upsertHouseholdState(
                        householdPin,
                        currentState
                    );
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
                    await upsertHouseholdState(
                        householdPin,
                        payload
                    );
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

    // Automatic Migration: Fix Positive Manual Expenses (Self-Healing)
    useEffect(() => {
        if (!transactions || transactions.length === 0) return;

        let updatedCount = 0;
        const incomeCategories = ["Income", "Salary", "Wages", "Dividends", "Interest", "Refunds", "Reimbursements"];

        const fixedTransactions = transactions.map(tx => {
            // Check for candidates: Positive amount
            const amt = parseAmount(tx.amount);
            if (amt <= 0) return tx; // Already negative or zero, skip

            // Skip if source is 'amex' or 'amex_csv' (trust existing logic for imported)
            // Amex refunds are positive, so we skip them.
            if (tx.source === 'amex' || tx.source === 'amex_csv') return tx;

            // Skip if explicit interesting kind
            if (tx.kind === 'income' || tx.kind === 'refund' || tx.kind === 'payment' || tx.kind === 'transfer') return tx;

            // Check Category for Income keywords
            const cat = (tx.category || "").toLowerCase();
            const isIncomeCat = incomeCategories.some(c => cat.includes(c.toLowerCase()));
            if (isIncomeCat) return tx;

            // If we are here, it's a Positive amount, non-Amex, non-Income/Refund/Payment.
            // It is likely a Legacy Manual Expense.
            updatedCount++;
            return {
                ...tx,
                amount: -amt, // Flip to negative
                kind: 'expense' // Enforce kind
            };
        });

        if (updatedCount > 0) {
            console.log(`Creating migration: Fixing ${updatedCount} positive manual expenses...`);
            setTransactions(fixedTransactions);
        }
    }, [transactions]); // Safe: second run will find updatedCount = 0







    const [currentTab, setCurrentTab] = React.useState(() => {
        return localStorage.getItem("er_finance_active_tab") || "overview_v2";
    });

    // Save tab selection
    useEffect(() => {
        if (currentTab) {
            localStorage.setItem("er_finance_active_tab", currentTab);
        }
    }, [currentTab]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    // --- Statement-Aware Logic Helpers ---
    // Removed shadowed getPeriodKey to use imported utility

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

    // --- Classification Helpers ---
    function inferTransactionKind(tx) {
        if (tx.kind) return tx.kind;

        const amt = parseAmount(tx.amount);
        const desc = String(tx.description || tx.merchant || tx.item || "").toLowerCase();

        // Always treat explicit categories first
        if (tx.category === "Transfers") return "transfer";
        if (tx.category === "Income" || tx.type === "income") return "income";
        if (tx.category === "Debt" || tx.category === "Bills Payments") return "payment"; // FIXED: Treat debt repayments as payments

        // Payment keywords (paying the card)
        const paymentKeywords = [
            "payment", "payment thank you", "payment - thank you",
            "direct debit", "bpay", "autopay", "auto pay",
            "statement payment", "card payment", "amex payment"
        ];
        if (paymentKeywords.some(k => desc.includes(k))) return "payment";

        // FIXED: Income keyword detection - prevents salary deposits from being classified as refunds
        const incomeKeywords = [
            "salary", "payroll", "wages", "income",
            "deposit", "payment received", "transfer in", "eft credit"
        ];
        if (amt > 0 && incomeKeywords.some(k => desc.includes(k))) return "income";

        // Internal Storage Convention:
        // Expenses: NEGATIVE amounts
        // Credits/Refunds/Payments/Income: POSITIVE amounts

        // If amount is negative, it's an expense (outflow)
        if (amt < 0) return "expense";

        // If amount is positive, could be Refund, Income, or Payment.
        // We already checked Income and Payment keywords above.
        // Default to 'refund' for positive amounts that aren't clearly income/payment
        // (e.g. returns, statement credits)
        if (amt > 0) return "refund";

        // Zero amounts
        return "expense";
    }

    // Recurring Expenses Modal state
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

    // Reset Data Modal state
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    // Helper Functions for Transaction and Cashflow Calculations
    const normalizeAmount = (tx) => parseAmount(tx.amount);
    const isInflow = (tx) => tx.kind === "income";
    const isOutflow = (tx) => tx.kind === "expense";

    // --- Ledger: Single Source of Truth (Core Engine) ---
    const monthlyLedger = useMemo(() => {
        // Quick map of transactions by period for performance
        const periods = new Set();
        // Add periods from income history (may use 'periodKey' OR 'date' field)
        incomeHistory.forEach(h => {
            if (h.periodKey) periods.add(h.periodKey);
            if (h.date) periods.add(h.date);
        });
        transactions.forEach(tx => {
            const p = getPeriodKey(tx); // Now uses robust imported utility
            if (p) periods.add(p);
        });

        // Add periods covered by recurring expenses (Correctly expand ranges)
        const currentM = new Date().toISOString().substring(0, 7);
        recurringExpenses.forEach(expense => {
            if (expense.active !== false) {
                const start = expense.startMonth || expense.startPeriodKey || currentM;
                const end = expense.endMonth || expense.endPeriodKey; // Open-ended if null

                // Always add start
                if (start) periods.add(start);

                // If the active month is within the range (or after start if open-ended), ensure it's included
                // This guarantees the current view is never empty in the ledger
                if (start && activePeriodKey >= start && (!end || activePeriodKey <= end)) {
                    periods.add(activePeriodKey);
                }
            }
        });

        const ledger = Array.from(periods).filter(Boolean).map(periodKey => {
            // Get computed transactions for this period (imported + manual)
            const periodTransactions = getComputedTransactionsForMonth(
                periodKey,
                transactions,
                recurringExpenses
            ).map(tx => ({
                ...tx,
                kind: tx.kind || inferTransactionKind(tx)
            }));

            // Find income for this specific period using milestone behavior
            // Income history entries represent "from this month onwards" until the next change
            // Find the most recent income entry on or before this period
            const relevantIncomeEntries = incomeHistory
                .filter(h => {
                    const entryDate = h.periodKey || h.date;
                    return entryDate && entryDate <= periodKey;
                })
                .sort((a, b) => {
                    const dateA = a.periodKey || a.date;
                    const dateB = b.periodKey || b.date;
                    return dateB.localeCompare(dateA); // Descending order
                });
            const incomeEntry = relevantIncomeEntries[0]; // Most recent entry

            // Calculate total from salary components (incomeEntry doesn't have a 'total' field)
            const totalIncome = incomeEntry
                ? Number(incomeEntry.salaryEric || 0) + Number(incomeEntry.salaryRebecca || 0) + Number(incomeEntry.other || 0)
                : Number(income.salary || 0);

            // Calculate recurring expenses manually (already included in periodTransactions)
            const recurringSpend = recurringExpenses
                .filter(item => {
                    if (item.active === false) return false;
                    const startMonth = item.startMonth || item.startPeriodKey;
                    const endMonth = item.endMonth || item.endPeriodKey;
                    if (startMonth && periodKey < startMonth) return false;
                    if (endMonth && periodKey > endMonth) return false;
                    if (item.overrides?.[periodKey]?.disabled) return false;
                    return true;
                })
                .reduce((sum, item) => {
                    const override = item.overrides?.[periodKey];
                    const amount = override?.amount ?? item.amount;
                    return sum + parseAmount(amount);
                }, 0);

            // Calculate total debt payments for this period
            const debtPayments = debts.reduce((sum, debt) => {
                return sum + (debt.monthlyRepayment || 0);
            }, 0);

            // Calculate totals from all transactions
            // CRITICAL: Exclude transfers from expenses to prevent inflation
            const debugExpenses = periodTransactions.filter(tx => {
                // Must be an expense
                if (!isOutflow(tx)) return false;
                // Explicitly exclude transfers (even if misclassified as expense)
                if (tx.kind === 'transfer' || tx.category === 'Transfers') return false;
                return true;
            });
            const expenseSum = debugExpenses.reduce((sum, tx) => sum + normalizeAmount(tx), 0);

            if (periodKey === '2026-02') {
                console.log(`\n========== [DEBUG ${periodKey}] Ledger Calculation ==========`);
                console.log(`Total Transactions: ${periodTransactions.length}`);
                console.log(`Expense Count (after filtering): ${debugExpenses.length}`);
                console.log(`Expense Sum: ${expenseSum}`);
                console.log(`Debt Payments: ${debtPayments}`);
                console.log(`Total Expenses (abs + debt): ${Math.abs(expenseSum) + debtPayments}`);

                const transferCount = periodTransactions.filter(tx =>
                    tx.kind === 'transfer' || tx.category === 'Transfers'
                ).length;
                console.log(`Transfers Filtered Out: ${transferCount}`);

                const allExpenseLike = periodTransactions.filter(tx => isOutflow(tx));
                console.log(`\nAll Expense-Like Transactions (${allExpenseLike.length}):`);
                allExpenseLike.forEach((tx, i) => {
                    console.log(`  ${i + 1}. ${tx.description || tx.item || tx.merchant} | Amount: ${tx.amount} | Kind: ${tx.kind} | Category: ${tx.category}`);
                });

                console.log(`\nFinal Expenses After Transfer Filter (${debugExpenses.length}):`);
                debugExpenses.slice(0, 5).forEach((tx, i) => {
                    console.log(`  ${i + 1}. ${tx.description || tx.item || tx.merchant} | Amount: ${tx.amount} | Kind: ${tx.kind} | Category: ${tx.category}`);
                });
                console.log(`========================================\n`);
            }

            // Include debt payments in total expenses
            const totalExpenses = Math.abs(expenseSum) + debtPayments;

            const totalInflows = periodTransactions
                .filter(tx => isInflow(tx))
                .reduce((sum, tx) => sum + Math.abs(normalizeAmount(tx)), 0);

            const netSavings = totalIncome - totalExpenses;

            return {
                monthKey: periodKey,
                totalIncome,
                plannedIncome: totalIncome,  // Alias for compatibility
                totalExpenses,  // Now includes debt payments
                recurringSpend,
                debtPayments,  // Track separately for transparency
                netSavings,
                savingsRate: totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0,
                transactionCount: periodTransactions.length,
                // Additional fields for compatibility
                amexGrossSpend: periodTransactions
                    .filter(tx => (tx.source === "amex" || tx.source === "amex_csv") && tx.kind === "expense")
                    .reduce((sum, tx) => sum + normalizeAmount(tx), 0),
                amexRefunds: periodTransactions
                    .filter(tx => (tx.source === "amex" || tx.source === "amex_csv") && tx.kind === "refund")
                    .reduce((sum, tx) => sum + normalizeAmount(tx), 0),
                amexNetSpend: periodTransactions
                    .filter(tx => (tx.source === "amex" || tx.source === "amex_csv") && (tx.kind === "expense" || tx.kind === "payment"))
                    .reduce((sum, tx) => sum + normalizeAmount(tx), 0),
                paymentsToCard: periodTransactions
                    .filter(tx => tx.kind === "payment")
                    .reduce((sum, tx) => sum + normalizeAmount(tx), 0),
                transfers: periodTransactions
                    .filter(tx => tx.kind === "transfer")
                    .reduce((sum, tx) => sum + normalizeAmount(tx), 0),
                amexIncome: periodTransactions
                    .filter(tx => tx.kind === "income")
                    .reduce((sum, tx) => sum + normalizeAmount(tx), 0),
                netDelta: netSavings
            };
        });

        return ledger.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    }, [transactions, incomeHistory, recurringExpenses, activePeriodKey]);

    // --- Derived Transaction Sets for Active Month ---
    const activeTransactionsAll = useMemo(() => {
        // Use unified helper to get computed transactions (imported + manual)
        const computed = getComputedTransactionsForMonth(
            activePeriodKey,
            transactions,
            recurringExpenses
        );

        // Infer kind for transactions that don't have it explicitly set
        return computed.map(tx => ({
            ...tx,
            kind: tx.kind || inferTransactionKind(tx)
        })).sort((a, b) => b.date.localeCompare(a.date));
    }, [transactions, activePeriodKey, recurringExpenses]);

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

    // DEBUG: Log savings rate calculation
    if (activePeriodKey === '2026-02') {
        console.log('\n========== SAVINGS RATE CALCULATION ==========');
        console.log(`Active Period: ${activePeriodKey}`);
        console.log(`Planned Income: $${activePlannedIncome}`);
        console.log(`Total Expenses: $${totalExpenses}`);
        console.log(`Net Savings (netDelta): $${netSavings}`);
        console.log(`Calculated Savings Rate: ${savingsRate}%`);
        console.log(`Expected: (${netSavings} / ${activePlannedIncome}) * 100 = ${(netSavings / activePlannedIncome) * 100}%`);
        console.log('==============================================\n');
    }

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
        // Simple comparison:
        // ledger.totalExpenses should match (activeTransactionsSpending + ledgerDebtPayments)
        // activeTransactionsSpending already includes deduped virtual/recurring transactions
        const totalTxSpending = activeTransactionsSpending.reduce((sum, tx) => sum + Math.abs(parseAmount(tx.amount)), 0);

        const ledgerExpenses = activeLedgerEntry.totalExpenses;
        const ledgerDebtPayments = activeLedgerEntry.debtPayments || 0;

        // FAIR COMPARISON
        const calculatedTotal = totalTxSpending + ledgerDebtPayments;
        const delta = Math.abs(calculatedTotal - ledgerExpenses);

        return {
            calculatedSpending: calculatedTotal,
            ledgerExpenses,
            delta,
            hasMismatch: delta > 1
        };
    }, [activeTransactionsSpending, activeLedgerEntry.totalExpenses, activeLedgerEntry.debtPayments]);

    // Financial Health Calculations
    // Note: Debt Balances and Net Worth are effectively "Snapshot" or "Global"
    const totalIncome = activePlannedIncome; // Use month plan as basis for ratios
    const totalDebtBalance = debts.reduce((acc, d) => acc + d.currentBalance, 0);
    const totalMonthlyDebt = debts.reduce((acc, d) => acc + d.monthlyRepayment, 0);
    const dtiRatio = totalIncome > 0 ? ((totalMonthlyDebt / totalIncome) * 100).toFixed(1) : "0.0";
    const netWorth = (profile.assets || 0) - totalDebtBalance;

    // --- STABLE METRICS STRATEGY ---
    // If we are looking at the Current Month, use the Previous Month's data for Health Score & Trends
    // This prevents volatility due to partial month data (e.g. before Amex bill arrives).
    const isCurrentMonthView = activePeriodKey === new Date().toISOString().substring(0, 7);

    // Helper to get previous month key
    const getPrevMonthKey = (k) => {
        const d = new Date(k + "-01");
        d.setMonth(d.getMonth() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const periodForMetrics = isCurrentMonthView ? getPrevMonthKey(activePeriodKey) : activePeriodKey;
    const stableLedgerEntry = (monthlyLedger || []).find(l => l.monthKey === periodForMetrics) || activeLedgerEntry;

    // Recalculate core metrics based on stable period
    const stableNetSavings = stableLedgerEntry.netDelta ?? netSavings;
    const stableTotalIncome = stableLedgerEntry.plannedIncome || totalIncome;
    const stableSavingsRate = stableTotalIncome > 0 ? ((stableNetSavings / stableTotalIncome) * 100).toFixed(1) : savingsRate;
    const stableDtiRatio = stableTotalIncome > 0 ? ((totalMonthlyDebt / stableTotalIncome) * 100).toFixed(1) : dtiRatio;

    // ---------------------------------------------
    // Advanced Search Filtering
    // ---------------------------------------------



    // Advanced health score algorithm
    const { totalScore: healthScore, breakdown: healthBreakdown } = calculateDetailedHealthScore({
        savingsRate: parseFloat(stableSavingsRate),
        dtiRatio: parseFloat(stableDtiRatio),
        debts,
        netSavings: stableNetSavings,
        totalIncome: stableTotalIncome
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
    // --- Wealth Trajectory (Net Worth Over Time) ---
    const wealthMetrics = useMemo(() => {
        try {
            const totalDebt = debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0);
            const totalAssets = Number(profile.assets || 0); const baseNetWorth = totalAssets - totalDebt;

            // FIXED: Calculate interest and principal per-debt to handle mixed rates correctly
            const { monthlyInterestCost, monthlyPrincipalPaid } = debts.reduce((acc, debt) => {
                const rateState = debtRateStateById[debt.id];
                const rate = parseFloat(rateState?.effectiveRatePct || debt.interestRate || 0);
                const balance = debt.currentBalance || 0;
                const payment = debt.monthlyRepayment || 0;

                const interest = (balance * (rate / 100)) / 12;
                const principal = Math.max(payment - interest, 0);

                return {
                    monthlyInterestCost: acc.monthlyInterestCost + interest,
                    monthlyPrincipalPaid: acc.monthlyPrincipalPaid + principal
                };
            }, { monthlyInterestCost: 0, monthlyPrincipalPaid: 0 });

            const totalMonthlyDebt = debts.reduce((sum, d) => sum + (d.monthlyRepayment || 0), 0);

            // Net Worth Velocity: monthly savings + principal paydown - interest cost
            const netWorthVelocity = netSavings + monthlyPrincipalPaid;
            // So: Change in Cash = Net Savings
            // Change in Debt = -PrincipalPaid
            // Change in NW = Change in Cash + Change in Debt (where Debt is negative liability)
            //              = Net Savings + PrincipalPaid
            // This is correct: Expenses (Cash Out) - Principal (Liability Down) = Interest (Expense)
            // Alternatively: NW Change = Income - (Expenses - Principal) - Interest === Income - Interest - (Other Expenses)
            // Simplified: NW Change = Net Savings + PrincipalPaid
            // STABILITY FIX: Use stableNetSavings for velocity projection to avoid current-month dips
            const monthlyVelocity = stableNetSavings + monthlyPrincipalPaid;

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
        } catch (error) {
            console.error("Error calculating wealth metrics:", error);
            return {
                netWorth: 0,
                monthlyVelocity: 0,
                monthlyPrincipalPaid: 0,
                monthlyInterestCost: 0,
                projected6Mo: 0,
                projected1Year: 0,
                monthsToPositive: null
            };
        }
    }, [netWorth, stableNetSavings, debts, debtRateStateById, profile.assets]);

    // 2. Event Handlers
    const handleSaveTransaction = (txData) => {
        // Determine if this is a manual category assignment
        // Manual if: editing and changed category, OR new transaction with non-Uncategorized category
        const isManual = editingTransaction
            ? txData.category !== editingTransaction.category  // Changed category
            : txData.category && txData.category !== "Uncategorized";  // New with category

        // Auto-detect Kind and Sign based on Category
        let finalAmount = parseAmount(txData.amount);
        let finalKind = txData.kind || "expense"; // Default to expense

        const incomeCategories = ["Income", "Salary", "Wages", "Dividends", "Interest", "Refunds", "Reimbursements"];
        const isIncomeCat = incomeCategories.some(c => (txData.category || "").includes(c));

        if (isIncomeCat) {
            finalKind = "income";
            finalAmount = Math.abs(finalAmount); // Ensure positive for income
        } else {
            // Assume Expense for everything else
            finalKind = "expense";
            finalAmount = -Math.abs(finalAmount); // Ensure negative for expenses
        }

        // Add flags and normalized data
        const txWithFlag = {
            ...txData,
            amount: finalAmount,
            kind: finalKind,
            source: txData.source || "manual", // Default manual source for created items
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

    // AMEX CSV Import - FIXED: Better duplicate detection
    const makeTxnKey = (t) => {
        if (t.reference) return `ref:${String(t.reference).trim()}`;
        const date = String(t.date || "").trim();
        const time = t.time || "";  // Include time if available
        const amt = Number(t.amount || 0).toFixed(2);
        const desc = String(t.description || t.merchant || "").trim().toLowerCase();
        const card = t.cardMember || "";  // Include card member if available
        return `${date}|${time}|${amt}|${desc}|${card}`;
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

    // Helper: Detect AMEX statement payments
    const isAmexPayment = (desc) => {
        const s = String(desc || "").toLowerCase();
        return [
            "direct debit received - thank you",
            "payment received - thank you",
            "payment thank you",
            "direct debit received",
            "amex payment",
            "american express payment"
        ].some(k => s.includes(k));
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
                        const rawAmount = parseAmount(t.amount);
                        const description = String(t.description || t.merchant || "").trim();

                        if (!date || !description || Number.isNaN(rawAmount)) continue;

                        // Classification order (CRITICAL):
                        let kind;
                        let normalizedAmount;

                        if (isAmexPayment(description)) {
                            // 1. Payment (statement repayment)
                            kind = "payment";
                            normalizedAmount = Math.abs(rawAmount); // Always positive
                        } else if (rawAmount > 0) {
                            // 2. Expense (purchase)
                            kind = "expense";
                            normalizedAmount = -Math.abs(rawAmount); // Negative internally
                        } else if (rawAmount < 0) {
                            // 3. Refund (credit)
                            kind = "refund";
                            normalizedAmount = Math.abs(rawAmount); // Positive internally
                        } else {
                            // 4. Ignore zero amount
                            continue;
                        }

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
                            amount: normalizedAmount,
                            item: description,
                            description,
                            merchant: t.merchant || description,
                            category: category,
                            reference: t.reference || null,
                            source: "amex_csv",
                            importedAt: new Date().toISOString(),
                            isManualCategory: false,
                            kind: kind // Explicitly set during import
                        };

                        const key = makeTxnKey(normalized);
                        if (!existingKeys.has(key)) {
                            toAdd.push(normalized);
                            existingKeys.add(key);
                            imported++;
                        } else {
                            duplicatesSkipped++;
                        }
                    }

                    // Calculate import summary
                    const purchases = toAdd.filter(tx => tx.kind === "expense").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                    const refunds = toAdd.filter(tx => tx.kind === "refund").reduce((sum, tx) => sum + tx.amount, 0);
                    const payments = toAdd.filter(tx => tx.kind === "payment").reduce((sum, tx) => sum + tx.amount, 0);
                    const netSpend = purchases - refunds;

                    // Show summary alert
                    setTimeout(() => {
                        alert(
                            `✓ Import Complete!\n\n` +
                            `Imported: ${imported} transaction${imported !== 1 ? 's' : ''}\n` +
                            `Duplicates Skipped: ${duplicatesSkipped}\n\n` +
                            `--- Summary ---\n` +
                            `Purchases: $${purchases.toLocaleString()}\n` +
                            `Refunds: $${refunds.toLocaleString()}\n` +
                            `Payments: $${payments.toLocaleString()}\n` +
                            `Net Spend: $${netSpend.toLocaleString()}`
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
        if (String(id).startsWith('manual-')) {
            // Updated Logic: "Delete" for virtual/recurring means "Hide from this month"
            if (confirm("Do you want to hide this recurring expense for THIS month only?\n\n(The rule will remain active for other months)")) {
                const parts = String(id).split('-'); // manual-{baseId}-{YYYY}-{MM}
                // ID format from transactionHelpers: `manual-${expense.id}-${monthKey}`
                // monthKey is YYYY-MM. 
                // So parts: [manual, baseId, YYYY, MM]
                // Wait. ID construction: `manual-${expense.id}-${monthKey}`
                // If expense.id has dashes, this split is dangerous.

                // Let's use the object property directly if possible, but we only have ID here.
                // Re-parsing ID:
                // format: manual-{id}-{YYYY-MM}
                // But wait, expense.id is a UUID usually? 
                // transactionHelpers.js: id: `manual-${expense.id}-${monthKey}`

                // Better approach: Find the transaction object first to get the baseId and periodKey
                const tx = activeTransactionsAll.find(t => t.id === id);
                if (!tx) {
                    // Fallback parsing if we can't find it (unlikely)
                    console.error("Could not find transaction to delete:", id);
                    return;
                }

                const { baseId, periodKey } = tx;

                setRecurringExpenses(prev => prev.map(rule => {
                    if (rule.id === baseId) {
                        return {
                            ...rule,
                            overrides: {
                                ...(rule.overrides || {}),
                                [periodKey]: {
                                    ...(rule.overrides?.[periodKey] || {}),
                                    disabled: true
                                }
                            }
                        };
                    }
                    return rule;
                }));
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
            Income: Number(row.plannedIncome || 0),
            // Charts should display expenses as positive magnitudes
            Expenses: Math.abs(Number(row.totalExpenses || 0)),
        }));
    }, [monthlyLedger]);


    const categoryData = Object.values(
        activeTransactionsSpending.reduce((acc, tx) => {
            const cat = tx.category || "Other";
            if (!acc[cat]) acc[cat] = { name: cat, value: 0 };

            // activeTransactionsSpending is expenses only, so just add magnitude
            acc[cat].value += Math.abs(parseAmount(tx.amount));

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
                    income={activePlannedIncome}
                    transactions={activeTransactionsAll}
                    spending={activeTransactionsSpending}
                    debts={debts}
                    activeLedgerEntry={activeLedgerEntry}
                    month={activePeriodKey}
                    availableMonths={[...new Set(transactions.map(t => getPeriodKey(t)))].filter(Boolean).sort().reverse()} // Pass unique periods
                    monthlyLedger={monthlyLedger}
                    incomeHistory={incomeHistory}
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
            // Use last completed month for more accurate insights
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

            // Get transactions for last completed month
            const lastMonthTransactions = getComputedTransactionsForMonth(
                lastMonthKey,
                transactions,
                recurringExpenses
            ).map(tx => ({
                ...tx,
                kind: tx.kind || inferTransactionKind(tx)
            }));

            // Get income for last month from ledger
            const lastMonthLedgerEntry = getActiveLedgerRow(lastMonthKey, monthlyLedger);
            const lastMonthIncome = lastMonthLedgerEntry.plannedIncome;

            return (
                <SmartInsightsView
                    transactions={lastMonthTransactions}
                    income={{ monthly: lastMonthIncome }}
                    debts={debts}
                    periodLabel={`${lastMonth.toLocaleString('default', { month: 'long' })} ${lastMonth.getFullYear()}`}
                />
            );
        }

        if (currentTab === "transactions") {
            return (
                <TransactionsView
                    transactions={transactions}
                    activeTransactionsAll={activeTransactionsAll}
                    activePeriodKey={activePeriodKey}
                    setActivePeriodKey={setActivePeriodKey}
                    accountingTotals={accountingTotals}
                    netSpend={netSpend}
                    onDelete={handleDeleteTransaction}
                    onEdit={handleEditClick}
                    onNew={handleNewClick}
                    onImport={handleAmexImport}
                    reapplyCategorization={reapplyCategorization}
                    forceReapplyCategorization={forceReapplyCategorization}
                    onManageFixed={() => setIsRecurringModalOpen(true)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
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
                        <h2 className="text-2xl font-bold text-white">
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
                <div className="mb-4 flex items-center justify-between bg-surface rounded-lg border border-surface-highlight p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
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
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${totalInflow > 0 ? '5' : '4'} gap-6 mb-8`}>
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
                        <div className="bg-surface rounded-xl shadow-sm border border-surface-highlight p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Active Debts</h3>
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
                                            className="p-4 rounded-lg bg-surface-highlight border border-white/10"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm font-semibold text-white">{debt.name}</div>
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
                                plannedIncome={activePlannedIncome} // Pass explicit monthly income
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

    // Reset Data Handler
    // Reset Data Handler
    const handleResetData = async ({ clearLocal, clearCloud }) => {
        try {
            // Clear cloud data if requested
            if (clearCloud && householdPin) {
                // Determine if we are deleting or just resetting
                // Actually the API supports 'delete' action which wipes the row
                const { deleteHouseholdState } = await import("./lib/householdApi");
                await deleteHouseholdState(householdPin);
                console.log('✅ Cloud data cleared');
            }

            // Clear local data if requested
            if (clearLocal) {
                // Remove all localStorage keys
                localStorage.removeItem(STORAGE_KEY_V2);
                localStorage.removeItem(STORAGE_KEY_V1);
                localStorage.removeItem('er_finance_household_pin');
                localStorage.removeItem('incomeHistory');
                localStorage.removeItem('recurringExpenses');
                console.log('✅ Local data cleared');
            }

            // Reload the page to re-seed DEFAULT_STATE
            window.location.reload();
        } catch (err) {
            console.error('Reset failed:', err);
            alert('Reset failed. Please try again.');
        }
    };

    // Listen for reset modal open event from Settings
    useEffect(() => {
        const handleOpenReset = () => setIsResetModalOpen(true);
        window.addEventListener('openResetModal', handleOpenReset);
        return () => window.removeEventListener('openResetModal', handleOpenReset);
    }, []);

    // Show PIN gate if no PIN is set
    if (showPinGate) {
        return <HouseholdPinGate onPinSet={handlePinSet} />;
    }

    return (
        <>
            <div className="bg-noise" />
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
                <ManualExpensesManager
                    isOpen={isRecurringModalOpen}
                    onClose={() => setIsRecurringModalOpen(false)}
                    manualExpenses={recurringExpenses}
                    onUpdateExpenses={setRecurringExpenses}
                    categories={categories}
                    onCreateCategory={(newCategory) => {
                        if (!categories.includes(newCategory)) {
                            setCategories(prev => [...prev, newCategory]);
                        }
                    }}
                />
                <ResetDataModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={handleResetData}
                    householdPin={householdPin}
                />
            </DashboardLayout>
        </>
    );
}

export const DEMO_STATE = {
    profile: {
        householdName: "Demo User",
        statusText: "Optimizing",
        assets: 45000,
    },
    income: {
        salaryEric: 12500,
        salaryRebecca: 9200,
        other: 450,
    },
    debts: [
        {
            id: "demo_cc_1",
            name: "Platinum Rewards Card",
            monthlyRepayment: 450,
            currentBalance: 8400,
            note: "High interest - prioritize",
            dueLabel: "Due 15th",
            accent: "red",
            originalBalance: 12000,
            interestRate: 21.49,
            debtType: "Credit Card",
            promoTemporary: false,
            payoffPriorityHint: "Highest"
        },
        {
            id: "demo_car_loan",
            name: "Tesla Model Y Loan",
            monthlyRepayment: 1120,
            currentBalance: 28500,
            note: "Fixed rate loan",
            dueLabel: "Due 1st",
            accent: "blue",
            originalBalance: 65000,
            interestRate: 6.99,
            debtType: "Car Loan"
        },
        {
            id: "demo_personal",
            name: "Home Reno Loan",
            monthlyRepayment: 680,
            currentBalance: 14200,
            note: "Consolidation",
            dueLabel: "Due 20th",
            accent: "orange",
            originalBalance: 25000,
            interestRate: 11.5,
            debtType: "Personal Loan"
        }
    ],
    transactions: [
        // Housing
        { id: "demo_rent", item: "Luxury Apartment Rent", category: "Housing", amount: 5200, status: "ok" },
        { id: "demo_cleaner", item: "Weekly Cleaning", category: "Housing", amount: 480, status: "ok" },

        // Living
        { id: "demo_groceries", item: "Whole Foods Market", category: "Groceries", amount: 1450, status: "ok" },
        { id: "demo_dining", item: "Dining & Social", category: "Dining Out", amount: 1200, status: "ok" },
        { id: "demo_coffee", item: "Morning Coffee", category: "Coffee", amount: 180, status: "ok" },

        // Utilities
        { id: "demo_power", item: "Energy Bill", category: "Utilities", amount: 240, status: "ok" },
        { id: "demo_internet", item: "Gigabit Fiber", category: "Utilities", amount: 110, status: "ok" },

        // Transport
        { id: "demo_charging", item: "EV Charging", category: "Fuel and Transport", amount: 85, status: "ok" },
        { id: "demo_uber", item: "Uber/Rideshare", category: "Fuel and Transport", amount: 320, status: "ok" },

        // Subscriptions (for Intelligence demo)
        { id: "demo_sub_1", item: "Netflix 4K", category: "Subscriptions", amount: 24, status: "ok" },
        { id: "demo_sub_2", item: "Spotify Duo", category: "Subscriptions", amount: 18, status: "ok" },
        { id: "demo_sub_3", item: "Adobe Creative Cloud", category: "Subscriptions", amount: 89, status: "ok" },
        { id: "demo_sub_4", item: "ChatGPT Plus", category: "Subscriptions", amount: 33, status: "ok" },
        { id: "demo_sub_5", item: "Gym Membership", category: "Health", amount: 160, status: "ok" },

        // Shopping & Discretionary
        { id: "demo_shopping", item: "Amazon Purchases", category: "Shopping", amount: 650, status: "ok" },
        { id: "demo_tech", item: "Tech Gadgets", category: "Shopping", amount: 400, status: "ok" },
        { id: "demo_travel", item: "Weekend Getaways", category: "Travel", amount: 800, status: "ok" },
    ],
    relocation: {
        offers: [
            {
                id: 'sydney',
                name: 'Current (Sydney)',
                country: 'Australia',
                currency: 'AUD',
                netMonthlyPayLocal: 12500 + 9200, // Combined net
                // ... populate other baseline fields
                housingMonthlyLocal: 5200,
                utilitiesMonthlyLocal: 350,
                isBaseline: true
            },
            {
                id: 'dubai_offer',
                name: 'Tech Lead - Dubai',
                country: 'United Arab Emirates',
                currency: 'AED',
                netMonthlyPayLocal: 45000,
                housingIncluded: true,
                annualBonusLocal: 80000,
                benefits: ['Housing Covered', 'Schooling Allowance', 'Business Class Flights'],
                risks: ['Career Stagnation Risk', 'Heat'],
            },
            {
                id: 'london_offer',
                name: 'VP Engineering - London',
                country: 'United Kingdom',
                currency: 'GBP',
                netMonthlyPayLocal: 8200,
                housingIncluded: false,
                housingMonthlyLocal: 3500,
                benefits: ['Global Exposure', 'Stock Options'],
                risks: ['High Cost of Living', 'Taxes'],
            }
        ],
        assumptions: {
            audToUsd: 0.65,
            audToAed: 2.4,
            audToGbp: 0.52,
            inflationRate: 3.5,
        },
        selectedOfferIds: ['sydney', 'dubai_offer', 'london_offer'],
        baselineId: 'sydney',
        primaryOfferId: 'dubai_offer'
    },
    advancedSettings: {
        includeTransfersInSpending: false,
        aiInsights: true,         // Enable AI for demo
        interestCostSimulator: true, // Enable simulator for demo
        payoffByDate: true,       // Enable payoff goals
        alertSimulation: true     // Show alerts in settings
    },
    // Mock History for Charts
    incomeHistory: [
        { id: 'hist_1', date: '2023-01', salaryEric: 10500, salaryRebecca: 8000, other: 0 },
        { id: 'hist_2', date: '2024-01', salaryEric: 11500, salaryRebecca: 8500, other: 200 },
        { id: 'hist_3', date: '2025-01', salaryEric: 12500, salaryRebecca: 9200, other: 450 }
    ],
    activePeriodKey: new Date().toISOString().substring(0, 7)
};

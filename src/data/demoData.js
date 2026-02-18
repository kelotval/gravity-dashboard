export const DEMO_STATE = {
    profile: {
        householdName: "Sydney Couple",
        location: "Sydney, NSW",
        householdType: "Dual Income Couple",
        statusText: "Optimizing",
        assets: 65000,
        grossAnnualIncome: 230000,
        netMonthlyIncome: 14500,
        rent: 4200,
        children: 0
    },
    income: {
        salaryEric: 8200,    // Split to match ~14.5k net
        salaryRebecca: 6300,
        other: 0,
    },
    // 2. Realistic Debts (Structured)
    debts: [
        {
            id: "car-loan-1",
            name: "Car Loan – 2024 SUV",
            debtType: "Car Loan",
            type: "secured",
            originalBalance: 52000,
            currentBalance: 38400, // Remaining
            interestRate: 8.49,
            monthlyRepayment: 1350,
            termRemainingMonths: 36,
            residualValue: 0,
            riskLevel: "medium", // Initial hint, will be computed dynamically
            accent: "blue",
            dueLabel: "Due 15th"
        },
        {
            id: "cc-1",
            name: "Westpac Credit Card",
            debtType: "Credit Card",
            type: "credit-card",
            originalBalance: 10000,
            currentBalance: 7800,
            interestRate: 19.99,
            monthlyRepayment: 260, // Minimum
            riskLevel: "high",
            accent: "red",
            dueLabel: "Due 21st"
        },
        {
            id: "cc-balance-transfer",
            name: "Balance Transfer Card",
            debtType: "Credit Card",
            type: "credit-card",
            originalBalance: 5000,
            currentBalance: 4500,
            interestRate: 0,
            promoEndDate: "2026-06-01", // Moved closer for visibility
            futureRates: [{ date: "2026-06-01", rate: 21.99 }],
            monthlyRepayment: 300,
            riskLevel: "upcoming-risk",
            accent: "orange",
            dueLabel: "Due 1st"
        },
        {
            id: "bnpl",
            name: "Afterpay",
            debtType: "BNPL",
            type: "bnpl",
            originalBalance: 1500,
            currentBalance: 1200,
            interestRate: 0,
            monthlyRepayment: 200,
            termRemainingMonths: 6,
            riskLevel: "low",
            accent: "green",
            dueLabel: "Weekly"
        }
    ],
    // 3. Savings Goals
    savings: [
        {
            id: "emergency",
            name: "Emergency Fund",
            current: 6500,
            target: 20000,
            icon: "shield"
        },
        {
            id: "travel",
            name: "Travel Fund",
            current: 3200,
            target: 10000,
            icon: "plane"
        },
        {
            id: "home-deposit",
            name: "Home Deposit",
            current: 42000,
            target: 180000,
            icon: "home"
        }
    ],
    // 4. Realistic Transactions (Surplus ~1500)
    // Income 14500 - Rent 4200 - Debt ~2110 = ~8190 Remainder for Living
    // Expenses needs to be ~6690 to leave 1500 surplus.
    transactions: [
        // Housing (Fixed)
        { id: "tx_rent", date: `${new Date().toISOString().substring(0, 7)}-01`, item: "Rent - Sydney Apt", category: "Housing", amount: 4200, status: "ok" },

        // Utilities & Bills
        { id: "tx_agl", date: `${new Date().toISOString().substring(0, 7)}-05`, item: "AGL Electricity", category: "Utilities", amount: 320, status: "ok" },
        { id: "tx_telstra", date: `${new Date().toISOString().substring(0, 7)}-08`, item: "Telstra NBN", category: "Utilities", amount: 99, status: "ok" },
        { id: "tx_mobile", date: `${new Date().toISOString().substring(0, 7)}-12`, item: "Vodafone Mobile", category: "Utilities", amount: 65, status: "ok" },
        { id: "tx_ins", date: `${new Date().toISOString().substring(0, 7)}-15`, item: "Allianz Car Insurance", category: "Fees and Interest", amount: 145, status: "ok" },

        // Groceries (Weeklyish)
        { id: "tx_woolies_1", date: `${new Date().toISOString().substring(0, 7)}-02`, item: "Woolworths bondi", category: "Groceries", amount: 245, status: "ok" },
        { id: "tx_coles_1", date: `${new Date().toISOString().substring(0, 7)}-09`, item: "Coles Broadway", category: "Groceries", amount: 180, status: "ok" },
        { id: "tx_woolies_2", date: `${new Date().toISOString().substring(0, 7)}-16`, item: "Woolworths Metro", category: "Groceries", amount: 65, status: "ok" },
        { id: "tx_butcher", date: `${new Date().toISOString().substring(0, 7)}-23`, item: "Craig's Butchery", category: "Groceries", amount: 120, status: "ok" },
        { id: "tx_hellofresh", date: `${new Date().toISOString().substring(0, 7)}-10`, item: "HelloFresh Box", category: "Groceries", amount: 115, status: "ok" },

        // Transport
        { id: "tx_fuel_1", date: `${new Date().toISOString().substring(0, 7)}-04`, item: "Ampol Service Station", category: "Fuel and Transport", amount: 95, status: "ok" },
        { id: "tx_uber_1", date: `${new Date().toISOString().substring(0, 7)}-11`, item: "Uber Trip", category: "Fuel and Transport", amount: 42, status: "ok" },
        { id: "tx_opal", date: `${new Date().toISOString().substring(0, 7)}-18`, item: "Transport NSW Opal", category: "Fuel and Transport", amount: 150, status: "ok" },

        // Lifestyle & Dining
        { id: "tx_uber_eats", date: `${new Date().toISOString().substring(0, 7)}-06`, item: "Uber Eats", category: "Dining Out", amount: 85, status: "ok" },
        { id: "tx_cafe_1", date: `${new Date().toISOString().substring(0, 7)}-03`, item: "Sonoma Bakery", category: "Coffee", amount: 24, status: "ok" },
        { id: "tx_cafe_2", date: `${new Date().toISOString().substring(0, 7)}-14`, item: "Campos Coffee", category: "Coffee", amount: 18, status: "ok" },
        { id: "tx_dinner", date: `${new Date().toISOString().substring(0, 7)}-20`, item: "Chin Chin Sydney", category: "Dining Out", amount: 240, status: "ok" },
        { id: "tx_drinks", date: `${new Date().toISOString().substring(0, 7)}-21`, item: "The Baxter Inn", category: "Dining Out", amount: 120, status: "ok" },

        // Subscriptions
        { id: "tx_netflix", date: `${new Date().toISOString().substring(0, 7)}-01`, item: "Netflix Standard", category: "Subscriptions", amount: 18, status: "ok" },
        { id: "tx_spotify", date: `${new Date().toISOString().substring(0, 7)}-02`, item: "Spotify Duo", category: "Subscriptions", amount: 21, status: "ok" },
        { id: "tx_gym", date: `${new Date().toISOString().substring(0, 7)}-03`, item: "Fitness First", category: "Health", amount: 150, status: "ok" },
        { id: "tx_apple", date: `${new Date().toISOString().substring(0, 7)}-05`, item: "Apple One Family", category: "Subscriptions", amount: 45, status: "ok" },
        { id: "tx_kayo", date: `${new Date().toISOString().substring(0, 7)}-10`, item: "Kayo Sports", category: "Subscriptions", amount: 35, status: "ok" },
        { id: "tx_stan", date: `${new Date().toISOString().substring(0, 7)}-12`, item: "Stan Streaming", category: "Subscriptions", amount: 22, status: "ok" },
        { id: "tx_disney", date: `${new Date().toISOString().substring(0, 7)}-15`, item: "Disney+ Premium", category: "Subscriptions", amount: 18, status: "ok" },
        { id: "tx_prime", date: `${new Date().toISOString().substring(0, 7)}-16`, item: "Amazon Prime", category: "Subscriptions", amount: 10, status: "ok" },
        { id: "tx_ms365", date: `${new Date().toISOString().substring(0, 7)}-18`, item: "Microsoft 365", category: "Subscriptions", amount: 14, status: "ok" },
        { id: "tx_chatgpt", date: `${new Date().toISOString().substring(0, 7)}-20`, item: "ChatGPT Plus", category: "Subscriptions", amount: 33, status: "ok" },

        // Shopping
        { id: "tx_bunnings", date: `${new Date().toISOString().substring(0, 7)}-07`, item: "Bunnings Warehouse", category: "Home and Garden", amount: 185, status: "ok" },
        { id: "tx_kmart", date: `${new Date().toISOString().substring(0, 7)}-13`, item: "Kmart", category: "Shopping", amount: 65, status: "ok" },
        { id: "tx_amazon", date: `${new Date().toISOString().substring(0, 7)}-19`, item: "Amazon Marketplace", category: "Shopping", amount: 120, status: "ok" }
        // Total Estimated Expenses here: ~6600
        // Surplus: ~1500 (plus minus)
    ],
    // 7. Relocation / Sandbox Defaults
    relocation: {
        assumptions: {
            fxRateAedToAud: 0.41,
            fxRateSarToAud: 0.40,
            fxRateUsdToAud: 1.50,
            costOfLivingMultiplier: {
                sydney: 1.0,
                new_york: 1.6, // Added for NY demo
                dubai: 0.85,
                aramco: 0.70
            },
            includeDebtsInScenario: true,
            includeTransfersInSpending: false,
            includeRentInBaseline: true,
            baselineRentAud: 4200,
            baselineNetMonthlyAud: 14500,
            partnerIncomeEnabled: false,
            partnerNetMonthlyAud: 0,
            partnerStopsWorking: false,
            discretionaryAdjustmentAud: 0,
            emergencyFundTargetAud: 20000,
            monthsToFund: 6,
            investmentReturnPctAnnual: 7.0,
            volatilityRisk: {
                sydney: 1,
                new_york: 4,
                dubai: 5,
                aramco: 7
            }
        },
        offers: [
            {
                id: 'sydney',
                name: 'Current (Sydney)',
                country: 'Australia',
                currency: 'AUD',
                netMonthlyPayLocal: 14500,
                housingMonthlyLocal: 4200,
                isBaseline: true
            },
            {
                id: 'new_york',
                name: 'Tech Lead - New York',
                country: 'United States',
                currency: 'USD',
                netMonthlyPayLocal: 14000,
                housingMonthlyLocal: 5500,
                benefits: ['Health Insurance', 'Stock Options'],
                risks: ['High Cost of Living', 'At-Will Employment']
            }
        ],
        baselineId: 'sydney',
        primaryOfferId: 'new_york',
        selectedOfferIds: ['sydney', 'new_york']
    },
    advancedSettings: {
        includeTransfersInSpending: false,
        aiInsights: true,
        interestCostSimulator: true,
        payoffByDate: true,
        alertSimulation: true
    },
    activePeriodKey: new Date().toISOString().substring(0, 7)
};

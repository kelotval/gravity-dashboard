export const DEFAULT_STATE = {
    profile: {
        householdName: "Eric & Rebecca",
        statusText: "On Track",
        assets: 125000,
    },
    income: {
        salaryEric: 8524,
        salaryRebecca: 5936,
        other: 0,
    },
    debts: [
        {
            id: "citibank",
            name: "Citibank Credit Card",
            monthlyRepayment: 1630,
            currentBalance: 1758,
            note: "Interest Free ends 19/01/2026",
            dueLabel: "Due Monthly",
            accent: "orange",
            originalBalance: 2500,
        },
        {
            id: "kogan",
            name: "Kogan Credit Card",
            monthlyRepayment: 1530,
            currentBalance: 1581,
            note: "9.99% Interest",
            dueLabel: "Due Monthly",
            accent: "red",
            originalBalance: 2000,
        },
        {
            id: "bankwest",
            name: "Bankwest Credit Card",
            monthlyRepayment: 110,
            currentBalance: 5434,
            note: "Standard Variable Rate",
            dueLabel: "Due Monthly",
            accent: "orange",
            originalBalance: 6000,
        },
        {
            id: "kia",
            name: "Kia Sportage Loan",
            monthlyRepayment: 1475,
            currentBalance: 35000,
            note: "Loan Active",
            dueLabel: "Due Monthly",
            accent: "blue",
            originalBalance: 38000,
        },
    ],
    transactions: [
        // Housing
        { id: "rent", item: "Rent", category: "Housing", amount: 4333, status: "ok" },
        { id: "lawnmower", item: "Lawnmower", category: "Housing", amount: 170, status: "ok" },

        // Debt
        { id: "citibankRepay", item: "Citibank Repayment", category: "Debt", amount: 1758, status: "ok" },
        { id: "koganRepay", item: "Kogan Repayment", category: "Debt", amount: 1581, status: "ok" },
        { id: "kiaRepay", item: "Kia Repayment", category: "Debt", amount: 1475, status: "ok" },

        // Food
        { id: "groceries", item: "Groceries", category: "Food", amount: 800, status: "ok" },
        { id: "goingOut", item: "Going Out", category: "Food", amount: 400, status: "ok" },
        { id: "coffeeSubs", item: "Coffee Subs", category: "Food", amount: 67, status: "ok" },

        // Utilities
        { id: "electricity", item: "Electricity", category: "Utilities", amount: 320, status: "ok" },
        { id: "gas", item: "Gas", category: "Utilities", amount: 80, status: "ok" },
        { id: "water", item: "Water", category: "Utilities", amount: 28, status: "ok" },
        { id: "internet", item: "Internet Aussie Broadband", category: "Utilities", amount: 129, status: "ok" },

        // Health
        { id: "healthEric", item: "Health Ins (Eric)", category: "Health", amount: 110, status: "ok" },
        { id: "healthBecky", item: "Health Ins (Becky)", category: "Health", amount: 263, status: "ok" },

        // Transport
        { id: "commuting", item: "Commuting", category: "Transport", amount: 216, status: "ok" },
        { id: "mobileEric", item: "Mobile (Eric)", category: "Transport", amount: 72, status: "ok" },
        { id: "mobileBecky", item: "Mobile (Rebecca)", category: "Transport", amount: 101, status: "ok" },

        // Personal
        { id: "barber", item: "Barber", category: "Personal", amount: 75, status: "ok" },

        // Subscriptions
        { id: "netflix", item: "Netflix", category: "Subscriptions", amount: 22, status: "ok" },
        { id: "paramount", item: "Paramount Plus", category: "Subscriptions", amount: 9, status: "ok" },
        { id: "youtube", item: "YouTube", category: "Subscriptions", amount: 17, status: "ok" },
        { id: "amazonPrime", item: "Amazon Prime", category: "Subscriptions", amount: 23, status: "ok" },
        { id: "uberOne", item: "Uber One", category: "Subscriptions", amount: 10, status: "ok" },
        { id: "chatgpt", item: "ChatGPT (Eric & Bec)", category: "Subscriptions", amount: 70, status: "ok" },
        { id: "gStorage", item: "Google storage", category: "Subscriptions", amount: 15, status: "ok" },
        { id: "appleOne", item: "Apple One", category: "Subscriptions", amount: 28.95, status: "ok" },
        { id: "appleStorage", item: "Apple Storage", category: "Subscriptions", amount: 15, status: "ok" },
        { id: "spotify", item: "Spotify (Rebecca)", category: "Subscriptions", amount: 13, status: "ok" },
        { id: "msOffice", item: "Microsoft Office (Rebecca)", category: "Subscriptions", amount: 13, status: "ok" },
        { id: "appleCare", item: "Apple care", category: "Subscriptions", amount: 14, status: "ok" },
    ],
};


const allSubTransactions = [
    { description: "Paypal *Netflix", amount: -15.00 },
    { description: "Spotify PTY LTD", amount: -12.00 },
    { description: "Unknown Subscription", amount: -10.00 }
];

const normalizeMerchantName = (name) => {
    const raw = (name || "Unknown").trim();
    let n = raw.toLowerCase();
    n = n.replace(/^(paypal|sq \*|sp \*|apple\.com\/bill|google \*|dd \d+ |direct debit )/g, "");
    n = n.replace(/\*.*$/, "");
    n = n.replace(/ pty ltd/g, "").replace(/ ltd/g, "");
    n = n.replace(/[^a-z0-9 ]/g, " ").trim();
    if (!n) return raw;
    return n.replace(/\b\w/g, c => c.toUpperCase());
};

// BUGGY IMPLEMENTATION
const getAverageCost_Buggy = (merchantName) => {
    // Fails because t.description is "Spotify PTY LTD" but merchantName is "Spotify"
    const txs = allSubTransactions.filter(t => (t.description || "Unknown") === merchantName);
    if (!txs.length) return 0;
    const total = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return total / Math.max(1, txs.length);
};

// FIXED IMPLEMENTATION
const getAverageCost_Fixed = (merchantName) => {
    const txs = allSubTransactions.filter(t => {
        const rawName = t.description || t.item || t.category || "Unknown";
        // Normalize the transaction description to match the key
        return normalizeMerchantName(rawName) === merchantName;
    });
    if (!txs.length) return 0;
    const total = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return total / Math.max(1, txs.length);
};

console.log("--- Reproduction Test (Spotify) ---");
const targetMerchant = "Spotify";
// normalizeMerchantName("Spotify PTY LTD") -> "Spotify"
console.log(`Target Merchant (Normalized): "${targetMerchant}"`);

const costBuggy = getAverageCost_Buggy(targetMerchant);
console.log(`Buggy Cost Calculation: ${costBuggy}`);
if (costBuggy === 0) {
    console.log("SUCCESS: Bug reproduced (Cost is 0).");
} else {
    console.log("FAILURE: Bug not reproduced.");
}

console.log("\n--- Fix Verification ---");
const costFixed = getAverageCost_Fixed(targetMerchant);
console.log(`Fixed Cost Calculation: ${costFixed}`);

if (costFixed === 12) {
    console.log("SUCCESS: Fix verified (Cost is 12).");
} else {
    console.log(`FAILURE: Fix failed (Expected 12, got ${costFixed}).`);
}

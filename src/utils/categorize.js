// src/utils/categorize.js

// High confidence matches based on your statement merchant strings.
// These are evaluated BEFORE the generic CATEGORY_RULES.
const MERCHANT_OVERRIDES = [
  // Transfers
  {
    category: "Transfers",
    keywords: ["direct debit received", "live payments"],
  },

  // Lottery / gambling
  {
    category: "Gambling & Lottery",
    keywords: ["oz lotteries"],
  },

  // Alcohol
  {
    category: "Alcohol & Bottle Shop",
    keywords: ["bws", "cellars", "tallawong cellars"],
  },

  // Travel
  {
    category: "Travel",
    keywords: ["sydney airport", "ayana", "love bali", "awp1"],
  },

  // Entertainment
  {
    category: "Entertainment",
    keywords: ["sea life", "castle hill mega"],
  },

  // Groceries
  {
    category: "Groceries",
    keywords: ["opera convenience", "our cow"],
  },

  // Coffee
  {
    category: "Coffee",
    keywords: ["silverleaf", "batch espre", "will & mike"],
  },

  // Dining out / bars
  {
    category: "Dining Out",
    keywords: ["pricha", "the fiddler", "helm bar", "criniti", "glu", "boniiik", "cabana bar", "canteen 1 elizabeth", "gyg"],
  },

  // Shopping
  {
    category: "Shopping",
    keywords: ["dymocks", "whsmith", "rock wear", "decjuba", "newsagency"],
  },

  // Career
  {
    category: "Education / Career",
    keywords: ["linkedin"],
  },

  // Subscriptions
  {
    category: "Subscriptions",
    keywords: ["wemod"],
  },

  // Health
  {
    category: "Health",
    keywords: ["coastal contacts"],
  },
];

export function categorizeTransaction(description, categoryRules = []) {
  if (!description) return "Uncategorized";
  const lower = String(description).toLowerCase();

  // 1) merchant overrides first
  for (const rule of MERCHANT_OVERRIDES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.category;
    }
  }

  // 2) generic rules second
  for (const rule of categoryRules) {
    if (rule?.keywords?.some((k) => lower.includes(String(k).toLowerCase()))) {
      return rule.category;
    }
  }

  return "Uncategorized";
}

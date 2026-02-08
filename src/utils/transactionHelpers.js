/**
 * Transaction Helper Utilities
 * 
 * Handles expansion of recurring manual expenses into monthly transactions
 * and aggregation of imported + manual transactions for calculations.
 */

/**
 * Extract period key (YYYY-MM) from transaction or date string
 */
export function getPeriodKey(txOrDate) {
    if (typeof txOrDate === 'string') {
        return txOrDate.substring(0, 7);
    }
    if (txOrDate.date) {
        return txOrDate.date.substring(0, 7);
    }
    if (txOrDate.periodKey) {
        return txOrDate.periodKey;
    }
    return null;
}

/**
 * Parse amount ensuring it's a valid number
 */
export function parseAmount(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v).trim();
    const cleaned = s.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Expand recurring manual expenses into transactions for a specific month
 * 
 * Applies:
 * - Period range filtering (startMonth, endMonth)
 * - Active status check
 * - Per-month overrides (disabled, amount, category)
 * 
 * @param {string} monthKey - YYYY-MM format
 * @param {Array} manualExpenses - Array of recurring expense definitions
 * @returns {Array} Array of transaction objects for the month
 */
export function expandManualExpensesForMonth(monthKey, manualExpenses) {
    if (!manualExpenses || manualExpenses.length === 0) {
        return [];
    }

    return manualExpenses
        .filter(expense => {
            // Global active check
            if (expense.active === false) return false;

            // Period range check
            const startMonth = expense.startMonth || expense.startPeriodKey;
            const endMonth = expense.endMonth || expense.endPeriodKey;

            if (startMonth && monthKey < startMonth) return false;
            if (endMonth && monthKey > endMonth) return false;

            // Per-month disabled override
            if (expense.overrides?.[monthKey]?.disabled) return false;

            return true;
        })
        .map(expense => {
            const override = expense.overrides?.[monthKey] || {};
            const day = expense.day || 1;

            return {
                id: `manual-${expense.id}-${monthKey}`,
                baseId: expense.id,  // Reference to recurring definition
                date: `${monthKey}-${String(day).padStart(2, '0')}`,
                periodKey: monthKey,
                description: expense.description,
                merchant: expense.description,
                item: expense.description,
                amount: -(override.amount ?? expense.amount),  // Negative for expenses
                category: override.category ?? expense.category,
                type: "expense",
                kind: "expense",
                source: "manual",
                isRecurring: true,
                isVirtual: true  // Backward compatibility flag
            };
        });
}

/**
 * Gets all computed transactions for a specific month (imported + manual)
 * 
 * @param {string} monthKey - YYYY-MM format
 * @param {Array} importedTransactions - Raw imported transactions
 * @param {Array} manualExpenses - Recurring expense definitions
 * @returns {Array} Merged and sorted transaction list
 */
export function getComputedTransactionsForMonth(monthKey, importedTransactions, manualExpenses) {
    // Filter imported transactions (including historical manual one-offs) for this month
    const realTransactions = importedTransactions
        .filter(tx => getPeriodKey(tx) === monthKey)
        .map(tx => ({
            ...tx,
            source: tx.source || "amex",
            isVirtual: false
        }));

    // Expand manual expenses for this month
    const virtualCandidates = expandManualExpensesForMonth(monthKey, manualExpenses);

    // Deduplication Logic:
    // If a "real" transaction already exists that matches a "virtual" one, 
    // we assume the user manually entered it or imported it, so we skip the virtual one.
    const dedupedVirtual = virtualCandidates.filter(virtual => {
        const isDuplicate = realTransactions.some(real => {
            // Match 1: Extract amounts (handle sign differences)
            const realAmt = Math.abs(parseAmount(real.amount));
            const virtAmt = Math.abs(parseAmount(virtual.amount));

            // Match 2: Descriptions (fuzzy match)
            const realDesc = (real.description || real.item || "").toLowerCase().trim();
            const virtDesc = (virtual.description || "").toLowerCase().trim();

            // Strict amount match (cents matter for duplicates)
            const amountMatch = Math.abs(realAmt - virtAmt) < 0.01;

            // Description match
            const descMatch = realDesc === virtDesc || realDesc.includes(virtDesc) || virtDesc.includes(realDesc);

            // Category match (as a strong fallback if amount matches exactly)
            const realCat = (real.category || "").toLowerCase().trim();
            const virtCat = (virtual.category || "").toLowerCase().trim();
            const categoryMatch = realCat === virtCat;

            // Strict checking: Amount match + (Description match OR Category match)
            // But if Amount > 100, assume it's a duplicate if amounts match perfectly (highly unlikely to be coincidence)
            if (amountMatch && realAmt > 100) {
                return true;
            }

            return amountMatch && (descMatch || categoryMatch);
        });

        // If it's a duplicate, we skip adding this virtual transaction
        return !isDuplicate;
    });

    // Merge and sort
    return [...realTransactions, ...dedupedVirtual]
        .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Generate array of month keys between start and end
 * 
 * @param {string} startMonth - YYYY-MM format
 * @param {string} endMonth - YYYY-MM format
 * @returns {Array} Array of YYYY-MM strings
 */
export function generateMonthRange(startMonth, endMonth) {
    const months = [];
    let current = startMonth;

    while (current <= endMonth) {
        months.push(current);

        // Increment month
        const [year, month] = current.split('-').map(Number);
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        current = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    }

    return months;
}

/**
 * Gets computed transactions for a date range
 * 
 * @param {string} startMonth - YYYY-MM format
 * @param {string} endMonth - YYYY-MM format
 * @param {Array} importedTransactions - Raw imported transactions
 * @param {Array} manualExpenses - Recurring expense definitions
 * @returns {Array} All transactions across the range
 */
export function getComputedTransactionsForRange(startMonth, endMonth, importedTransactions, manualExpenses) {
    const months = generateMonthRange(startMonth, endMonth);
    return months.flatMap(month =>
        getComputedTransactionsForMonth(month, importedTransactions, manualExpenses)
    );
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth() {
    return new Date().toISOString().substring(0, 7);
}

/**
 * Migrate old recurring expense schema to new format
 * 
 * Legacy format: {id, description, amount, day, category, active, startPeriodKey, endPeriodKey}
 * New format: {id, description, amount, category, frequency, startMonth, endMonth, active, overrides}
 */
export function migrateRecurringExpenseData(oldExpenses) {
    if (!oldExpenses || oldExpenses.length === 0) return [];

    return oldExpenses.map(old => {
        // If already migrated (has frequency and overrides), return as-is
        if (old.frequency && old.hasOwnProperty('overrides')) {
            return old;
        }

        // Migrate old schema to new
        return {
            id: old.id,
            description: old.description,
            amount: parseAmount(old.amount),
            day: old.day || 1,  // Preserve day field
            category: old.category === "Monthly Manual Fixed Expenses"
                ? "Manual Expenses"  // Migrate generic category to better default
                : old.category || "Manual Expenses",
            frequency: "monthly",  // Default, extensible later
            startMonth: old.startPeriodKey || old.startMonth || getCurrentMonth(),
            endMonth: old.endPeriodKey || old.endMonth || null,
            active: old.active !== false,  // Default true
            overrides: old.overrides || {}  // Preserve existing overrides if any
        };
    });
}

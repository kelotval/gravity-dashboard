/**
 * Household API - Communicates with Supabase Edge Function
 * Uses PIN-based authentication for household data access
 */

const FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;

if (!FUNCTION_URL) {
    console.warn('⚠️ VITE_SUPABASE_FUNCTION_URL not configured. Running in offline mode.');
}

/**
 * Get household state from remote
 * @param {string} pin - Household PIN
 * @returns {Promise<object|null>} - Remote state or null if not found
 */
export async function getHouseholdState(pin) {
    if (!FUNCTION_URL) {
        throw new Error('Function URL not configured');
    }

    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'get',
                pin: pin,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.state || null;
    } catch (err) {
        console.error('Failed to get household state:', err);
        throw err;
    }
}

/**
 * Upsert household state to remote
 * @param {string} pin - Household PIN
 * @param {object} state - Full application state
 * @returns {Promise<void>}
 */
export async function upsertHouseholdState(pin, state) {
    if (!FUNCTION_URL) {
        throw new Error('Function URL not configured');
    }

    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'upsert',
                pin: pin,
                state: state,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Failed to upsert household state:', err);
        throw err;
    }
}

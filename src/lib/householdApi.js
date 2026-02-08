/**
 * Household API - Communicates with Supabase Edge Function
 * Uses PIN-based authentication for household data access
 */

const FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!FUNCTION_URL) {
  console.warn('⚠️ VITE_SUPABASE_FUNCTION_URL not configured. Running in offline mode.');
}

if (!ANON_KEY) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY not configured. Cloud sync may fail.');
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
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'get',
        pin: pin,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Status: ${response.status}`, `Headers:`, [...response.headers.entries()]);
      console.error(`Body:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
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
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'upsert',
        pin: pin,
        state: state,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Status: ${response.status}`, `Headers:`, [...response.headers.entries()]);
      console.error(`Body:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to upsert household state:', err);
    throw err;
  }
}

/**
 * Delete household state from remote
 * @param {string} pin - Household PIN
 * @returns {Promise<void>}
 */
export async function deleteHouseholdState(pin) {
  if (!FUNCTION_URL) {
    throw new Error('Function URL not configured');
  }

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'delete',
        pin: pin,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Status: ${response.status}`, `Headers:`, [...response.headers.entries()]);
      console.error(`Body:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to delete household state:', err);
    throw err;
  }
}

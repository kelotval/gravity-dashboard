import { getHouseholdState, upsertHouseholdState } from '../../lib/householdApi';
import { DEFAULT_STATE } from '../../data'; // Using existing default state as fallback

const STORAGE_KEY_V2 = "er_finance_state_v2";

// Helper to load from LocalStorage
function loadLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_V2);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Failed to load local state", e);
        return null;
    }
}

// Helper to save to LocalStorage
function saveLocal(data) {
    try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save local state", e);
    }
}

export const liveProvider = {
    mode: 'live',

    // Initial Load
    async load(pin) {
        // 1. Try Local Storage first (fastest)
        const local = loadLocal();

        // 2. If PIN provided, try Cloud Sync
        if (pin) {
            try {
                const remote = await getHouseholdState(pin);
                if (remote) {
                    // Update local cache with remote truth
                    saveLocal(remote);
                    return remote;
                }
            } catch (e) {
                console.warn("Cloud sync failed, using local fallback", e);
            }
        }

        return local || DEFAULT_STATE;
    },

    // Save Action
    async save(startState, updates, pin) {
        const newState = { ...startState, ...updates };

        // 1. Save Local
        saveLocal(newState);

        // 2. Save Cloud (Fire & Forget / Optimistic)
        if (pin) {
            upsertHouseholdState(pin, newState).catch(e =>
                console.error("Background cloud save failed", e)
            );
        }

        return newState;
    },

    // Reset is not really applicable to Live same as Demo, but we could clear local
    reset: async () => {
        // No-op for safety, or clear local storage? 
        // For now, Live mode reset is handled by specific "Delete" actions in UI, not a global reset.
        console.warn("Reset not supported in Live mode via provider");
        return null;
    }
};

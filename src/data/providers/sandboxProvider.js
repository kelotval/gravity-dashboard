import { DEMO_STATE } from '../demoData';

const STORAGE_KEY_SANDBOX = "er_finance_sandbox_v1";

export const sandboxProvider = {
    mode: 'sandbox',

    async load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_SANDBOX);
            if (raw) return JSON.parse(raw);

            // First time: Seed with Demo Data
            return JSON.parse(JSON.stringify(DEMO_STATE));
        } catch (e) {
            return JSON.parse(JSON.stringify(DEMO_STATE));
        }
    },

    async save(startState, updates) {
        const newState = { ...startState, ...updates };
        try {
            localStorage.setItem(STORAGE_KEY_SANDBOX, JSON.stringify(newState));
        } catch (e) {
            console.error("Sandbox save failed", e);
        }
        return newState;
    },

    async reset() {
        // Reset Sandbox to original Demo Data
        localStorage.removeItem(STORAGE_KEY_SANDBOX);
        return JSON.parse(JSON.stringify(DEMO_STATE));
    }
};

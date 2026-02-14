import { DEMO_STATE } from '../demoData';

export const demoProvider = {
    mode: 'demo',

    async load() {
        // Always return fresh clone of Demo Data to avoid mutation issues during session
        return JSON.parse(JSON.stringify(DEMO_STATE));
    },

    async save(prevState) {
        // Demo mode is Read-Only for persistence, but we might allow local session changes 
        // that don't persist? Or strictly blocking saves?
        // Requirement: "All write operations disabled" OR "Reset available"
        // Let's allow in-memory changes for the session so UI interactions work, 
        // but they won't persist to disk/cloud.
        console.log("Demo Mode: Change simulated (not persisted)");
        return prevState;
    },

    async reset() {
        return JSON.parse(JSON.stringify(DEMO_STATE));
    }
};

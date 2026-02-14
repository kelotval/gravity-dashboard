import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { liveProvider, demoProvider, sandboxProvider } from '../data/providers';

const DataContext = createContext(null);

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

const PROVIDERS = {
    live: liveProvider,
    demo: demoProvider,
    sandbox: sandboxProvider
};

export function DataProvider({ children }) {
    // 1. Mode Management
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('er_finance_mode') || 'live';
    });

    const [householdPin, setHouseholdPin] = useState(() => {
        return localStorage.getItem('er_finance_household_pin') || null;
    });

    // 2. Data State
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [syncStatus, setSyncStatus] = useState('offline'); // synced, saving, offline, error

    // 3. Helper to get current provider
    const provider = PROVIDERS[mode] || PROVIDERS.live;

    // 4. Load Data Effect
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            setLoading(true);
            try {
                // For live mode, we might need the PIN. 
                // Providers should handle "no pin" gracefully (return local)
                const state = await provider.load(householdPin);

                if (mounted) {
                    setData(state);
                    setError(null);
                    setSyncStatus('synced');
                }
            } catch (err) {
                console.error("Data Load Error:", err);
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadData();

        return () => { mounted = false; };
    }, [mode, householdPin]); // Reload when mode or PIN changes

    // 5. Mode Switcher
    const switchMode = useCallback((newMode) => {
        if (!PROVIDERS[newMode]) return;
        setMode(newMode);
        localStorage.setItem('er_finance_mode', newMode);
    }, []);

    // 6. Action: Update Data
    // Generic update function to handle partial updates
    const updateData = useCallback(async (updates) => {
        if (!data) return;

        // Optimistic Update
        const previousData = { ...data };
        const newData = { ...data, ...updates };
        setData(newData);
        setSyncStatus('saving');

        try {
            await provider.save(previousData, updates, householdPin);
            setSyncStatus('synced');
        } catch (err) {
            console.error("Save failed", err);
            setData(previousData); // Revert
            setSyncStatus('error');
        }
    }, [data, mode, householdPin]);

    // 7. Action: Reset Data (Demo/Sandbox only)
    const resetData = useCallback(async () => {
        if (mode === 'live') return; // Safety check

        setLoading(true);
        try {
            const cleanState = await provider.reset();
            setData(cleanState);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [mode]);

    // 8. Auth / PIN Management (Live Only)
    const setPin = useCallback((pin) => {
        setHouseholdPin(pin);
        if (pin) {
            localStorage.setItem('er_finance_household_pin', pin);
        } else {
            localStorage.removeItem('er_finance_household_pin');
        }
    }, []);

    // 9. Context Value
    const value = {
        mode,
        switchMode,
        data,
        loading,
        error,
        syncStatus,
        updateData,
        resetData,
        householdPin,
        setPin,
        isDemo: mode === 'demo',
        isSandbox: mode === 'sandbox',
        isLive: mode === 'live'
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

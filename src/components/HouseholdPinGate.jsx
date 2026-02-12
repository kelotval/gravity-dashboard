import React, { useState, useEffect } from 'react';
import { Lock, Key, Trash2, RefreshCw } from 'lucide-react';

export default function HouseholdPinGate({ onPinSet }) {
    const [pin, setPin] = useState('');
    const [savedPin, setSavedPin] = useState(null);
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('er_finance_household_pin');
        if (stored) {
            setSavedPin(stored);
        } else {
            setShowInput(true);
        }
    }, []);

    const handleSetPin = () => {
        if (!pin.trim()) {
            alert('Please enter a PIN or passphrase');
            return;
        }
        localStorage.setItem('er_finance_household_pin', pin.trim());
        setSavedPin(pin.trim());
        setShowInput(false);
        onPinSet?.(pin.trim());
    };

    const handleContinue = () => {
        onPinSet?.(savedPin);
    };

    const handleChangePin = () => {
        setPin('');
        setShowInput(true);
    };

    const handleClearPin = () => {
        if (confirm('Are you sure you want to clear the household PIN? This will require re-entry.')) {
            localStorage.removeItem('er_finance_household_pin');
            setSavedPin(null);
            setPin('');
            setShowInput(true);
        }
    };

    if (!showInput && savedPin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            ER Finance
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Household PIN is set
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleContinue}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <Lock className="w-5 h-5" />
                            Continue to Dashboard
                        </button>

                        <button
                            onClick={handleChangePin}
                            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Change PIN
                        </button>

                        <button
                            onClick={handleClearPin}
                            className="w-full bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Clear PIN
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                        Household PIN protects access to your financial data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Set Household PIN
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Enter a PIN or passphrase to protect your household data
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSetPin(); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            PIN or Passphrase
                        </label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter household PIN"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <Key className="w-5 h-5" />
                        Set PIN & Continue
                    </button>
                </form>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                    This PIN will be used to sync your data securely
                </p>
            </div>
        </div>
    );
}

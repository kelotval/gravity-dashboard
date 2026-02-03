import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ResetDataModal({ isOpen, onClose, onConfirm, householdPin }) {
    const [confirmText, setConfirmText] = useState('');
    const [clearLocal, setClearLocal] = useState(true);
    const [clearCloud, setClearCloud] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    if (!isOpen) return null;

    const isConfirmed = confirmText === 'RESET';

    const handleReset = async () => {
        if (!isConfirmed) return;

        setIsResetting(true);
        try {
            await onConfirm({ clearLocal, clearCloud });
        } catch (err) {
            console.error('Reset failed:', err);
            setIsResetting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Reset Everything
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={isResetting}
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Warning */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            ⚠️ This action cannot be undone!
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                            All selected data will be permanently deleted.
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={clearLocal}
                                onChange={(e) => setClearLocal(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                disabled={isResetting}
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    Clear Local Data
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Removes all data from this device (transactions, income, settings, PIN)
                                </div>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={clearCloud}
                                onChange={(e) => setClearCloud(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                                disabled={isResetting || !householdPin}
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    Clear Cloud Data
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Deletes household data from cloud (requires PIN)
                                </div>
                                {!householdPin && (
                                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                        ⚠️ No PIN set - cloud deletion unavailable
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Confirmation Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type <span className="font-mono font-bold text-red-600 dark:text-red-400">RESET</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type RESET here"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white font-mono"
                            disabled={isResetting}
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        disabled={isResetting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={!isConfirmed || isResetting || (!clearLocal && !clearCloud)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isResetting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Reset Everything
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

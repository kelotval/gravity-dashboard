import React, { useState } from "react";
import { Plus, Trash2, X, DollarSign, Calendar } from "lucide-react";

export default function RecurringExpensesModal({ isOpen, onClose, recurringExpenses, onUpdateExpenses }) {
    const [newItem, setNewItem] = useState({
        description: "",
        amount: "",
        day: 1,
        active: true,
        startPeriodKey: "",
        endPeriodKey: ""
    });

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newItem.description || !newItem.amount) return;

        onUpdateExpenses([
            ...recurringExpenses,
            {
                id: Date.now().toString(),
                description: newItem.description,
                amount: parseFloat(newItem.amount),
                day: parseInt(newItem.day) || 1,
                category: "Monthly Manual Fixed Expenses",
                active: newItem.active !== false,  // Default true
                startPeriodKey: newItem.startPeriodKey || undefined,
                endPeriodKey: newItem.endPeriodKey || undefined
            }
        ]);
        setNewItem({
            description: "",
            amount: "",
            day: 1,
            active: true,
            startPeriodKey: "",
            endPeriodKey: ""
        });
    };

    const handleDelete = (id) => {
        onUpdateExpenses(recurringExpenses.filter(i => i.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Fixed Expenses</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">
                        Items added here will automatically appear in <strong>every month's</strong> transaction list and budget calculations.
                    </p>

                    {/* Add New Form */}
                    <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-xl dark:bg-gray-700/30">
                        <input
                            type="text"
                            placeholder="Description (e.g., Rent)"
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        />
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newItem.amount}
                                    onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                />
                            </div>
                            <div className="relative w-24">
                                <span className="absolute left-3 top-2.5 text-xs text-gray-400">Day</span>
                                <input
                                    type="number"
                                    min="1" max="31"
                                    className="w-full pl-10 pr-2 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newItem.day}
                                    onChange={e => setNewItem({ ...newItem, day: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Start Period (YYYY-MM, optional)"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newItem.startPeriodKey}
                                onChange={e => setNewItem({ ...newItem, startPeriodKey: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="End Period (YYYY-MM, optional)"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newItem.endPeriodKey}
                                onChange={e => setNewItem({ ...newItem, endPeriodKey: e.target.value })}
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={newItem.active}
                                onChange={e => setNewItem({ ...newItem, active: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>Active (appears in budget)</span>
                        </label>
                        <button
                            onClick={handleAdd}
                            className="mt-1 w-full flex items-center justify-center py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Recurring Item
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {recurringExpenses.length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-4">No fixed expenses yet.</p>
                        )}
                        {recurringExpenses.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900 text-sm dark:text-white">{item.description}</p>
                                        {item.active === false && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded dark:bg-gray-600 dark:text-gray-300">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Day {item.day} • Monthly Fixed
                                        {item.startPeriodKey && ` • From ${item.startPeriodKey}`}
                                        {item.endPeriodKey && ` • Until ${item.endPeriodKey}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900 text-sm dark:text-white">${item.amount.toLocaleString()}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Monthly Fixed Expenses</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-400 mb-6">
                        Items added here will automatically appear in <strong>every month's</strong> transaction list and budget calculations.
                    </p>

                    {/* Add New Form */}
                    <div className="flex flex-col gap-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                        <input
                            type="text"
                            placeholder="Description (e.g., Rent)"
                            className="px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        />
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    className="w-full pl-9 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    value={newItem.amount}
                                    onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                    step="0.01"
                                />
                            </div>
                            <div className="relative w-24">
                                <span className="absolute left-3 top-1 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Day</span>
                                <input
                                    type="number"
                                    min="1" max="31"
                                    className="w-full pl-3 pr-2 pt-5 pb-1 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-center font-mono"
                                    value={newItem.day}
                                    onChange={e => setNewItem({ ...newItem, day: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Start (YYYY-MM)"
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                value={newItem.startPeriodKey}
                                onChange={e => setNewItem({ ...newItem, startPeriodKey: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="End (YYYY-MM)"
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                value={newItem.endPeriodKey}
                                onChange={e => setNewItem({ ...newItem, endPeriodKey: e.target.value })}
                            />
                        </div>
                        <label className="flex items-center gap-3 text-sm text-gray-300 hover:text-white cursor-pointer group mt-1">
                            <input
                                type="checkbox"
                                checked={newItem.active}
                                onChange={e => setNewItem({ ...newItem, active: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-500 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-white/10"
                            />
                            <span className="group-hover:text-white transition-colors">Active (appears in budget)</span>
                        </label>
                        <button
                            onClick={handleAdd}
                            className="mt-2 w-full flex items-center justify-center py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-purple-900/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Recurring Item
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {recurringExpenses.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4 italic">No fixed expenses yet.</p>
                        )}
                        {recurringExpenses.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-white text-sm">{item.description}</p>
                                        {item.active === false && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700 uppercase tracking-wider">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Day {item.day} • Monthly Fixed
                                        {item.startPeriodKey && ` • From ${item.startPeriodKey}`}
                                        {item.endPeriodKey && ` • Until ${item.endPeriodKey}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white text-sm">${item.amount.toLocaleString()}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
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

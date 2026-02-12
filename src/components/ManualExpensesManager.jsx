import React, { useState } from "react";
import { Plus, Trash2, X, Edit2, Calendar, DollarSign } from "lucide-react";
import CategorySelector from "./CategorySelector";

export default function ManualExpensesManager({
    isOpen,
    onClose,
    manualExpenses,
    onUpdateExpenses,
    categories,
    onCreateCategory
}) {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "",
        startMonth: new Date().toISOString().substring(0, 7),
        endMonth: "",
        frequency: "monthly",
        active: true
    });

    if (!isOpen) return null;

    const resetForm = () => {
        setFormData({
            description: "",
            amount: "",
            category: "",
            startMonth: new Date().toISOString().substring(0, 7),
            endMonth: "",
            frequency: "monthly",
            active: true
        });
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.description || !formData.amount || !formData.category) {
            alert("Please fill in all required fields");
            return;
        }

        const expenseData = {
            id: editingId || `manual-${Date.now()}`,
            description: formData.description,
            amount: parseFloat(formData.amount),
            category: formData.category,
            startMonth: formData.startMonth,
            endMonth: formData.endMonth || null,
            frequency: "monthly",
            active: formData.active,
            overrides: {}
        };

        if (editingId) {
            // Update existing
            onUpdateExpenses(
                manualExpenses.map(ex =>
                    ex.id === editingId ? { ...ex, ...expenseData } : ex
                )
            );
        } else {
            // Add new
            onUpdateExpenses([...manualExpenses, expenseData]);
        }

        resetForm();
    };

    const handleEdit = (expense) => {
        setFormData({
            description: expense.description,
            amount: String(expense.amount),
            category: expense.category,
            startMonth: expense.startMonth || expense.startPeriodKey || "",
            endMonth: expense.endMonth || expense.endPeriodKey || "",
            frequency: expense.frequency || "monthly",
            active: expense.active !== false
        });
        setEditingId(expense.id);
    };

    const handleDelete = (id) => {
        if (confirm("Delete this manual expense?")) {
            onUpdateExpenses(manualExpenses.filter(ex => ex.id !== id));
        }
    };

    const handleToggleActive = (id) => {
        onUpdateExpenses(
            manualExpenses.map(ex =>
                ex.id === id ? { ...ex, active: !ex.active } : ex
            )
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            Manual & Recurring Expenses
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage fixed expenses that appear automatically each month
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Description */}
                            <input
                                type="text"
                                placeholder="Description (e.g., Rent, Netflix)"
                                className="px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />

                            {/* Amount */}
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    className="w-full pl-9 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div className="bg-white/5 rounded-lg border border-white/10">
                            <CategorySelector
                                value={formData.category}
                                onChange={cat => setFormData({ ...formData, category: cat })}
                                categories={categories}
                                onCreateCategory={onCreateCategory}
                            />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                                    Start Month
                                </label>
                                <input
                                    type="month"
                                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    value={formData.startMonth}
                                    onChange={e => setFormData({ ...formData, startMonth: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                                    End Month (optional)
                                </label>
                                <input
                                    type="month"
                                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    value={formData.endMonth}
                                    onChange={e => setFormData({ ...formData, endMonth: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Active Toggle  */}
                        <label className="flex items-center gap-3 text-sm text-gray-300 hover:text-white cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-500 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-white/10"
                            />
                            <span className="group-hover:text-white transition-colors">Active (appears in budget calculations)</span>
                        </label>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex-1 flex items-center justify-center py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-purple-900/20 active:scale-95"
                            >
                                {editingId ? (
                                    <><Edit2 className="w-4 h-4 mr-2" /> Update Expense</>
                                ) : (
                                    <><Plus className="w-4 h-4 mr-2" /> Add Expense</>
                                )}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 bg-black/20">
                    {manualExpenses.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No manual expenses yet.</p>
                            <p className="text-sm mt-1">Add your first recurring expense above.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {manualExpenses.map(expense => (
                                <div
                                    key={expense.id}
                                    className={`p-4 rounded-xl border transition-all ${expense.active !== false
                                        ? "bg-white/5 border-white/10 hover:border-white/20"
                                        : "bg-black/20 border-white/5 opacity-50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-white">
                                                    {expense.description}
                                                </h4>
                                                {expense.active === false && (
                                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                                <span className="font-medium text-purple-400">
                                                    {expense.category}
                                                </span>
                                                <span>
                                                    {expense.startMonth || expense.startPeriodKey || "Ongoing"}
                                                    {(expense.endMonth || expense.endPeriodKey) &&
                                                        ` → ${expense.endMonth || expense.endPeriodKey}`
                                                    }
                                                    {!expense.endMonth && !expense.endPeriodKey && " → Ongoing"}
                                                </span>
                                                <span className="text-gray-500">{expense.frequency || "monthly"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-white">
                                                ${expense.amount.toLocaleString()}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

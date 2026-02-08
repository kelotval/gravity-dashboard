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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Manual & Recurring Expenses
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage fixed expenses that appear automatically each month
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Description */}
                            <input
                                type="text"
                                placeholder="Description (e.g., Rent, Netflix)"
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />

                            {/* Amount */}
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Category Selector */}
                        <CategorySelector
                            value={formData.category}
                            onChange={cat => setFormData({ ...formData, category: cat })}
                            categories={categories}
                            onCreateCategory={onCreateCategory}
                        />

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Start Month
                                </label>
                                <input
                                    type="month"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.startMonth}
                                    onChange={e => setFormData({ ...formData, startMonth: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    End Month (optional)
                                </label>
                                <input
                                    type="month"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.endMonth}
                                    onChange={e => setFormData({ ...formData, endMonth: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Active Toggle  */}
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>Active (appears in budget calculations)</span>
                        </label>

                        {/* Submit Buttons */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 flex items-center justify-center py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
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
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {manualExpenses.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No manual expenses yet.</p>
                            <p className="text-sm mt-1">Add your first recurring expense above.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {manualExpenses.map(expense => (
                                <div
                                    key={expense.id}
                                    className={`p-4 rounded-lg border transition ${expense.active !== false
                                            ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {expense.description}
                                                </h4>
                                                {expense.active === false && (
                                                    <span className="px-2 py-0.5 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-medium text-purple-600 dark:text-purple-400">
                                                    {expense.category}
                                                </span>
                                                <span>
                                                    {expense.startMonth || expense.startPeriodKey || "Ongoing"}
                                                    {(expense.endMonth || expense.endPeriodKey) &&
                                                        ` → ${expense.endMonth || expense.endPeriodKey}`
                                                    }
                                                    {!expense.endMonth && !expense.endPeriodKey && " → Ongoing"}
                                                </span>
                                                <span>{expense.frequency || "monthly"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                ${expense.amount.toLocaleString()}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
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

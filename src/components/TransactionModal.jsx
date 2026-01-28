import React from "react";
import { X } from "lucide-react";

export default function TransactionModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = React.useState({
        item: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
    });

    // Load initial data when modal opens or initialData changes
    React.useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                item: initialData.item,
                amount: initialData.amount,
                category: initialData.category,
                date: initialData.date || new Date().toISOString().split("T")[0],
            });
        } else if (isOpen) {
            // Reset for new entry
            setFormData({
                item: "",
                amount: "",
                category: "Food",
                date: new Date().toISOString().split("T")[0],
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.item || !formData.amount) return;

        onSave({
            ...formData,
            amount: parseFloat(formData.amount),
            id: initialData ? initialData.id : Date.now().toString(),
            status: "ok"
        });

        // Close modal (reset handled by useEffect on next open)
        onClose();
    };

    const categories = ["Housing", "Food", "Utilities", "Health", "Transport", "Personal", "Subscriptions", "Debt"];
    const isEditing = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden dark:bg-gray-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isEditing ? "Edit Transaction" : "New Transaction"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 dark:text-gray-400 dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Item Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g. Groceries"
                            value={formData.item}
                            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Amount ($)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Category</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                        >
                            {isEditing ? "Save Changes" : "Add Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

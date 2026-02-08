import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";

export default function TransactionModal({ isOpen, onClose, onSave, initialData, availableCategories }) {
    const [formData, setFormData] = useState({
        item: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
    });

    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [forceShowAll, setForceShowAll] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize filtered categories
    const categoryList = availableCategories || ["Housing", "Food", "Groceries", "Utilities"];

    // Load initial data when modal opens or initialData changes
    const isEditing = !!initialData;

    useEffect(() => {
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
                category: "", // Start empty to prevent unwanted "Create Food" prompt
                date: new Date().toISOString().split("T")[0],
            });
        }
        setIsDropdownOpen(false);
        setForceShowAll(false);
    }, [isOpen, initialData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setForceShowAll(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

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

    // Filter categories based on input, unless we are forcing "show all" (e.g. via chevron)
    const filteredCategories = forceShowAll
        ? categoryList
        : categoryList.filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[1000] bg-black/50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl text-left transform transition-all dark:bg-gray-800 overflow-visible my-8 relative flex flex-col">
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
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Category</label>
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
                                        placeholder="Select or type..."
                                        value={formData.category}
                                        onChange={(e) => {
                                            setFormData({ ...formData, category: e.target.value });
                                            setIsDropdownOpen(true);
                                            setForceShowAll(false); // Typing re-enables filtering
                                        }}
                                        onFocus={(e) => {
                                            setIsDropdownOpen(true);
                                            setForceShowAll(true); // Focus ALWAYS shows all options
                                            e.target.select(); // Select all text on focus for easy replacement
                                        }}
                                        onClick={() => {
                                            if (!isDropdownOpen) {
                                                setIsDropdownOpen(true);
                                                setForceShowAll(true);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const willOpen = !isDropdownOpen;
                                            setIsDropdownOpen(willOpen);
                                            if (willOpen) {
                                                setForceShowAll(true); // Chevron click shows all categories
                                                if (inputRef.current) inputRef.current.focus();
                                            }
                                        }}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Custom Dropdown Menu */}
                                {isDropdownOpen && (
                                    <ul
                                        ref={dropdownRef}
                                        className="absolute z-[1001] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        {filteredCategories.map(cat => (
                                            <li
                                                key={cat}
                                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
                                                onClick={() => {
                                                    setFormData({ ...formData, category: cat });
                                                    setIsDropdownOpen(false);
                                                    setForceShowAll(false);
                                                }}
                                            >
                                                {cat}
                                            </li>
                                        ))}

                                        {/* Explicit "Create New" Option */}
                                        {/* Footer Logic: Smart "Create" or "New" Button */}
                                        {(() => {
                                            const normalizedInput = formData.category.trim().toLowerCase();
                                            const exactMatch = categoryList.find(c => c.toLowerCase() === normalizedInput);

                                            if (exactMatch) {
                                                // Case 1: Value matches an existing category -> Show "New Category" to allow clearing/creating new
                                                return (
                                                    <li
                                                        className="sticky bottom-0 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer text-gray-600 dark:text-gray-300 font-medium border-t border-gray-100 dark:border-gray-600 flex items-center gap-2"
                                                        onClick={() => {
                                                            setFormData({ ...formData, category: "" });
                                                            setForceShowAll(false);
                                                            setIsDropdownOpen(true);
                                                            if (inputRef.current) inputRef.current.focus();
                                                        }}
                                                    >
                                                        <span>+</span> <span>New Category...</span>
                                                    </li>
                                                );
                                            } else if (normalizedInput.length > 0) {
                                                // Case 2: Value is unique -> Show "Create 'Value'"
                                                return (
                                                    <li
                                                        className="sticky bottom-0 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 cursor-pointer text-blue-700 dark:text-blue-300 font-medium border-t border-blue-100 dark:border-blue-800"
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            setForceShowAll(false);
                                                        }}
                                                    >
                                                        + Create "{formData.category}"
                                                    </li>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {filteredCategories.length === 0 && !formData.category && (
                                            <li className="px-4 py-2 text-gray-500 dark:text-gray-400 italic">
                                                Type to create a new category...
                                            </li>
                                        )}
                                    </ul>
                                )}
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
        </div>
    );
}

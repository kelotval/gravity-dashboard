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
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen px-4 text-center flex items-center justify-center">
                <div className="bg-surface border border-white/10 rounded-xl shadow-2xl w-full max-w-xl text-left transform transition-all overflow-visible my-8 relative flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                        <h3 className="text-lg font-bold text-white">
                            {isEditing ? "Edit Transaction" : "New Transaction"}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Item Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/5 text-white placeholder-gray-500 transition-all"
                                placeholder="e.g. Groceries"
                                value={formData.item}
                                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/5 text-white placeholder-gray-500 transition-all"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/5 text-white placeholder-gray-500 pr-10 transition-all"
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
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Custom Dropdown Menu */}
                                {isDropdownOpen && (
                                    <ul
                                        ref={dropdownRef}
                                        className="absolute z-[1001] w-full mt-2 bg-[#1A1D24] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-xl"
                                    >
                                        {filteredCategories.map(cat => (
                                            <li
                                                key={cat}
                                                className="px-4 py-3 hover:bg-white/5 cursor-pointer text-gray-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
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
                                                        className="sticky bottom-0 px-4 py-3 bg-white/5 hover:bg-white/10 cursor-pointer text-gray-300 hover:text-white font-medium border-t border-white/10 flex items-center gap-2 backdrop-blur-md"
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
                                                        className="sticky bottom-0 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer text-blue-400 font-medium border-t border-white/10 backdrop-blur-md"
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
                                            <li className="px-4 py-3 text-gray-500 italic">
                                                Type to create a new category...
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-gray-300 bg-white/5 hover:bg-white/10 rounded-xl font-medium border border-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-500 rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
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

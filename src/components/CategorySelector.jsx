import React, { useState } from "react";
import { Plus, X, Tag } from "lucide-react";

/**
 * Category Selector with Inline Creation
 * 
 * Allows selecting from existing categories or creating new ones inline
 */
export default function CategorySelector({
    value,
    onChange,
    categories,
    onCreateCategory,
    className = ""
}) {
    const [showCreate, setShowCreate] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleCreate = () => {
        const trimmed = newCategoryName.trim();
        if (trimmed) {
            onCreateCategory(trimmed);
            onChange(trimmed);
            setNewCategoryName("");
            setShowCreate(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        } else if (e.key === 'Escape') {
            setShowCreate(false);
            setNewCategoryName("");
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Category Dropdown */}
            <div className="relative">
                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Create New Category */}
            {showCreate ? (
                <div className="flex gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="New category name"
                        className="flex-1 px-3 py-1.5 text-sm rounded border border-purple-300 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-purple-700 dark:text-white"
                        autoFocus
                    />
                    <button
                        onClick={handleCreate}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition"
                    >
                        Create
                    </button>
                    <button
                        onClick={() => {
                            setShowCreate(false);
                            setNewCategoryName("");
                        }}
                        className="px-2 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowCreate(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New Category</span>
                </button>
            )}
        </div>
    );
}

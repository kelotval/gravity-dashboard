import React from "react";
import { Plus, Trash2, Smartphone, Home, DollarSign } from "lucide-react";

export default function SettingsView({ profile, income, debts, onUpdateProfile, onUpdateIncome, onUpdateDebts }) {
    const [localProfile, setLocalProfile] = React.useState(profile);
    const [localIncome, setLocalIncome] = React.useState(income);

    // Debts handled individually via list

    const handleIncomeChange = (field, value) => {
        const newIncome = { ...localIncome, [field]: parseFloat(value) || 0 };
        setLocalIncome(newIncome);
        onUpdateIncome(newIncome);
    };

    const handleProfileChange = (field, value) => {
        const newProfile = { ...localProfile, [field]: value };
        setLocalProfile(newProfile);
        onUpdateProfile(newProfile);
    };

    return (
        <div className="space-y-8 pb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

            {/* Profile Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center dark:text-white">
                    <Home className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" /> Household Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Household Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={localProfile.householdName}
                            onChange={(e) => handleProfileChange("householdName", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Status Text</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={localProfile.statusText}
                            onChange={(e) => handleProfileChange("statusText", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Total Assets ($)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={localProfile.assets || 0}
                            onChange={(e) => handleProfileChange("assets", parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
            </section>

            {/* Income Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center dark:text-white">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" /> Monthly Income
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Salary (Eric)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={localIncome.salaryEric}
                            onChange={(e) => handleIncomeChange("salaryEric", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Salary (Rebecca)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={localIncome.salaryRebecca}
                            onChange={(e) => handleIncomeChange("salaryRebecca", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Other Income</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={localIncome.other}
                            onChange={(e) => handleIncomeChange("other", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Debts Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center dark:text-white">
                        <Smartphone className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" /> Active Debts
                    </h3>
                    <button
                        className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => {
                            const newDebt = {
                                id: Date.now().toString(),
                                name: "New Debt",
                                monthlyRepayment: 0,
                                currentBalance: 0,
                                note: "",
                                dueLabel: "Due Monthly",
                                accent: "blue",
                                interestRate: 0,
                            };
                            onUpdateDebts([...debts, newDebt]);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Debt
                    </button>
                </div>

                <div className="space-y-4">
                    {debts.map((debt, index) => (
                        <div key={debt.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500 block mb-1 dark:text-gray-400">Debt Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white px-2 py-1 border border-gray-300 rounded shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={debt.name}
                                        onChange={(e) => {
                                            const updated = [...debts];
                                            updated[index].name = e.target.value;
                                            onUpdateDebts(updated);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1 dark:text-gray-400">Rate (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white px-2 py-1 border border-gray-300 rounded shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={debt.interestRate || 0}
                                        onChange={(e) => {
                                            const updated = [...debts];
                                            updated[index].interestRate = parseFloat(e.target.value) || 0;
                                            onUpdateDebts(updated);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1 dark:text-gray-400">Orig. Balance</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white px-2 py-1 border border-gray-300 rounded shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={debt.originalBalance || (debt.currentBalance * 1.2)} // Default for display
                                        onChange={(e) => {
                                            const updated = [...debts];
                                            updated[index].originalBalance = parseFloat(e.target.value) || 0;
                                            onUpdateDebts(updated);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1 dark:text-gray-400">Cur. Balance</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white px-2 py-1 border border-gray-300 rounded shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={debt.currentBalance}
                                        onChange={(e) => {
                                            const updated = [...debts];
                                            updated[index].currentBalance = parseFloat(e.target.value) || 0;
                                            onUpdateDebts(updated);
                                        }}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 block mb-1 dark:text-gray-400">Monthly</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white px-2 py-1 border border-gray-300 rounded shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={debt.monthlyRepayment}
                                            onChange={(e) => {
                                                const updated = [...debts];
                                                updated[index].monthlyRepayment = parseFloat(e.target.value) || 0;
                                                onUpdateDebts(updated);
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => onUpdateDebts(debts.filter(d => d.id !== debt.id))}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

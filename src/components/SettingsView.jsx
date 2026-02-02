import React from "react";
import { Plus, Trash2, Smartphone, Home, DollarSign } from "lucide-react";

export default function SettingsView({ profile, income, debts, onUpdateProfile, onUpdateIncome, onUpdateDebts, advancedSettings, onUpdateSettings, incomeHistory, onUpdateIncomeHistory }) {
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

                {/* Income History Table */}
                <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 dark:text-white">Income History & Changes</h4>
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Effective Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Eric</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Rebecca</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {(incomeHistory || []).sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{entry.date}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">${entry.salaryEric?.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-sm text-green-600 font-medium dark:text-green-400">${entry.salaryRebecca?.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => onUpdateIncomeHistory(incomeHistory.filter(h => h.id !== entry.id))}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Add New Change UI - Simple Implementation */}
                    <div className="mt-4 flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">New Effective Month</label>
                            <input type="month" id="new-inc-date" className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Eric New</label>
                            <input type="number" id="new-inc-eric" defaultValue={income.salaryEric} className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Rebecca New</label>
                            <input type="number" id="new-inc-rebecca" defaultValue={income.salaryRebecca} className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1" />
                        </div>
                        <button
                            onClick={() => {
                                const date = document.getElementById('new-inc-date').value;
                                const eric = parseFloat(document.getElementById('new-inc-eric').value) || 0;
                                const reb = parseFloat(document.getElementById('new-inc-rebecca').value) || 0;
                                if (date) {
                                    onUpdateIncomeHistory([...(incomeHistory || []), {
                                        id: Date.now().toString(),
                                        date,
                                        salaryEric: eric,
                                        salaryRebecca: reb,
                                        other: income.other
                                    }]);
                                }
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
                        >
                            Add Change
                        </button>
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
                                <div className="col-span-full md:col-span-1 lg:col-span-2 grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Future Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-white px-2 py-1 border border-gray-300 rounded shadow-sm text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={debt.futureRates?.[0]?.date || ""}
                                            onChange={(e) => {
                                                const updated = [...debts];
                                                const newRate = parseFloat(debt.futureRates?.[0]?.rate || 0);
                                                updated[index].futureRates = [{ date: e.target.value, rate: newRate }];
                                                onUpdateDebts(updated);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Future Rate %</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white px-2 py-1 border border-gray-300 rounded shadow-sm text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={debt.futureRates?.[0]?.rate || ""}
                                            placeholder="0%"
                                            onChange={(e) => {
                                                const updated = [...debts];
                                                const newDate = debt.futureRates?.[0]?.date || "";
                                                updated[index].futureRates = [{ date: newDate, rate: parseFloat(e.target.value) }];
                                                onUpdateDebts(updated);
                                            }}
                                        />
                                    </div>
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

            {/* Advanced Features Section */}
            {
                advancedSettings && (
                    <section className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 text-white">
                        <h3 className="text-lg font-bold mb-6 flex items-center">
                            <Smartphone className="w-5 h-5 mr-2 text-purple-400" /> Advanced Laboratory
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Alert Simulation */}
                            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div>
                                    <h4 className="font-semibold text-gray-200">Push Alert Simulation</h4>
                                    <p className="text-xs text-gray-400 mt-1">Show simulated push notifications in dashboard.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.alertSimulation}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, alertSimulation: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {/* Interest Cost Simulator */}
                            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div>
                                    <h4 className="font-semibold text-gray-200">What-if Simulator</h4>
                                    <p className="text-xs text-gray-400 mt-1">Unlock "Interest Saver" modal in Payoff Plan.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.interestCostSimulator}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, interestCostSimulator: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {/* Payoff by Date */}
                            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div>
                                    <h4 className="font-semibold text-gray-200">Payoff Deadline Goals</h4>
                                    <p className="text-xs text-gray-400 mt-1">Set target dates for specific debts.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.payoffByDate}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, payoffByDate: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {/* AI Insight Cards */}
                            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div>
                                    <h4 className="font-semibold text-gray-200">AI Insight Cards</h4>
                                    <p className="text-xs text-gray-400 mt-1">Show smart explanations for recommendations.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.aiInsights}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, aiInsights: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>
                )
            }
        </div >
    );
}

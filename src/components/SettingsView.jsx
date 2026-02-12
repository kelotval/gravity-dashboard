import React from "react";
import { Plus, Trash2, Smartphone, Home, DollarSign, Settings, AlertTriangle, Save } from "lucide-react";
import { PageContainer } from "./common/PageContainer";
import { SurfaceCard } from "./common/SurfaceCard";

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
        <PageContainer
            title="Settings"
            subtitle="Manage your profile and preferences"
        >

            {/* Profile Section */}
            <SurfaceCard>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-400" /> Household Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Household Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-surface-active border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-brand transition-colors placeholder-content-tertiary"
                            value={localProfile.householdName}
                            onChange={(e) => handleProfileChange("householdName", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Status Text</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-surface-active border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-brand transition-colors placeholder-content-tertiary"
                            value={localProfile.statusText}
                            onChange={(e) => handleProfileChange("statusText", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Total Assets ($)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 bg-surface-active border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-brand transition-colors placeholder-content-tertiary"
                            value={localProfile.assets || 0}
                            onChange={(e) => handleProfileChange("assets", parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
            </SurfaceCard>

            {/* Income Section */}
            <SurfaceCard>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-emerald-400" /> Monthly Income
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Salary (Eric)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 bg-surface-active border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-brand transition-colors placeholder-content-tertiary"
                            value={localIncome.salaryEric}
                            onChange={(e) => handleIncomeChange("salaryEric", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Salary (Rebecca)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 bg-surface-active border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-brand transition-colors placeholder-content-tertiary"
                            value={localIncome.salaryRebecca}
                            onChange={(e) => handleIncomeChange("salaryRebecca", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Other Income</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 bg-surface-active border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-brand transition-colors placeholder-content-tertiary"
                            value={localIncome.other}
                            onChange={(e) => handleIncomeChange("other", e.target.value)}
                        />
                    </div>
                </div>

                {/* Income History Table */}
                <div className="mt-8 border-t border-surface-highlight pt-6">
                    <h4 className="text-sm font-semibold text-white mb-4">Income History & Changes</h4>
                    <div className="overflow-hidden rounded-lg border border-surface-highlight">
                        <table className="min-w-full divide-y divide-surface-highlight">
                            <thead className="bg-surface-active">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-content-tertiary uppercase">Effective Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-content-tertiary uppercase">Eric</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-content-tertiary uppercase">Rebecca</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-content-tertiary uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-highlight bg-transparent">
                                {(incomeHistory || []).sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
                                    <tr key={entry.id} className="hover:bg-surface-hover transition-colors">
                                        <td className="px-4 py-2 text-sm text-white">{entry.date}</td>
                                        <td className="px-4 py-2 text-sm text-content-secondary">${entry.salaryEric?.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-sm text-emerald-400 font-medium">${entry.salaryRebecca?.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => onUpdateIncomeHistory(incomeHistory.filter(h => h.id !== entry.id))}
                                                className="text-content-tertiary hover:text-red-400 transition-colors"
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
                            <label className="text-xs text-content-secondary block mb-1">New Effective Month</label>
                            <input type="month" id="new-inc-date" className="w-full text-sm bg-surface-active border border-surface-highlight rounded-lg text-white px-3 py-1.5 focus:outline-none focus:border-brand placeholder-content-tertiary" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-content-secondary block mb-1">Eric New</label>
                            <input type="number" id="new-inc-eric" defaultValue={income.salaryEric} className="w-full text-sm bg-surface-active border border-surface-highlight rounded-lg text-white px-3 py-1.5 focus:outline-none focus:border-brand placeholder-content-tertiary" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-content-secondary block mb-1">Rebecca New</label>
                            <input type="number" id="new-inc-rebecca" defaultValue={income.salaryRebecca} className="w-full text-sm bg-surface-active border border-surface-highlight rounded-lg text-white px-3 py-1.5 focus:outline-none focus:border-brand placeholder-content-tertiary" />
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
                            className="bg-brand text-white px-4 py-1.5 rounded-lg text-sm hover:bg-brand-hover transition-colors flex items-center gap-1 shadow-sm h-[34px]"
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>
                </div>
            </SurfaceCard>

            {/* Debts Section */}
            <SurfaceCard>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Smartphone className="w-5 h-5 mr-2 text-rose-400" /> Active Debts
                    </h3>
                    <button
                        className="text-sm text-brand font-medium hover:text-brand-hover flex items-center transition-colors"
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
                        <div key={debt.id} className="p-4 bg-surface-active rounded-lg border border-surface-highlight hover:border-brand/30 transition-colors">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs text-content-secondary block mb-1">Debt Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-surface border border-surface-highlight px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-brand placeholder-content-tertiary"
                                        value={debt.name}
                                        onChange={(e) => {
                                            const updated = [...debts];
                                            updated[index].name = e.target.value;
                                            onUpdateDebts(updated);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-content-secondary block mb-1">Rate (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-surface border border-surface-highlight px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-brand placeholder-content-tertiary"
                                        value={debt.interestRate || 0}
                                        onChange={(e) => {
                                            const updated = [...debts];
                                            updated[index].interestRate = parseFloat(e.target.value) || 0;
                                            onUpdateDebts(updated);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-content-secondary block mb-1">Orig. Balance</label>
                                    <input
                                        type="number"
                                        className="w-full bg-surface border border-surface-highlight px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-brand placeholder-content-tertiary"
                                        value={debt.originalBalance || (debt.currentBalance * 1.2)} // Default for display
                                        onChange={(e) => {
                                            const updated = [...debts];
                                            updated[index].originalBalance = parseFloat(e.target.value) || 0;
                                            onUpdateDebts(updated);
                                        }}
                                    />
                                </div>
                                <div className="col-span-full md:col-span-1 lg:col-span-2 grid grid-cols-2 gap-2 bg-surface p-2 rounded-lg border border-surface-highlight">
                                    <div>
                                        <label className="text-xs text-content-secondary block mb-1">Future Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-surface-active border border-surface-highlight px-2 py-1 rounded text-xs text-content-primary focus:outline-none focus:border-brand"
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
                                        <label className="text-xs text-content-secondary block mb-1">Future Rate %</label>
                                        <input
                                            type="number"
                                            className="w-full bg-surface-active border border-surface-highlight px-2 py-1 rounded text-xs text-content-primary focus:outline-none focus:border-brand placeholder-content-tertiary"
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
                                    <label className="text-xs text-content-secondary block mb-1">Cur. Balance</label>
                                    <input
                                        type="number"
                                        className="w-full bg-surface border border-surface-highlight px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-brand placeholder-content-tertiary"
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
                                        <label className="text-xs text-content-secondary block mb-1">Monthly</label>
                                        <input
                                            type="number"
                                            className="w-full bg-surface border border-surface-highlight px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-brand placeholder-content-tertiary"
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
                                        className="p-2 text-content-tertiary hover:text-red-400 rounded-lg transition-colors mb-[2px]"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SurfaceCard>

            {/* Advanced Features Section */}
            {
                advancedSettings && (
                    <SurfaceCard className="border-l-4 border-l-brand">
                        <h3 className="text-lg font-bold mb-6 flex items-center text-white">
                            <Settings className="w-5 h-5 mr-2 text-brand" /> Advanced Laboratory
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Alert Simulation */}
                            <div className="flex items-center justify-between p-4 bg-surface-active rounded-lg border border-surface-highlight">
                                <div>
                                    <h4 className="font-semibold text-white">Push Alert Simulation</h4>
                                    <p className="text-xs text-content-tertiary mt-1">Show simulated push notifications in dashboard.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.alertSimulation}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, alertSimulation: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-surface border border-surface-highlight peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>

                            {/* Interest Cost Simulator */}
                            <div className="flex items-center justify-between p-4 bg-surface-active rounded-lg border border-surface-highlight">
                                <div>
                                    <h4 className="font-semibold text-white">What-if Simulator</h4>
                                    <p className="text-xs text-content-tertiary mt-1">Unlock "Interest Saver" modal in Payoff Plan.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.interestCostSimulator}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, interestCostSimulator: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-surface border border-surface-highlight peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>

                            {/* Payoff by Date */}
                            <div className="flex items-center justify-between p-4 bg-surface-active rounded-lg border border-surface-highlight">
                                <div>
                                    <h4 className="font-semibold text-white">Payoff Deadline Goals</h4>
                                    <p className="text-xs text-content-tertiary mt-1">Set target dates for specific debts.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.payoffByDate}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, payoffByDate: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-surface border border-surface-highlight peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>

                            {/* AI Insight Cards */}
                            <div className="flex items-center justify-between p-4 bg-surface-active rounded-lg border border-surface-highlight">
                                <div>
                                    <h4 className="font-semibold text-white">AI Insight Cards</h4>
                                    <p className="text-xs text-content-tertiary mt-1">Show smart explanations for recommendations.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={advancedSettings.aiInsights}
                                        onChange={(e) => onUpdateSettings({ ...advancedSettings, aiInsights: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-surface border border-surface-highlight peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>
                        </div>
                    </SurfaceCard>
                )
            }

            {/* Reset Data Section - Danger Zone */}
            <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/20 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-red-400 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
                        </h3>
                        <p className="text-sm text-red-300/70 mt-1">
                            Permanently delete all your data. This cannot be undone.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openResetModal'))}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Trash2 className="w-4 h-4" />
                    Reset Everything
                </button>
            </div>
        </PageContainer >
    );
}

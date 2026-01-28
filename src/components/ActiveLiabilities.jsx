import React from "react";
import { Wallet, Car, AlertCircle, TrendingUp } from "lucide-react";
import kiaImage from "../assets/kia_sportage.png";

export default function ActiveLiabilities({ debts, onUpdateDebts }) {
    const totalDebt = debts.reduce((acc, debt) => acc + debt.currentBalance, 0);
    const totalMonthly = debts.reduce((acc, debt) => acc + debt.monthlyRepayment, 0);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Liabilities</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage your debt repayments and loan tracking.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Active Debt</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2 dark:text-white">${totalDebt.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                        <Wallet className="w-8 h-8" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Monthly Repayments</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2 dark:text-white">${totalMonthly.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Debt Cards Grid */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Credit Cards & Loans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debts.map((debt) => (
                    <div key={debt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700">
                        <div className={`h-2 w-full ${debt.accent === 'red' ? 'bg-red-500' :
                            debt.accent === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{debt.name}</h4>
                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">
                                    {debt.dueLabel}
                                </span>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500 dark:text-gray-400">Current Balance</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">${debt.currentBalance.toLocaleString()}</span>
                                    </div>
                                    {/* Simulated Progress Bar (Assuming somewhat arbitrary limits for visual effect if unknown) */}
                                    <div className="w-full bg-gray-100 rounded-full h-2 dark:bg-gray-700">
                                        <div
                                            className={`h-2 rounded-full ${debt.accent === 'red' ? 'bg-red-500' :
                                                debt.accent === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: '60%' }} // Static for now as visual flair
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center dark:bg-gray-700/50">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Repayment</span>
                                    <span className="font-bold text-gray-900 dark:text-white">${debt.monthlyRepayment.toLocaleString()}</span>
                                </div>

                                {debt.note && (
                                    <p className="text-xs text-gray-400 italic border-t pt-3 border-gray-100">
                                        {debt.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vehicle Section */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Assets</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-3 dark:bg-gray-800 dark:border-gray-700">
                <div className="lg:col-span-1 bg-gray-100 relative h-64 lg:h-auto">
                    <img
                        src={kiaImage}
                        alt="Kia Sportage"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
                <div className="p-8 lg:col-span-2 flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                        <Car className="w-6 h-6 text-blue-600 mr-2" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Kia Sportage 2024</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loan Balance</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">$35,000.00</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Repayment</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">$1,475.00</p>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start dark:bg-green-900/20 dark:border-green-800">
                        <AlertCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5 dark:text-green-400" />
                        <div>
                            <h5 className="font-semibold text-green-800 text-sm dark:text-green-300">Green Slip (CTP) Status: Active</h5>
                            <p className="text-sm text-green-700 mt-1 dark:text-green-400">
                                Compulsory Third Party insurance covers personal injury liability in NSW. Ensure renewal by registration due date.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

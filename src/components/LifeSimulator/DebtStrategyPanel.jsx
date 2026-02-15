import React from 'react';
import { SurfaceCard } from '../common/SurfaceCard';
import { TrendingDown, AlertTriangle } from 'lucide-react';

export default function DebtStrategyPanel({ debts, onChange }) {

    const handleDebtChange = (id, field, value) => {
        const newDebts = debts.map(d => {
            if (d.id === id) return { ...d, [field]: value };
            return d;
        });
        onChange(newDebts);
    };

    const togglePayoff = (id) => {
        const debt = debts.find(d => d.id === id);
        if (debt.currentBalance === 0) {
            // Restore (how? we lost the balance. For now toggle 'paidOff' flag if we had one, or just set to 1 dollar?)
            // Better: don't support "restore" easily without more state. 
            // Let's assume this is strictly for simulation.
            handleDebtChange(id, 'currentBalance', debt.originalBalance || 10000);
        } else {
            handleDebtChange(id, 'originalBalance', debt.currentBalance); // Save for restore
            handleDebtChange(id, 'currentBalance', 0);
        }
    };

    const totalMonthly = debts.reduce((sum, d) => sum + (d.monthlyRepayment || 0), 0);
    const totalBalance = debts.reduce((sum, d) => sum + d.currentBalance, 0);

    return (
        <SurfaceCard title="Debt Strategy Simulator" className="overflow-hidden">
            <div className="grid grid-cols-1 gap-4">
                {debts.map(debt => (
                    <div key={debt.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                                <TrendingDown className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <div className="font-semibold text-white text-sm">{debt.name}</div>
                                <div className="text-xs text-gray-400">{debt.interestRate}% Interest</div>
                            </div>
                        </div>

                        <div className="flex flex-col w-full md:w-1/3 my-4 md:my-0 px-4">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-400 font-medium">Extra Payment</span>
                                <span className="text-brand font-mono font-bold">+${debt.extraPayment || 0}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="2000" step="50"
                                value={debt.extraPayment || 0}
                                onChange={e => handleDebtChange(debt.id, 'extraPayment', Number(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-6 w-full md:w-1/3">
                            <div className="text-right">
                                <div className={`font-mono text-sm font-bold ${debt.currentBalance === 0 ? 'text-gray-600 line-through' : 'text-white'}`}>
                                    ${debt.currentBalance.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Balance</div>
                            </div>

                            <button
                                onClick={() => togglePayoff(debt.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${debt.currentBalance === 0
                                    ? 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                                    : 'bg-brand/10 border-brand/20 text-brand hover:bg-brand/20 hover:border-brand/40'}`}
                            >
                                {debt.currentBalance === 0 ? 'Undo' : 'Pay Off'}
                            </button>
                        </div>
                    </div>
                ))}

                {debts.length === 0 && (
                    <div className="text-center text-content-secondary text-sm py-4">No debts found.</div>
                )}

                <div className="mt-2 pt-4 border-t border-surface-highlight flex justify-between text-sm">
                    <div className="text-content-secondary">Total Debt Balance: <span className="text-white font-mono ml-2">${totalBalance.toLocaleString()}</span></div>
                    <div className="text-content-secondary">Monthly Commitments: <span className="text-danger font-mono ml-2">-${totalMonthly.toLocaleString()}</span></div>
                </div>
            </div>
        </SurfaceCard>
    );
}

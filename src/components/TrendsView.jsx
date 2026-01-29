import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

export default function TrendsView({ currentIncome, currentExpenses, currentDebt }) {

    // Generate 6 months of synthetic data
    const data = useMemo(() => {
        const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
        return months.map((month, index) => {
            const isLast = index === months.length - 1;

            // Random variance factor (0.9 to 1.1)
            const variance = () => 0.9 + Math.random() * 0.2;

            const income = isLast ? currentIncome : Math.round(currentIncome * variance());
            const expenses = isLast ? currentExpenses : Math.round(currentExpenses * variance());
            const debt = isLast ? currentDebt : Math.round(currentDebt * (1 + (0.02 * (5 - index)))); // Debt slightly higher in past
            const savings = income - expenses;

            return {
                name: month,
                Income: income,
                Expenses: expenses,
                Debt: debt,
                Savings: savings
            };
        });
    }, [currentIncome, currentExpenses, currentDebt]);

    const ChartCard = ({ title, dataKey, color, icon: Icon, gradientId }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={
                                    color === 'indigo' ? '#6366f1' :
                                        color === 'rose' ? '#f43f5e' :
                                            color === 'emerald' ? '#10b981' : '#f59e0b'
                                } stopOpacity={0.8} />
                                <stop offset="95%" stopColor={
                                    color === 'indigo' ? '#6366f1' :
                                        color === 'rose' ? '#f43f5e' :
                                            color === 'emerald' ? '#10b981' : '#f59e0b'
                                } stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, title]}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={
                                color === 'indigo' ? '#6366f1' :
                                    color === 'rose' ? '#f43f5e' :
                                        color === 'emerald' ? '#10b981' : '#f59e0b'
                            }
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Trends</h2>
                <p className="text-gray-500 dark:text-gray-400">6-Month historical analysis (Simulated).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard
                    title="Total Income"
                    dataKey="Income"
                    color="indigo"
                    icon={DollarSign}
                    gradientId="colorIncome"
                />
                <ChartCard
                    title="Total Expenses"
                    dataKey="Expenses"
                    color="rose"
                    icon={TrendingDown}
                    gradientId="colorExpenses"
                />
                <ChartCard
                    title="Net Savings"
                    dataKey="Savings"
                    color="emerald"
                    icon={TrendingUp}
                    gradientId="colorSavings"
                />
                <ChartCard
                    title="Total Debt"
                    dataKey="Debt"
                    color="amber"
                    icon={Activity}
                    gradientId="colorDebt"
                />
            </div>
        </div>
    );
}
